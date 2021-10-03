import {Inject, Injectable, InjectionToken} from '@angular/core';
import {CommonDAO} from "../interface/CommonDAO";
import {Priority} from "../../../model/Priority";
import {Observable} from "rxjs";
import {HttpClient} from "@angular/common/http";
import {TASK_URL_TOKEN} from "./task.service";
import {Task} from "../../../model/Task";
import {Category} from "../../../model/Category";

export const PRIORITY_URL_TOKEN = new InjectionToken<string>('url');

@Injectable({
  providedIn: 'root'
})
export class PriorityService implements CommonDAO<Priority>{


  constructor(@Inject(PRIORITY_URL_TOKEN) private baseUrl: string,
              private http: HttpClient) { }

  add(priority: Priority): Observable<Priority> {
    return this.http.put<Priority>(this.baseUrl + '/add', priority);;
  }

  delete(id: number): Observable<Priority> {
    return this.http.post<Priority>(this.baseUrl + '/delete', id);;
  }

  get(id: number): Observable<Priority> {
    return this.http.post<Priority>(this.baseUrl + '/id', id);
  }

  getAll(): Observable<Priority[]> {
    return this.http.post<Priority[]>(this.baseUrl + '/all', null);
  }

  update(priority: Priority): Observable<Priority> {
    return this.http.patch<Priority>(this.baseUrl + '/update', priority);
  }

}
