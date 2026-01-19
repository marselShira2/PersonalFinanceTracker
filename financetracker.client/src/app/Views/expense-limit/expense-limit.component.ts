import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ExpenseLimitService } from '../../services/expense-limit.service';
import { ExpenseLimitStatus } from '../../Models/expense-limit.model';
import { MessageService } from 'primeng/api';
import { AuthService } from '../../services/auth.service';
import { TranslateService } from '@ngx-translate/core';
import { CategoryService, Category } from '../../services/categories/category.service';
import { CurrencyService } from '../../services/currency.service';

@Component({
  selector: 'app-expense-limit',
  templateUrl: './expense-limit.component.html',
  styleUrls: ['./expense-limit.component.scss']
})
export class ExpenseLimitComponent implements OnInit {
  limitForm: FormGroup;
  expenseLimits: ExpenseLimitStatus[] = [];
  categories: Category[] = [];
  loading = false;
  userId: number | null = null;
  editingLimit: ExpenseLimitStatus | null = null;
  currentCurrency = 'USD';

  constructor(
    private fb: FormBuilder,
    private expenseLimitService: ExpenseLimitService,
    private categoryService: CategoryService,
    private messageService: MessageService,
    private authService: AuthService,
    private translate: TranslateService,
    private currencyService: CurrencyService
  ) {
    this.limitForm = this.fb.group({
      categoryId: ['', Validators.required],
      amount: ['', [
        Validators.required, 
        Validators.min(0.01),
        Validators.max(999999.99)
      ]],
      isActive: [true]
    });
  }

  ngOnInit() {
    this.getUserId();
    this.loadCategories();
    this.loadCurrentCurrency();
    if (this.userId) {
      this.loadExpenseLimits();
    }
  }

  private loadCurrentCurrency() {
    this.currencyService.currentCurrency$.subscribe(currency => {
      this.currentCurrency = currency;
    });
    this.currencyService.initializeCurrency();
  }

  private getUserId() {
    const token = this.authService.getToken();
    
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        
        // Get user ID from the correct claim
        const userIdClaim = payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'];
        
        if (userIdClaim) {
          this.userId = parseInt(userIdClaim);
          console.log('Found user ID:', this.userId);
          return;
        }
      } catch (error) {
        console.error('Error parsing JWT:', error);
      }
    }
    
    this.messageService.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Unable to get user information. Please login again.'
    });
  }

  loadExpenseLimits() {
    if (!this.userId) return;
    
    this.loading = true;
    this.expenseLimitService.getAllLimits(this.userId).subscribe({
      next: (limits) => {
        this.expenseLimits = limits;
        this.loading = false;
      },
      error: (error) => {
        console.error('Failed to load expense limits', error);
        this.loading = false;
      }
    });
  }

  loadCategories() {
    this.categoryService.getCategories().subscribe({
      next: (categories) => {
        this.categories = categories.filter(c => c.type?.toLowerCase() === 'expense');
      },
      error: (error) => console.error('Failed to load categories', error)
    });
  }

  onSubmit() {
    if (this.limitForm.valid && this.userId) {
      this.loading = true;
      const request = {
        userId: this.userId,
        categoryId: this.limitForm.value.categoryId,
        amount: this.limitForm.value.amount,
        isActive: this.limitForm.value.isActive
      };

      const action = this.editingLimit ? 'updated' : 'created';
      this.expenseLimitService.setLimit(request).subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: `Expense limit ${action} successfully`
          });
          this.loadExpenseLimits();
          this.limitForm.reset();
          this.limitForm.patchValue({ isActive: true });
          this.editingLimit = null;
          this.loading = false;
        },
        error: (error) => {
          console.error('Error setting limit:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: error.error?.message || 'Failed to set expense limit'
          });
          this.loading = false;
        }
      });
    } else {
      this.markFormGroupTouched();
    }
  }

  onToggleLimit(isActive: boolean) {
    // Method removed since toggleLimit doesn't exist in new service
  }

  private markFormGroupTouched() {
    Object.keys(this.limitForm.controls).forEach(key => {
      const control = this.limitForm.get(key);
      control?.markAsTouched();
    });
  }

  getWarningMessage(limit: ExpenseLimitStatus): string {
    const percentage = limit.percentageSpent;
    if (percentage >= 100) return 'Limit exceeded!';
    if (percentage >= 90) return 'Approaching limit';
    if (percentage >= 50) return 'Half limit used';
    return 'Within limit';
  }

  deleteLimit(categoryId: number) {
    if (!this.userId) return;
    
    this.loading = true;
    this.expenseLimitService.deleteLimit(this.userId, categoryId).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Expense limit deleted successfully'
        });
        this.loadExpenseLimits();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error deleting limit:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to delete expense limit'
        });
        this.loading = false;
      }
    });
  }

  editLimit(limit: ExpenseLimitStatus) {
    this.editingLimit = limit;
    this.limitForm.patchValue({
      categoryId: limit.categoryId,
      amount: limit.limitAmount,
      isActive: limit.isActive
    });
  }

  cancelEdit() {
    this.editingLimit = null;
    this.limitForm.reset();
    this.limitForm.patchValue({ isActive: true });
  }

  toggleActive(limit: ExpenseLimitStatus) {
    if (!this.userId) return;
    
    this.toggleLimit(limit.categoryId, !limit.isActive);
  }

  private toggleLimit(categoryId: number, isActive: boolean) {
    if (!this.userId) return;
    
    this.expenseLimitService.toggleLimit(
      this.userId, 
      categoryId
    ).subscribe({
      next: () => {
        this.loadExpenseLimits();
      },
      error: (error) => {
        console.error('Error toggling limit:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to toggle limit status'
        });
        this.loadExpenseLimits();
      }
    });
  }

  get categoryControl() {
    return this.limitForm.get('categoryId');
  }

  getActiveLimitsCount(): number {
    return this.expenseLimits.filter(limit => limit.isActive).length;
  }

  getProgressBarClass(limit: ExpenseLimitStatus): string {
    const percentage = limit.percentageSpent;
    if (percentage >= 100) return 'danger';
    if (percentage >= 90) return 'danger';
    if (percentage >= 50) return 'warning';
    return 'success';
  }

  get amountControl() {
    return this.limitForm.get('amount');
  }

  getCurrencySymbol(currency?: string): string {
    return this.currencyService.getCurrencySymbol(currency || this.currentCurrency);
  }
}
