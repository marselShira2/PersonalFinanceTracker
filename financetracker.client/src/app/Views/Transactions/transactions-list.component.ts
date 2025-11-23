import { Component, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { finalize } from 'rxjs/operators';
import { Table } from 'primeng/table';

import { Transaction, TransactionService, TransactionCreateDto, TransactionUpdateDto } from '../../services/transaction/transaction.service';

@Component({
  selector: 'app-transactions-list',
  templateUrl: './transactions-list.component.html',
  styleUrls: ['./transactions-list.component.css']
})
export class TransactionsListComponent implements OnInit {

  @ViewChild('dt') dt: Table | undefined;

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
  // We use the full Transaction type to handle both cases, casting for the service call.
  selectedTransaction: Transaction | TransactionCreateDto;

  // Dropdown Data
  currencies = ['USD', 'EUR', 'GBP'];
  categories = [
    { id: 1, name: 'Groceries' },
    { id: 2, name: 'Salary' },
    { id: 3, name: 'Rent' }
  ];

  constructor(private transactionService: TransactionService) {
    this.selectedTransaction = this.resetTransactionForm();
  }

  ngOnInit(): void {
    // Load data with the initial (undefined) filter
    this.loadTransactions();
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
      categoryId: 1,
      description: '',
      isRecurring: false
    };
  }
  loadTransactions(): void {
    this.isLoading = true;

    const USE_STATIC_DATA = true;

    if (USE_STATIC_DATA) {
      this.transactions = [
        {
          transactionId: 1,
          type: 'Income',
          amount: 1200,
          currency: 'EUR',
          date: new Date('2025-01-05'),
          categoryId: 2,
          description: 'Monthly salary',
          isRecurring: true
        },
        {
          transactionId: 2,
          type: 'Expense',
          amount: 85.50,
          currency: 'EUR',
          date: new Date('2025-01-09'),
          categoryId: 1,
          description: 'Groceries',
          isRecurring: false
        },
        {
          transactionId: 3,
          type: 'Expense',
          amount: 350,
          currency: 'EUR',
          date: new Date('2025-01-10'),
          categoryId: 3,
          description: 'Apartment rent',
          isRecurring: true
        },
        {
          transactionId: 4,
          type: 'Income',
          amount: 250,
          currency: 'USD',
          date: new Date('2025-01-12'),
          categoryId: 2,
          description: 'Freelance design project',
          isRecurring: false
        },
        {
          transactionId: 5,
          type: 'Expense',
          amount: 49.99,
          currency: 'USD',
          date: new Date('2025-01-13'),
          categoryId: 1,
          description: 'Restaurant dinner',
          isRecurring: false
        },
        {
          transactionId: 6,
          type: 'Expense',
          amount: 15.25,
          currency: 'EUR',
          date: new Date('2025-01-14'),
          categoryId: 1,
          description: 'Coffee and snacks',
          isRecurring: false
        },
        {
          transactionId: 7,
          type: 'Income',
          amount: 180,
          currency: 'EUR',
          date: new Date('2025-01-15'),
          categoryId: 2,
          description: 'Bonus payout',
          isRecurring: false
        },
        {
          transactionId: 8,
          type: 'Expense',
          amount: 60,
          currency: 'EUR',
          date: new Date('2025-01-16'),
          categoryId: 3,
          description: 'Electricity bill',
          isRecurring: true
        },
        {
          transactionId: 9,
          type: 'Expense',
          amount: 25,
          currency: 'EUR',
          date: new Date('2025-01-17'),
          categoryId: 1,
          description: 'Gym pass',
          isRecurring: false
        },
        {
          transactionId: 10,
          type: 'Income',
          amount: 320,
          currency: 'USD',
          date: new Date('2025-01-18'),
          categoryId: 2,
          description: 'Part-time teaching',
          isRecurring: false
        },
        {
          transactionId: 11,
          type: 'Expense',
          amount: 12.99,
          currency: 'EUR',
          date: new Date('2025-01-19'),
          categoryId: 1,
          description: 'Streaming subscription',
          isRecurring: true
        },
        {
          transactionId: 12,
          type: 'Expense',
          amount: 90,
          currency: 'EUR',
          date: new Date('2025-01-20'),
          categoryId: 3,
          description: 'Internet bill',
          isRecurring: true
        },
        {
          transactionId: 13,
          type: 'Income',
          amount: 500,
          currency: 'EUR',
          date: new Date('2025-01-21'),
          categoryId: 2,
          description: 'Project milestone payment',
          isRecurring: false
        },
        {
          transactionId: 14,
          type: 'Expense',
          amount: 140,
          currency: 'EUR',
          date: new Date('2025-01-22'),
          categoryId: 1,
          description: 'Clothing purchase',
          isRecurring: false
        },
        {
          transactionId: 15,
          type: 'Expense',
          amount: 7.5,
          currency: 'EUR',
          date: new Date('2025-01-23'),
          categoryId: 1,
          description: 'Bus ticket',
          isRecurring: false
        }
      ];


      this.isLoading = false;
      return;
    }
     
  }

  // --- Data Loading & Filtering (Now API-based) ---
  //loadTransactions(): void {
  //  this.isLoading = true;
  //  // Pass the current filter type to the API
  //  this.transactionService.getTransactions(this.currentFilterType)
  //    .pipe(finalize(() => this.isLoading = false))
  //    .subscribe({
  //      next: (data) => {
  //        // The API returns the DateOnly as a string, convert it to a Date object for the calendar component
  //        this.transactions = data.map(t => ({
  //          ...t,
  //          date: new Date(t.date as string)
  //        }));
  //      },
  //      error: (err) => {
  //        console.error('Failed to load transactions', err);
  //        alert('Failed to load transactions. Check console.');
  //      }
  //    });
  //}

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
    try {
      const transaction = await this.transactionService.getTransaction(id).toPromise();

      // Set the date to a JS Date object for the p-calendar to bind correctly
      this.selectedTransaction = {
        ...transaction,
        date: new Date(transaction?.date as string)
      } as Transaction;

      this.isTransactionModalOpen = true;
    } catch (err) {
      console.error(`Failed to fetch transaction ${id}`, err);
      alert('Error loading transaction for editing.');
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
      alert('Please fill out all required fields correctly.');
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
            alert('Error updating transaction. Check console for details.');
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
            alert('Error creating transaction. Check console for details.');
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
            alert('Error deleting transaction. Check console for details.');
            this.closeDeleteModal();
          }
        });
    }
  }
}
