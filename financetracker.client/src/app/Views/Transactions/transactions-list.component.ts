import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { NgForm } from '@angular/forms';
import { finalize } from 'rxjs/operators';
import { Table } from 'primeng/table';
import { MessageService } from 'primeng/api';
import { Transaction, TransactionService, TransactionCreateDto, TransactionUpdateDto } from '../../services/transaction/transaction.service';
import { Category, CategoryService } from '../../services/categories/category.service';
import { CurrencyService } from '../../services/currency.service';

@Component({
  selector: 'app-transactions-list',
  templateUrl: './transactions-list.component.html',
  styleUrls: ['./transactions-list.component.css']
})
export class TransactionsListComponent implements OnInit {

  @ViewChild('dt') dt: Table | undefined;
  @ViewChild('photoInput') photoInput: ElementRef | undefined;

  // Data
  transactions: Transaction[] = [];

  // 1. Loading State (Starts true to block page on load)
  isLoading = true;

  // Filtering State
  currentFilterType: 'Income' | 'Expense' | undefined = undefined;

  // Modals/Dialogs State
  isDeleteModalOpen = false;
  transactionToDeleteId: any;
  isTransactionModalOpen = false;
  isEditMode = false;
  isPhotoModalOpen = false;
  selectedPhotoUrl: string | null = null;

  selectedTransaction: Transaction | TransactionCreateDto;

  currencies = this.currencyService.getSupportedCurrencies().map(c => ({label: c.name, value: c.code}));
  categories: Category[] = [];

  selectedFile: File | null = null;

  constructor(
    private transactionService: TransactionService,
    private categoryService: CategoryService,
    private messageService: MessageService,
    private currencyService: CurrencyService
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
      // Default to first category of the default type if available, else first category, else 0
      categoryId: (this.categories.find(c => c.type === 'Expense') || this.categories[0])?.categoryId ?? 0,
      description: '',
      isRecurring: false,
      photoUrl: ''
    };
  }

  // Returns categories filtered by the currently selected transaction type
  get filteredCategories(): Category[] {
    const type = (this.selectedTransaction as any)?.type as string | undefined;
    if (!type) return this.categories;
    return this.categories.filter(c => c.type?.toLowerCase() === type.toLowerCase());
  }

  onTypeChange(event: any): void {
    const newType = event?.value;
    if (!this.selectedTransaction) return;

    // If the currently selected category doesn't match the new type, reset to a matching category or 0
    const currentCatId = (this.selectedTransaction as any).categoryId;
    const valid = this.categories.find(c => c.categoryId === currentCatId && c.type?.toLowerCase() === newType?.toLowerCase());
    if (!valid) {
      const firstMatch = this.categories.find(c => c.type?.toLowerCase() === newType?.toLowerCase());
      (this.selectedTransaction as any).categoryId = firstMatch ? firstMatch.categoryId : 0;
    }
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
    this.selectedFile = null;
    if (this.photoInput) {
      this.photoInput.nativeElement.value = '';
    }
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
        this.selectedFile = null;
        if (this.photoInput) {
          this.photoInput.nativeElement.value = '';
        }
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
    this.selectedFile = null;
    if (this.photoInput) {
      this.photoInput.nativeElement.value = '';
    }
  }

  openPhotoModal(photoUrl: string): void {
    this.selectedPhotoUrl = photoUrl;
    this.isPhotoModalOpen = true;
  }

  removePhoto(): void {
    (this.selectedTransaction as any).photoUrl = null;
    this.selectedFile = null;
    if (this.photoInput) {
      this.photoInput.nativeElement.value = '';
    }
  }

  saveTransaction(form: NgForm): void {
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
      this.selectedFile = null; // Reset file
    };

    const handleError = (err: any) => {
      this.isLoading = false; // Spinner OFF
      console.error('Error saving transaction', err);
    };

    const proceedToSave = () => {
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
    };

    // Photo is uploaded immediately on select; just proceed to save.
    proceedToSave();
  }

  openDeleteModal(id: any): void {
    this.transactionToDeleteId = id;
    this.isDeleteModalOpen = true;
  }

  closeDeleteModal(): void {
    this.isDeleteModalOpen = false;
    this.transactionToDeleteId = null;
  }

  confirmDelete(): void {
    debugger
    if (this.transactionToDeleteId !== null) {
      this.isLoading = true; // Spinner ON
debugger
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

  onPhotoSelect(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;

      this.isLoading = true;
      this.transactionService.uploadPhoto(file)
        .pipe(finalize(() => { this.isLoading = false; }))
        .subscribe({
          next: (response) => {
            (this.selectedTransaction as any).photoUrl = response.photoUrl;
            this.messageService.add({
              severity: 'success',
              summary: 'Photo Uploaded',
              detail: 'Photo uploaded successfully.'
            });
          },
          error: (err) => {
            console.error('Photo upload failed', err);
            this.messageService.add({
              severity: 'error',
              summary: 'Photo Upload Failed',
              detail: 'Failed to upload photo.'
            });
          }
        });
    }
  }

  onCsvFileSelect(event: any): void {
    const file: File = event.files[0];

    if (file) {
      this.isLoading = true; // Show loading spinner

      // 💡 The transactionService.uploadCsv method must be created next!
      this.transactionService.uploadCsv(file)
        .pipe(
          finalize(() => {
            this.isLoading = false; // Hide loading spinner regardless of outcome
            // Clear the file selection manually if not using auto="true" or if you want custom logic
            event.target.value = null;
          })
        )
        .subscribe({
          next: (response) => {
            this.messageService.add({
              severity: 'success',
              summary: 'Import Successful',
              detail: response.message || 'Transactions imported successfully.'
            });
            this.loadTransactions(); // Reload the table to show the new data
          },
          error: (err) => {
            console.error('CSV Upload failed:', err);
            this.messageService.add({
              severity: 'error',
              summary: 'Import Failed',
              detail: err.error?.message || 'An error occurred during CSV import.'
            });
          }
        });
    }
  }

  exportToExcel(): void {
    this.isLoading = true;
    
    this.transactionService.exportToExcel(this.currentFilterType)
      .pipe(finalize(() => this.isLoading = false))
      .subscribe({
        next: (blob) => {
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          const filterSuffix = this.currentFilterType ? `_${this.currentFilterType.toLowerCase()}` : '';
          link.download = `transactions${filterSuffix}_${new Date().toISOString().split('T')[0]}.xlsx`;
          link.click();
          window.URL.revokeObjectURL(url);
          
          this.messageService.add({
            severity: 'success',
            summary: 'Export Successful',
            detail: 'Transactions exported to Excel successfully.'
          });
        },
        error: (err) => {
          console.error('Excel export failed:', err);
          this.messageService.add({
            severity: 'error',
            summary: 'Export Failed',
            detail: 'An error occurred during Excel export.'
          });
        }
      });
  }

  getCurrentCurrency(): string {
    let currency = 'USD';
    this.currencyService.currentCurrency$.subscribe(c => currency = c);
    return currency;
  }
}
