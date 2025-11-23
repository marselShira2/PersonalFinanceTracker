import { Component, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { finalize } from 'rxjs/operators';
import { Table } from 'primeng/table';

import { Transaction, TransactionService, TransactionCreateDto, TransactionUpdateDto } from '../../services/transaction/transaction.service';
// 1. Import CategoryService and Category interface
import { Category, CategoryService } from '../../services/categories/category.service';


@Component({
  selector: 'app-transactions-list',
  templateUrl: './transactions-list.component.html',
  styleUrls: ['./transactions-list.component.css']
})
export class TransactionsListComponent implements OnInit {

  @ViewChild('dt') dt: Table | undefined;

  // Optional: To support form submission via dialog footer, though not needed yet.
  // @ViewChild('transactionForm') transactionForm!: NgForm; 

  // Data
  transactions: Transaction[] = []; // The dataset displayed by PrimeNG table
  isLoading = true;

  // Filtering State
  // The backend supports 'Income' or 'Expense'
  currentFilterType: 'Income' | 'Expense' | undefined = undefined;

  // Modals/Dialogs State
  isDeleteModalOpen = false;
  transactionToDeleteId: number | null = null;

  isTransactionModalOpen = false; // Controls the Create/Edit dialog visibility
  isEditMode = false; // New state flag

  // Form Model - used for both Create (TransactionCreateDto) and Edit (TransactionUpdateDto)
  selectedTransaction: Transaction | TransactionCreateDto;

  // Dropdown Data
  currencies = ['USD', 'EUR', 'GBP'];
  // 2. Changed categories to be dynamic, initially empty
  categories: Category[] = [];

  // 3. Inject CategoryService
  constructor(
    private transactionService: TransactionService,
    private categoryService: CategoryService
  ) {
    this.selectedTransaction = this.resetTransactionForm();
  }

  ngOnInit(): void {
    // Load data with the initial (undefined) filter
    this.loadTransactions();
    // 4. Load categories on initialization
    this.loadCategories();
  }

  /**
   * Resets the form model to initial state for a new transaction.
   */
  resetTransactionForm(): TransactionCreateDto {
    return {
      type: 'Expense',
      amount: 0,
      currency: 'USD',
      date: new Date(),
      // Default to the first category found, or 0/null if categories is empty.
      categoryId: this.categories.length > 0 ? this.categories[0].categoryId : 0,
      description: '',
      isRecurring: false
    };
  }

  /**
   * Fetches all categories for the current user from the API.
   */
  loadCategories(): void {
    // No need to set isLoading here, as it's primarily for the transaction table
    this.categoryService.getCategories()
      .subscribe({
        next: (data) => {
          this.categories = data;
          // Optional: If the form was reset before categories loaded, reset again
          if (!this.isTransactionModalOpen && !this.isEditMode) {
            this.selectedTransaction = this.resetTransactionForm();
          }
        },
        error: (err) => {
          console.error('Failed to load categories', err);
        }
      });
  }

  // --- Data Loading & Filtering (API-based) ---
  /**
   * Fetches transactions from the backend API based on the current filter state.
   */
  loadTransactions(): void {
    this.isLoading = true;

    // Pass the current filter type to the API
    this.transactionService.getTransactions(this.currentFilterType)
      .pipe(finalize(() => this.isLoading = false))
      .subscribe({
        next: (data) => {
          // The API returns the DateOnly as a string (YYYY-MM-DD), 
          // convert it to a Date object for the calendar component binding.
          this.transactions = data.map(t => ({
            ...t,
            date: new Date(t.date as string)
          }));
        },
        error: (err) => {
          console.error('Failed to load transactions. Check console for 401 Unauthorized error.', err);
        }
      });
  }

  /**
   * Applies the transaction type filter and reloads data from the API.
   */
  applyFilter(type: 'Income' | 'Expense' | undefined): void {
    this.currentFilterType = type;
    this.loadTransactions(); // API is responsible for filtering
  }

  // --- Create/Edit Modal ---
  openCreateModal(): void {
    this.isEditMode = false;
    this.selectedTransaction = this.resetTransactionForm(); // Reset form for new creation
    this.isTransactionModalOpen = true;
  }

  async editTransaction(id: number): Promise<void> {
    this.isLoading = true;
    this.isEditMode = true;

    // Convert Observable to Promise for async/await simplicity in edit flow
    try {
      // Fetch the specific transaction from the API
      const transaction = await this.transactionService.getTransaction(id).toPromise();

      // Set the date to a JS Date object for the p-calendar to bind correctly
      this.selectedTransaction = {
        ...transaction,
        // The API returns a string, so we convert it back to a Date object
        date: new Date(transaction?.date as string)
      } as Transaction;

      this.isTransactionModalOpen = true;
    } catch (err) {
      console.error(`Failed to fetch transaction ${id}`, err);
      // Replaced alert
      console.error('Error loading transaction for editing.');
    } finally {
      this.isLoading = false;
    }
  }

  closeTransactionModal(): void {
    this.isTransactionModalOpen = false;
    // Clear the form model just in case
    this.selectedTransaction = this.resetTransactionForm();
  }

  saveTransaction(form: NgForm): void {
    if (form.invalid) {
      // Replaced alert
      console.error('Please fill out all required fields correctly.');
      return;
    }

    // Cast the form model to the appropriate DTO type
    const dto = this.selectedTransaction;

    if (this.isEditMode) {
      // 1. UPDATE LOGIC
      const updateDto: TransactionUpdateDto = dto as TransactionUpdateDto;
      const id = (dto as Transaction).transactionId; // Get ID from the Transaction interface

      this.transactionService.updateTransaction(id, updateDto)
        .subscribe({
          next: () => {
            this.closeTransactionModal();
            this.loadTransactions();
          },
          error: (err) => {
            console.error('Failed to update transaction:', err);
            // Replaced alert
            console.error('Error updating transaction. Check console for details.');
          }
        });
    } else {
      // 2. CREATE LOGIC
      const createDto: TransactionCreateDto = dto as TransactionCreateDto;

      this.transactionService.createTransaction(createDto)
        .subscribe({
          next: () => {
            this.closeTransactionModal();
            this.loadTransactions();
          },
          error: (err) => {
            console.error('Failed to create transaction:', err);
            // Replaced alert
            console.error('Error creating transaction. Check console for details.');
          }
        });
    }
  }

  // --- Deletion ---
  openDeleteModal(id: number): void {
    this.transactionToDeleteId = id;
    this.isDeleteModalOpen = true;
  }

  closeDeleteModal(): void {
    this.isDeleteModalOpen = false;
    this.transactionToDeleteId = null;
  }

  confirmDelete(): void {
    if (this.transactionToDeleteId !== null) {
      this.transactionService.deleteTransaction(this.transactionToDeleteId)
        .subscribe({
          next: () => {
            this.closeDeleteModal();
            this.loadTransactions(); // Reload data
          },
          error: (err) => {
            console.error('Failed to delete transaction', err);
            // Replaced alert
            console.error('Error deleting transaction. Check console for details.');
            this.closeDeleteModal();
          }
        });
    }
  }
}
