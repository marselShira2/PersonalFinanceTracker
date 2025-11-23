import { Component, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { finalize } from 'rxjs/operators';
import { Table } from 'primeng/table';

import { Transaction, TransactionService, TransactionCreateDto, TransactionUpdateDto } from '../../services/transaction/transaction.service';
import { Category, CategoryService } from '../../services/categories/category.service';

@Component({
  selector: 'app-transactions-list',
  templateUrl: './transactions-list.component.html',
  styleUrls: ['./transactions-list.component.css']
})
export class TransactionsListComponent implements OnInit {

  @ViewChild('dt') dt: Table | undefined;

  // Data
  transactions: Transaction[] = [];

  // 1. Loading State (Starts true to block page on load)
  isLoading = true;

  // Filtering State
  currentFilterType: 'Income' | 'Expense' | undefined = undefined;

  // Modals/Dialogs State
  isDeleteModalOpen = false;
  transactionToDeleteId: number | null = null;
  isTransactionModalOpen = false;
  isEditMode = false;

  selectedTransaction: Transaction | TransactionCreateDto;

  currencies = ['USD', 'EUR', 'GBP'];
  categories: Category[] = [];

  constructor(
    private transactionService: TransactionService,
    private categoryService: CategoryService
  ) {
    this.selectedTransaction = this.resetTransactionForm();
  }

  ngOnInit(): void {
    // Load categories first so dropdowns are ready
    this.loadCategories();
    this.loadTransactions();
  }

  resetTransactionForm(): TransactionCreateDto {
    return {
      type: 'Expense',
      amount: 0,
      currency: 'USD',
      date: new Date(),
      // Default to first category if available, else 0
      categoryId: this.categories.length > 0 ? this.categories[0].categoryId : 0,
      description: '',
      isRecurring: false
    };
  }

  loadCategories(): void {
    this.categoryService.getCategories()
      .subscribe({
        next: (data) => {
          this.categories = data;
          // If we are not currently editing/creating, reset form to ensure defaults are valid
          if (!this.isTransactionModalOpen && !this.isEditMode) {
            this.selectedTransaction = this.resetTransactionForm();
          }
        },
        error: (err) => console.error('Failed to load categories', err)
      });
  }
  loadTransactions(): void {
    // Log 1: Start of loading process and filter status
    console.log('--- Loading Transactions ---');
    console.log(`Applying filter type: ${this.currentFilterType ? this.currentFilterType : 'All'}`);

    this.isLoading = true; // Spinner ON

    this.transactionService.getTransactions(this.currentFilterType)
      .pipe(
        // Log 2: Log the state when the request completes (success or failure)
        finalize(() => {
          this.isLoading = false;
          console.log('--- Transaction Load Request Complete (Finalize) ---');
        })
      ) // Spinner OFF
      .subscribe({
        next: (data) => {
          // Log 3: Successful data reception and count
          console.log(`Successfully received ${data.length} transactions.`);
          // console.log('Received Data Sample:', data.slice(0, 5)); // Uncomment to see a data sample

          this.transactions = data.map(t => ({
            ...t,
            // Convert API string date to JS Date object
            date: new Date(t.date as string)
          }));

          // Log 4: Successful processing and final count
          console.log(`Transactions array updated with ${this.transactions.length} items.`);
        },
        error: (err) => {
          // Log 5: Log the specific error
          console.error('Failed to load transactions (Subscribe Error):', err);
        }
      });
  }

  applyFilter(type: 'Income' | 'Expense' | undefined): void {
    this.currentFilterType = type;
    this.loadTransactions();
  }

  openCreateModal(): void {
    this.isEditMode = false;
    this.selectedTransaction = this.resetTransactionForm();
    this.isTransactionModalOpen = true;
  }

  // --- CRITICAL FIX FOR EDITING ---
  async editTransaction(id: number): Promise<void> {
    this.isLoading = true;
    this.isEditMode = true;

    try {
      const transaction = await this.transactionService.getTransaction(id).toPromise();

      if (transaction) {
        this.selectedTransaction = {
          ...transaction,
          date: new Date(transaction.date as string),
          // ✅ The logic here is correct, but now it works because 
          // optionValue="categoryId" in HTML matches this value.
          categoryId: transaction.categoryId || transaction.category?.categoryId || 0
        } as Transaction;

        this.isTransactionModalOpen = true;
      }
    } catch (err) {
      console.error('Error loading transaction for editing.', err);
    } finally {
      this.isLoading = false;
    }
  }
  closeTransactionModal(): void {
    this.isTransactionModalOpen = false;
    this.selectedTransaction = this.resetTransactionForm();
  }

  saveTransaction(form: NgForm): void {
    debugger
    if (form.invalid) {
      console.error('Please fill out all required fields correctly.');
      return;
    }

    this.isLoading = true; // Spinner ON

    const dto = this.selectedTransaction;

    const handleComplete = () => {
      this.isLoading = false; // Spinner OFF
      this.closeTransactionModal();
      this.loadTransactions();
    };

    const handleError = (err: any) => {
      this.isLoading = false; // Spinner OFF
      console.error('Error saving transaction', err);
    };

    if (this.isEditMode) {
      const updateDto: TransactionUpdateDto = dto as TransactionUpdateDto;
      const id = (dto as Transaction).transactionId;

      this.transactionService.updateTransaction(id, updateDto)
        .subscribe({ next: handleComplete, error: handleError });
    } else {
      const createDto: TransactionCreateDto = dto as TransactionCreateDto;

      this.transactionService.createTransaction(createDto)
        .subscribe({ next: handleComplete, error: handleError });
    }
  }

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
      this.isLoading = true; // Spinner ON

      this.transactionService.deleteTransaction(this.transactionToDeleteId)
        .pipe(finalize(() => this.isLoading = false))
        .subscribe({
          next: () => {
            this.closeDeleteModal();
            this.loadTransactions();
          },
          error: (err) => {
            console.error('Error deleting transaction.', err);
            this.closeDeleteModal();
          }
        });
    }
  }
}
