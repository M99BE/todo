import {Priority} from "../Priority";
import {Category} from "../Category";

export class SearchTask {
  completed ?: boolean;
  priorityId ?: number;
  title ?: string;
  categoryTitle?: string;
  pageNumber: number=0;
  pageSize: number=5;


  constructor(completed: boolean, priorityId: number, title: string,  categoryTitle?: string) {
    this.completed = completed;
    this.priorityId = priorityId;
    this.title = title;
    this.categoryTitle = categoryTitle;
  }
}
