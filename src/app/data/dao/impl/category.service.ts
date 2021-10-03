import {Inject, Injectable, InjectionToken} from '@angular/core';
import {CommonDAO} from "../interface/CommonDAO";
import {Category} from "../../../model/Category";
import {Observable} from "rxjs";
import {HttpClient} from "@angular/common/http";

export const CATEGORY_URL_TOKEN = new InjectionToken<string>('url');


@Injectable({
  providedIn: 'root'
})
export class CategoryService implements CommonDAO<Category>{

  constructor(@Inject(CATEGORY_URL_TOKEN) private baseUrl: string,
              private http: HttpClient) {

  }


  add(category: Category): Observable<Category> {
    return this.http.put<Category>(this.baseUrl + '/add', category);
  }

  delete(id: number): Observable<Category> {
    return this.http.post<Category>(this.baseUrl + '/delete', id);
  }

  get(id: number): Observable<Category> {
    return this.http.post<Category>(this.baseUrl + '/id', id);
  }

  getAll(): Observable<Category[]> {
    return this.http.post<Category[]>(this.baseUrl + '/all', null);
  }

  update(category: Category): Observable<Category> {
    return this.http.patch<Category>(this.baseUrl + '/update', category);
  }
}
