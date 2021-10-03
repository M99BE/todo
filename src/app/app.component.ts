import {Component, OnInit} from '@angular/core';
import {DataHandlerService} from "./service/data-handler.service";
import {Task} from './model/Task';
import {Category} from "./model/Category";
import {Priority} from "./model/Priority";
import {zip} from "rxjs";
import {concatMap, map} from "rxjs/operators";
import {IntroService} from "./service/intro.service";
import {DeviceDetectorService} from "ngx-device-detector";
import {CategoryService} from "./data/dao/impl/category.service";
import {TaskService} from "./data/dao/impl/task.service";
import {TranslateService} from "@ngx-translate/core";

export const LANG_RU = 'ru';
export const LANG_EN = 'en';


@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styles: []
})

// компонент-контейнер (Smart, Container), который управляет другими  компонентами (Dumb, Presentational)
export class AppComponent implements OnInit {

  lang: string;

  // коллекция категорий с кол-вом незавершенных задач для каждой из них
  private categoryMap = new Map<Category, number>();

  private tasks: Task[];
  private categories: Category[]; // все категории
  private priorities: Priority[]; // все приоритеты

  // статистика
  private totalTasksCountInCategory: number;
  private completedCountInCategory: number;
  private uncompletedCountInCategory: number;
  private uncompletedTotalTasksCount: number;

  // показать/скрыть статистику
  private showStat = true;

  // выбранная категория
  private selectedCategory: Category = null; // null - значит будет выбрана категория "Все"
//Выбранная задача
  private selectedTask: Task= null;
  // поиск
  private searchTaskText = ''; // текущее значение для поиска задач
  private searchCategoryText = ''; // текущее значение для поиска категорий


  // фильтрация
  private priorityFilter: Priority;
  private statusFilter: boolean;

  // параметры бокового меню с категориями
  private menuOpened: boolean; // открыть-закрыть
  private menuMode: string; // тип выдвижения (поверх, с толканием и пр.)
  private menuPosition: string; // сторона
  private showBackdrop: boolean; // показывать фоновое затемнение или нет

  // тип устройства
  private isMobile: boolean;
  private isTablet: boolean;


  constructor(
    private dataHandler: DataHandlerService, // фасад для работы с данными
    private introService: IntroService, // вводная справоч. информация с выделением областей
    private deviceService: DeviceDetectorService, // для определения типа устройства (моб., десктоп, планшет)
    private categoryService: CategoryService,
    private taskServise: TaskService,
    private translateService: TranslateService,
  ) {

    // определяем тип запроса
    this.isMobile = deviceService.isMobile();
    this.isTablet = deviceService.isTablet();

    this.showStat = true ? !this.isMobile : false; // если моб. устройство, то по-умолчанию не показывать статистику

    this.setMenuValues(); // установить настройки меню

  }

  ngOnInit() {
    this.lang = LANG_RU;
    this.translateService.use(this.lang)

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
  private onAddCategory(category: Category): void {
    console.log(category);
    this.categoryService.add(category).subscribe(result => {
      this.selectedCategory = result;
      this.fillCategories();
    }, error => {
      console.log(error.error);
      console.log(error.error.exception);
    });
    // this.dataHandler.addCategory(title).subscribe(() => this.fillCategories());
  }


  // заполняет категории и кол-во невыполненных задач по каждой из них (нужно для отображения категорий)
  private fillCategories() {
    this.categoryService.getAll().subscribe(categories => {
      this.categories = categories
      if (this.categoryMap) {
        this.categoryMap.clear();
      }
      this.categories.forEach(cat => {
          this.categoryMap.set(cat, 2);
        }
      );

    });

    //
    // this.categories = this.categories.sort((a, b) => a.title.localeCompare(b.title));
    //
    // // для каждой категории посчитать кол-во невыполненных задач
    //
    // this.categories.forEach(cat => {
    //     this.dataHandler.getUncompletedCountInCategory(cat).subscribe(count => this.categoryMap.set(cat, count));
    // });

  }

  // поиск категории
  private onSearchCategory(title: string): void {

    this.searchCategoryText = title;

    this.dataHandler.searchCategories(title).subscribe(categories => {
      this.categories = categories;
      this.fillCategories();
    });
  }


  // изменение категории
  private onSelectCategory(category: Category): void {

    this.selectedCategory = category;

    this.updateTasksAndStat();

    if (this.isMobile) {
      this.menuOpened = false; // закрываем боковое меню
    }

  }


  // удаление категории
  private onDeleteCategory(category: Category) {
    this.categoryService.delete(category.id).subscribe((ccc) => {
      this.selectedCategory = null;
      this.fillCategories();
    }, error => {

    });
    // this.dataHandler.deleteCategory(category.id).subscribe(cat => {
    //   this.selectedCategory = null; // открываем категорию "Все"
    //   this.categoryMap.delete(cat); // не забыть удалить категорию из карты
    //   this.onSearchCategory(this.searchCategoryText);
    //   this.updateTasks();
    // });
  }

  // обновлении категории
  private onUpdateCategory(category: Category): void {
    this.categoryService.update(category).subscribe((m9)=>  {
      this.selectedCategory = null;
      this.fillCategories();
    }, error => {

      });
  }

  // обновление задачи
  private onUpdateTask(task: Task): void {

    this.taskServise.update(task).subscribe((m8) => {

      this.fillCategories();

      this.updateTasksAndStat();
    });

  }


  // удаление задачи
  private onDeleteTask(task: Task) {

    this.taskServise.delete(task.id).subscribe(resa =>{
      this.selectedTask=null;
        this.updateTasksAndStat();
    }

      // concatMap(task => {
      //     return this.dataHandler.getUncompletedCountInCategory(task.category).pipe(map(count => {
      //       return ({t: task, count});
      //     }));
      //   }
      // )).subscribe(result => {
      //
      // const t = result.t as Task;
      //
      // // если указана категория - обновляем счетчик для соотв. категории
      // // чтобы не обновлять весь список - обновим точечно
      // if (t.category) {
      //   this.categoryMap.set(t.category, result.count);
      // }
      //
      // this.updateTasksAndStat();

    );


  }


  // поиск задач
  private onSearchTasks(searchString: string): void {
    this.searchTaskText = searchString;
    this.updateTasksAndStat();
  }

  // фильтрация задач по статусу (все, решенные, нерешенные)
  private onFilterTasksByStatus(status: boolean): void {
    this.statusFilter = status;
    this.updateTasks();
  }

  // фильтрация задач по приоритету
  private onFilterTasksByPriority(priority: Priority): void {
    this.priorityFilter = priority;
    this.updateTasks();
  }

  // обновить список задач
  private updateTasks(): void {
    this.taskServise.getAll().subscribe(res =>{
      this.tasks = res;
    });
    // this.dataHandler.searchTasks(
    //   this.selectedCategory,
    //   this.searchTaskText,
    //   this.statusFilter,
    //   this.priorityFilter
    // ).subscribe((tasks: Task[]) => {
    //   this.tasks = tasks;
    // });
  }


  // добавление задачи
  private onAddTask(task: Task):void {
    this.taskServise.add(task).subscribe(r =>{
      this.selectedTask = r;
      this.updateTasksAndStat();
    }, error => {
      console.log(error.error);
      console.log(error.error.exception);
      console.log(this.selectedTask);
    });

    // this.taskServise.add(task).pipe(// сначала добавляем задачу
    //   concatMap(task => { // используем добавленный task (concatMap - для последовательного выполнения)
    //       // .. и считаем кол-во задач в категории с учетом добавленной задачи
    //       return this.dataHandler.getUncompletedCountInCategory(task.category).pipe(map(count => {
    //         return ({t: task, count}); // в итоге получаем массив с добавленной задачей и кол-вом задач для категории
    //       }));
    //     }
    //   )).subscribe(result => {
    //
    //   const t = result.t as Task;

      // если указана категория - обновляем счетчик для соотв. категории
      // чтобы не обновлять весь список - обновим точечно
    //   if (t.category) {
    //     this.categoryMap.set(t.category, result.count);
    //   }
    //
    //   this.updateTasksAndStat();
    //
    // });

  }


  // показывает задачи с применением всех текущий условий (категория, поиск, фильтры и пр.)
  private updateTasksAndStat(): void {

    this.updateTasks(); // обновить список задач

    // обновить переменные для статистики
    this.updateStat();

  }

  // обновить статистику
  private updateStat(): void {
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
  private toggleStat(showStat: boolean): void {
    this.showStat = showStat;
  }

  // если закрыли меню любым способом - ставим значение false
  private onClosedMenu() {
    this.menuOpened = false;
  }

  // параметры меню
  private setMenuValues() {

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
  private toggleMenu() {
    this.menuOpened = !this.menuOpened;
  }


}
