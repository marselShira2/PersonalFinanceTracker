import { Observable, Subject } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Category } from '../categories/category.service';
import { tap } from 'rxjs/operators';
 
export interface TransactionCreateDto {
  type: string;
  amount: number;
  currency: string; 
  date: Date; // Keep as Date for component use
  categoryId?: number;
  description?: string;
  isRecurring: boolean;
}

/**
 * Data Transfer Object for updating an existing transaction.
 * All fields are optional (C# nullable).
 */
export interface TransactionUpdateDto {
  type?: string;
  amount?: number;
  currency?: string;
  // NOTE: Date is also a JS Date object and must be formatted.
  date?: Date; // Keep as Date for component use
  categoryId?: number;
  description?: string;
  isRecurring?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class TransactionService {
  apiUrl: string = environment.apiUrl + "/Transactions";
  
  // Subject to notify when transactions are created (for notification refresh)
  private transactionCreated = new Subject<void>();
  public transactionCreated$ = this.transactionCreated.asObservable();

  constructor(private http: HttpClient) { }

  /**
   * Fetches transactions from the API with optional filtering.
   * C# Route: GET /api/Transactions
   */
  getTransactions(type?: string, isRecurring?: boolean): Observable<Transaction[]> {
    let params = new HttpParams();

    // Log the full controller URL for debugging
    console.log("Fetching transactions from:", this.apiUrl);

    if (type) {
      params = params.set('type', type);
    }
    if (isRecurring !== undefined && isRecurring !== null) {
      params = params.set('isRecurring', isRecurring.toString());
    }

    return this.http.get<Transaction[]>(this.apiUrl, { params: params });
  }

  /**
   * Fetches a single transaction by ID.
   * C# Route: GET /api/Transactions/{id}
   */
  getTransaction(id: number): Observable<Transaction> {
    return this.http.get<Transaction>(`${this.apiUrl}/${id}`);
  }

  /**
   * Creates a new transaction.
   * C# Route: POST /api/Transactions/create
   */
  createTransaction(dto: TransactionCreateDto): Observable<Transaction> {
    const formattedDto = this.formatDateDto(dto);
    const createUrl = `${this.apiUrl}/create`;
    return this.http.post<Transaction>(createUrl, formattedDto).pipe(
      tap(() => {
        // Notify that a transaction was created (for notification refresh)
        this.transactionCreated.next();
      })
    );
  }

  /**
   * Updates an existing transaction.
   * C# Route: PUT /api/Transactions/{id}
   */
  updateTransaction(id: number, dto: TransactionUpdateDto): Observable<Transaction> {
    const formattedDto = this.formatDateDto(dto);
    return this.http.put<Transaction>(`${this.apiUrl}/${id}`, formattedDto);
  }

  /**
   * Deletes a transaction.
   * C# Route: DELETE /api/Transactions/{id}
   */
  deleteTransaction(id: number): Observable<void> {
    debugger
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  /**
   * Helper function to format the Date object to a YYYY-MM-DD string
   * for the C# DateOnly type compatibility.
   */
  private formatDateDto<T extends { date?: Date | string }>(dto: T): T {
    if (dto.date instanceof Date) {
      // Format as YYYY-MM-DD string
      const date = dto.date;
      const year = date.getFullYear();
      // Month is 0-indexed, so add 1
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');

      return {
        ...dto,
        date: `${year}-${month}-${day}`
      };
    }
    return dto; // Return as is if date is already a string or null/undefined
  }


  uploadCsv(file: File): Observable<any> {
    const formData: FormData = new FormData();
    // 'file' here must match the parameter name used in your ASP.NET Core controller action (e.g., IFormFile file)
    formData.append('file', file, file.name);

    // Assuming the transactions controller URL is 'api/transactions'
    // and the import endpoint is 'api/transactions/import'
    return this.http.post(`${this.apiUrl}/import`, formData);


  }
}
 
export interface Transaction {
  transactionId: number;
  type: string;
  amount: number;
  currency: string;
  date: string | Date; // Can be string from API or Date after parsing/setting
  isRecurring: boolean;
  categoryId?: number;
  description?: string;
  category?: Category;
}
