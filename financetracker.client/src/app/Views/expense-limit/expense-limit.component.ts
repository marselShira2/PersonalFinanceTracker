import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ExpenseLimitService } from '../../services/expense-limit.service';
import { ExpenseLimitStatus } from '../../Models/expense-limit.model';
import { MessageService } from 'primeng/api';
import { AuthService } from '../../services/auth.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-expense-limit',
  templateUrl: './expense-limit.component.html',
  styleUrls: ['./expense-limit.component.scss']
})
export class ExpenseLimitComponent implements OnInit {
  limitForm: FormGroup;
  limitStatus: ExpenseLimitStatus | null = null;
  loading = false;
  hasLimit = false;
  userId: number | null = null;

  constructor(
    private fb: FormBuilder,
    private expenseLimitService: ExpenseLimitService,
    private messageService: MessageService,
    private authService: AuthService,
    private translate: TranslateService
  ) {
    this.limitForm = this.fb.group({
      amount: ['', [
        Validators.required, 
        Validators.min(0.01),
        Validators.max(999999.99)
      ]]
    });
  }

  ngOnInit() {
    this.getUserId();
    if (this.userId) {
      this.loadLimitStatus();
    }
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

  loadLimitStatus() {
    if (!this.userId) return;
    
    this.loading = true;
    this.expenseLimitService.getLimitStatus(this.userId).subscribe({
      next: (status) => {
        this.limitStatus = status;
        this.hasLimit = true;
        this.loading = false;
      },
      error: (error) => {
        if (error.status === 404) {
          this.hasLimit = false;
        } else {
          this.messageService.add({
            severity: 'error',
            summary: this.translate.instant('ERROR'),
            detail: this.translate.instant('EL.ERROR_LOAD')
          });
        }
        this.loading = false;
      }
    });
  }

  onSubmit() {
    if (this.limitForm.valid && this.userId) {
      this.loading = true;
      const request = {
        userId: this.userId,
        amount: this.limitForm.value.amount
      };

      this.expenseLimitService.setLimit(request).subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: this.translate.instant('T.BTN_SAVE'),
            detail: this.translate.instant('EL.SUCCESS_SET')
          });
          this.loadLimitStatus();
          this.limitForm.reset();
        },
        error: (error) => {
          console.error('Error setting limit:', error);
          this.messageService.add({
            severity: 'error',
            summary: this.translate.instant('ERROR'),
            detail: error.error?.message || this.translate.instant('EL.ERROR_SET')
          });
          this.loading = false;
        }
      });
    } else {
      this.markFormGroupTouched();
    }
  }

  onToggleLimit(isActive: boolean) {
    if (!this.userId) return;
    
    this.loading = true;
    this.expenseLimitService.toggleLimit(this.userId, isActive).subscribe({
      next: () => {
        const status = isActive ? this.translate.instant('EL.ENABLED') : this.translate.instant('EL.DISABLED');
        this.messageService.add({
          severity: 'success',
          summary: this.translate.instant('T.BTN_SAVE'),
          detail: this.translate.instant('EL.SUCCESS_TOGGLE', { status })
        });
        this.loadLimitStatus();
      },
      error: (error) => {
        console.error('Error toggling limit:', error);
        this.messageService.add({
          severity: 'error',
          summary: this.translate.instant('ERROR'),
          detail: this.translate.instant('EL.ERROR_TOGGLE')
        });
        this.loading = false;
      }
    });
  }

  private markFormGroupTouched() {
    Object.keys(this.limitForm.controls).forEach(key => {
      const control = this.limitForm.get(key);
      control?.markAsTouched();
    });
  }

  getProgressBarClass(): string {
    if (!this.limitStatus) return 'success';
    
    const percentage = this.limitStatus.percentageSpent;
    if (percentage >= 100) return 'danger';
    if (percentage >= 90) return 'danger';
    if (percentage >= 50) return 'warning';
    return 'success';
  }

  get amountControl() {
    return this.limitForm.get('amount');
  }
}
