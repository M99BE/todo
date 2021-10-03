import {Component, OnInit} from '@angular/core';
import {DataHandlerService} from "./service/data-handler.service";
import {Task} from './model/Task';
import {Category} from "./model/Category";
import {Priority} from "./model/Priority";
import {zip} from "rxjs";
import {concatMap, map} from "rxjs/operators";
import {IntroService} from "./service/intro.service";
import {DeviceDetectorService} from "ngx-device-detector";

@Component({
    selector: 'app-root',
    templateUrl: 'app.component.html',
    styles: []
})

// компонент-контейнер (Smart, Container), который управляет другими  компонентами (Dumb, Presentational)
export class AppComponent implements OnInit {

    // коллекция категорий с кол-вом незавершенных задач для каждой из них
    categoryMap = new Map<Category, number>();

    tasks: Task[];
    categories: Category[]; // все категории
    priorities: Priority[]; // все приоритеты

    // статистика
    totalTasksCountInCategory: number;
    completedCountInCategory: number;
    uncompletedCountInCategory: number;
    uncompletedTotalTasksCount: number;

    // показать/скрыть статистику
    showStat = true;

    // выбранная категория
    selectedCategory: Category = null; // null - значит будет выбрана категория "Все"

    // поиск
    searchTaskText = ''; // текущее значение для поиска задач
    searchCategoryText = ''; // текущее значение для поиска категорий


    // фильтрация
    priorityFilter: Priority;
    statusFilter: boolean;

    // параметры бокового меню с категориями
    menuOpened: boolean; // открыть-закрыть
    menuMode: string; // тип выдвижения (поверх, с толканием и пр.)
    menuPosition: string; // сторона
    showBackdrop: boolean; // показывать фоновое затемнение или нет

    // тип устройства
    isMobile: boolean;
    isTablet: boolean;


    constructor(
        private dataHandler: DataHandlerService, // фасад для работы с данными
        private introService: IntroService, // вводная справоч. информация с выделением областей
        private deviceService: DeviceDetectorService // для определения типа устройства (моб., десктоп, планшет)
    ) {

        // определяем тип запроса
        this.isMobile = deviceService.isMobile();
        this.isTablet = deviceService.isTablet();
        this.showStat = true ? !this.isMobile : false; // если моб. устройство, то по-умолчанию не показывать статистику

        this.setMenuValues(); // установить настройки меню

    }

    ngOnInit() {
        this.dataHandler.getAllPriorities().subscribe(priorities => this.priorities = priorities);
        this.dataHandler.getAllCategories().subscribe(categories => this.categories = categories);

        // заполнить меню с категориями
        this.fillCategories();

        // по-умолчанию показать все задачи (будет выбрана категория Все)
        this.onSelectCategory(null);
        // для мобильных и планшетов - не показывать интро
        if (!this.isMobile && !this.isTablet) {
            // пробуем показать приветственные справочные материалы
            this.introService.startIntroJS(true);
        }

    }


    // добавление категории
    onAddCategory(title: string): void {
        this.dataHandler.addCategory(title).subscribe(() => this.fillCategories());
    }



    // заполняет категории и кол-во невыполненных задач по каждой из них (нужно для отображения категорий)
    fillCategories() {

        if (this.categoryMap) {
            this.categoryMap.clear();
        }

        this.categories = this.categories.sort((a, b) => a.title.localeCompare(b.title));

        // для каждой категории посчитать кол-во невыполненных задач

        this.categories.forEach(cat => {
            this.dataHandler.getUncompletedCountInCategory(cat).subscribe(count => this.categoryMap.set(cat, count));
        });

    }

    // поиск категории
    onSearchCategory(title: string): void {

        this.searchCategoryText = title;

        this.dataHandler.searchCategories(title).subscribe(categories => {
            this.categories = categories;
			this.fillCategories();
        });
    }


    // изменение категории
    onSelectCategory(category: Category): void {

        this.selectedCategory = category;

        this.updateTasksAndStat();

        if (this.isMobile) {
            this.menuOpened = false; // закрываем боковое меню
        }

    }



    // удаление категории
    onDeleteCategory(category: Category) {
        this.dataHandler.deleteCategory(category.id).subscribe(cat => {
            this.selectedCategory = null; // открываем категорию "Все"
            this.categoryMap.delete(cat); // не забыть удалить категорию из карты
            this.onSearchCategory(this.searchCategoryText);
            this.updateTasks();
        });
    }

    // обновлении категории
    onUpdateCategory(category: Category): void {
        this.dataHandler.updateCategory(category).subscribe(() => {
            this.onSearchCategory(this.searchCategoryText);
        });
    }

    // обновление задачи
    onUpdateTask(task: Task): void {

        this.dataHandler.updateTask(task).subscribe(() => {

            this.fillCategories();

            this.updateTasksAndStat();
        });

    }


    // удаление задачи
    onDeleteTask(task: Task) {

        this.dataHandler.deleteTask(task.id).pipe(
            concatMap(task => {
                    return this.dataHandler.getUncompletedCountInCategory(task.category).pipe(map(count => {
                        return ({t: task, count});
                    }));
                }
            )).subscribe(result => {

            const t = result.t as Task;

			// если указана категория - обновляем счетчик для соотв. категории
            // чтобы не обновлять весь список - обновим точечно
            if (t.category) {
                this.categoryMap.set(t.category, result.count);
            }

            this.updateTasksAndStat();

        });


    }


    // поиск задач
    onSearchTasks(searchString: string): void {
        this.searchTaskText = searchString;
        this.updateTasks();
    }

    // фильтрация задач по статусу (все, решенные, нерешенные)
    onFilterTasksByStatus(status: boolean): void {
        this.statusFilter = status;
        this.updateTasks();
    }

    // фильтрация задач по приоритету
    onFilterTasksByPriority(priority: Priority): void {
        this.priorityFilter = priority;
        this.updateTasks();
    }

    // обновить список задач
    updateTasks(): void {
        this.dataHandler.searchTasks(
            this.selectedCategory,
            this.searchTaskText,
            this.statusFilter,
            this.priorityFilter
        ).subscribe((tasks: Task[]) => {
            this.tasks = tasks;
        });
    }


    // добавление задачи
    onAddTask(task: Task) {


        this.dataHandler.addTask(task).pipe(// сначала добавляем задачу
            concatMap(task => { // используем добавленный task (concatMap - для последовательного выполнения)
                    // .. и считаем кол-во задач в категории с учетом добавленной задачи
                    return this.dataHandler.getUncompletedCountInCategory(task.category).pipe(map(count => {
                        return ({t: task, count}); // в итоге получаем массив с добавленной задачей и кол-вом задач для категории
                    }));
                }
            )).subscribe(result => {

            const t = result.t as Task;

			// если указана категория - обновляем счетчик для соотв. категории
            // чтобы не обновлять весь список - обновим точечно
            if (t.category) {
                this.categoryMap.set(t.category, result.count);
            }

            this.updateTasksAndStat();

        });

    }


    // показывает задачи с применением всех текущий условий (категория, поиск, фильтры и пр.)
    updateTasksAndStat(): void {

        this.updateTasks(); // обновить список задач

        // обновить переменные для статистики
        this.updateStat();

    }

    // обновить статистику
    updateStat(): void {
        zip(
            this.dataHandler.getTotalCountInCategory(this.selectedCategory),
            this.dataHandler.getCompletedCountInCategory(this.selectedCategory),
            this.dataHandler.getUncompletedCountInCategory(this.selectedCategory),
            this.dataHandler.getUncompletedTotalCount())

            .subscribe(array => {
                this.totalTasksCountInCategory = array[0];
                this.completedCountInCategory = array[1];
                this.uncompletedCountInCategory = array[2];
                this.uncompletedTotalTasksCount = array[3]; // нужно для категории Все
            });
    }

    // показать-скрыть статистику
    toggleStat(showStat: boolean): void {
        this.showStat = showStat;
    }

    // если закрыли меню любым способом - ставим значение false
    onClosedMenu() {
        this.menuOpened = false;
    }

    // параметры меню
    setMenuValues() {
        this.menuPosition = 'left'; // меню слева

        // настройки бокового меню для моб. и десктоп вариантов
        if (this.isMobile) {
            this.menuOpened = false; // на моб. версии по-умолчанию меню будет закрыто
            this.menuMode = 'over'; // поверх всего контента
            this.showBackdrop = true; // показывать темный фон или нет (нужно для мобильной версии)
        } else {
            this.menuOpened = true; // НЕ в моб. версии  по-умолчанию меню будет открыто (т.к. хватает места)
            this.menuMode = 'push'; // будет "толкать" основной контент, а не закрывать его
            this.showBackdrop = false; // показывать темный фон или нет
        }
    }

    // показать-скрыть меню
    toggleMenu() {
      console.log(this.menuOpened);
        this.menuOpened = !this.menuOpened;
    }


}
