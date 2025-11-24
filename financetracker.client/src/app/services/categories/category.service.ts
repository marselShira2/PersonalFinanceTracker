// FinanceTracker.Client/src/app/services/category/category.service.ts

import { Observable } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

/**
 * Interface representing a full Category entity returned from the API.
 */
export interface Category {
  categoryId: number;
  userId: number;
  name: string;
  type: 'Income' | 'Expense';
  icon?: string;
}

/**
 * Data Transfer Object for creating a new category.
 */
export interface CategoryCreateDto {
  name: string;
  type: 'Income' | 'Expense';
  icon?: string;
}

/**
 * Data Transfer Object for updating an existing category.
 * All fields are optional.
 */
export interface CategoryUpdateDto {
  name?: string;
  type?: 'Income' | 'Expense';
  icon?: string;
}


@Injectable({
  providedIn: 'root'
})
export class CategoryService {

  // Base path for the Categories Controller: /api/Categories
  private apiUrl: string = environment.apiUrl + "/Categories";

  constructor(private http: HttpClient) { }

  /**
   * Fetches categories from the API with optional filtering.
   * C# Route: GET /api/Categories
   */
  getCategories(type?: 'Income' | 'Expense'): Observable<Category[]> {
    let params = new HttpParams();

    if (type) {
      params = params.set('type', type);
    }

    return this.http.get<Category[]>(this.apiUrl, { params: params });
  }

  /**
   * Fetches a single category by ID.
   * C# Route: GET /api/Categories/{id}
   */
  getCategory(id: number): Observable<Category> {
    return this.http.get<Category>(`${this.apiUrl}/${id}`);
  }

  /**
   * Creates a new category.
   * C# Route: POST /api/Categories
   */
  createCategory(dto: CategoryCreateDto): Observable<Category> {
    return this.http.post<Category>(this.apiUrl, dto);
  }

  /**
   * Updates an existing category.
   * C# Route: PUT /api/Categories/{id}
   */
  updateCategory(id: number, dto: CategoryUpdateDto): Observable<Category> {
    return this.http.put<Category>(`${this.apiUrl}/${id}`, dto);
  }

  /**
   * Deletes a category.
   * C# Route: DELETE /api/Categories/{id}
   */
  deleteCategory(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
