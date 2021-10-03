import {CategoryDAO} from '../interface/CategoryDAO';
import {TestData} from '../../TestData';
import {Category} from '../../../model/Category';
import {Observable, of} from 'rxjs';

// реализация работы с приоритетами в виде массивов
// все методы DAO возвращают тип Observable, для реактивных возможностей
// для работы с БД - нужно изменить реализацию каждого метода, чтобы обращался не к массивам, а делал RESTful запрос или напрямую к БД
export class CategoryDAOArray implements CategoryDAO {

    get(id: number): Observable<Category> {

        return of(TestData.categories.find(category => category.id === id));
    }

    getAll(): Observable<Category[]> {

        TestData.categories.sort((c1, c2) => c1.title.localeCompare(c2.title)); // по алфавиту
        return of(TestData.categories);
    }

    add(category: Category): Observable<Category> {

        // если id пустой - генерируем его
        if (category.id === null || category.id === 0) {
            category.id = this.getLastIdCategory();
        }

        TestData.categories.push(category);

        return of(category);
    }

    delete(id: number): Observable<Category> {

        // перед удалением - нужно в задачах занулить все ссылки на удаленное значение
        // в реальной БД сама обновляет все ссылки (cascade update) - здесь нам приходится делать это вручную (т.к. вместо БД - массив)
        TestData.tasks.forEach(task => {
            if (task.category && task.category.id === id) {
                task.category = null;
            }
        });

        const tmpCategory = TestData.categories.find(t => t.id === id); // удаляем по id
        TestData.categories.splice(TestData.categories.indexOf(tmpCategory), 1);

        return of(tmpCategory);

    }

    update(category: Category): Observable<Category> {

        const tmpCategory = TestData.categories.find(t => t.id === category.id); // обновляем по id
        TestData.categories.splice(TestData.categories.indexOf(tmpCategory), 1, category);

        return of(tmpCategory);
    }


    // находит последний id (чтобы потом вставить новую запись с id, увеличенным на 1) - в реальной БД это происходит автоматически
    private getLastIdCategory(): number {
        return Math.max.apply(Math, TestData.categories.map(c => c.id)) + 1;
    }

    // поиск категорий по названию
    search(title: string): Observable<Category[]> {

        return of(TestData.categories.filter(
            cat => cat.title.toUpperCase().includes(title.toUpperCase()))
            .sort((c1, c2) => c1.title.localeCompare(c2.title)));
    }


}
