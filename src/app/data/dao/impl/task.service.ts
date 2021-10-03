import {Inject, Injectable, InjectionToken} from '@angular/core';
import {CommonDAO} from "../interface/CommonDAO";
import {Category} from "../../../model/Category";
import {Task} from "../../../model/Task";
import {Observable} from "rxjs";
import {HttpClient} from "@angular/common/http";
import {CATEGORY_URL_TOKEN} from "./category.service";

export const TASK_URL_TOKEN = new InjectionToken<string>('url');

@Injectable({
  providedIn: 'root'
})
export class TaskService implements CommonDAO<Task>{

  constructor(@Inject(TASK_URL_TOKEN) private baseUrl: string,
              private http: HttpClient) { }

  add(task: Task): Observable<Task> {
    return this.http.put<Task>(this.baseUrl + '/add', task);;
  }

  delete(id: number): Observable<Task> {
    return this.http.post<Task>(this.baseUrl + '/delete', id);;
  }

  get(id: number): Observable<Task> {
    return this.http.post<Task>(this.baseUrl + '/id', id);
  }

  getAll(): Observable<Task[]> {
    return this.http.post<Task[]>(this.baseUrl + '/all', null);
  }

  update(task: Task): Observable<Task> {
    return this.http.patch<Task>(this.baseUrl + '/update', task);
  }
}
