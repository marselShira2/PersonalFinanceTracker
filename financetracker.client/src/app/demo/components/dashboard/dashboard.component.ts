import { Component, OnInit, OnDestroy, inject, ViewChild } from '@angular/core';
import { MenuItem, SelectItem } from 'primeng/api';
import { Subscription } from 'rxjs';
import { LayoutService } from '../../../layout/service/app.layout.service';
import { TreeNode } from 'primeng/api';
import { NotificationService } from '../../../services/notifications.service';
import { UserDetailsDTO, usersListDTO } from '../../../Models/user-details-dto.model';
import { usersprofileservice } from '../../../services/userprofile.services';
import { AuthService } from '../../../services/auth.service';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { ChangeDetectorRef } from '@angular/core';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { DomSanitizer } from '@angular/platform-browser';
import { Table } from 'primeng/table';
import { environment } from '../../../../environments/environment';
import { PrimeNGConfig } from 'primeng/api';
import { DashboardService, DashboardSummary, DashboardResponse } from '../../../services/dashboard/dashboard.service';
import { CategoryService, Category } from '../../../services/categories/category.service';
import { TransactionService, Transaction } from '../../../services/transaction/transaction.service';

@Component({
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})

export class DashboardComponent implements OnInit, OnDestroy {
  @ViewChild('dt1') dt1!: Table;

  private apiUrl: string = environment.apiUrl;
  router = inject(Router);
  paths: MenuItem[] | undefined;
  subscription!: Subscription;
  
  chartData: any;
  chartOptions: any;
  expenseChartData: any;
  doughnutOptions: any;
  transactions: Transaction[] = [];
  allTimeSummary: DashboardSummary | null = null;
  currentPeriodData: DashboardResponse | null = null;
  selectedPeriod: string = 'year';
  selectedCategory: number | undefined;
  categories: Category[] = [];
  chartType: 'bar' | 'line' | 'pie' = 'bar';
  periodOptions = [
    { label: 'Current Week', value: 'week' },
    { label: 'Current Month', value: 'month' },
    { label: 'Q1 (Jan-Mar)', value: 'q1' },
    { label: 'Q2 (Apr-Jun)', value: 'q2' },
    { label: 'Q3 (Jul-Sep)', value: 'q3' },
    { label: 'Q4 (Oct-Dec)', value: 'q4' },
    { label: 'Current Year', value: 'year' }
  ];
  chartTypeOptions = [
    { label: 'Bar Chart', value: 'bar' },
    { label: 'Line Chart', value: 'line' },
    { label: 'Pie Chart', value: 'pie' }
  ];

  loading: boolean = false;
  notifications: any[] = [];
  welcomeMessage: string = "";
  items!: MenuItem[];
  responsiveOptions: any[] | undefined;
  translations!: any;

  constructor(
    public layoutService: LayoutService,
    private notificationService: NotificationService,
    private authService: AuthService,
    private translateService: TranslateService,
    private messageService: MessageService,
    private cdr: ChangeDetectorRef,
    private sanitizer: DomSanitizer,
    private primengConfig: PrimeNGConfig,
    private dashboardService: DashboardService,
    private categoryService: CategoryService,
    private transactionService: TransactionService
  ) {
    this.chartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: 'top' },
        title: { display: true, text: 'Income vs Expenses' }
      }
    };

    this.doughnutOptions = {
      cutout: '60%',
      plugins: {
        legend: { position: 'bottom' }
      }
    };
  }

  ngOnInit() {
    this.loadDashboardData();
    this.loadCategories();
    this.loadRecentTransactions();

    this.items = [
      { label: 'Add New', icon: 'pi pi-fw pi-plus' },
      { label: 'Remove', icon: 'pi pi-fw pi-minus' }
    ];

    this.translateService.get(['WELCOME']).subscribe(translations => {
      this.translations = translations;
      this.paths = [{ icon: 'pi pi-home', route: '/dashboard' }];
      this.welcomeMessage = translations['WELCOME'] + ", " + this.authService.getUserDetail()?.fullName;
    });

    this.translateCalendar();
    this.translateService.onLangChange.subscribe(() => {
      this.translateCalendar();
      this.translateService.get(['WELCOME']).subscribe(translations => {
        this.welcomeMessage = translations['WELCOME'] + ", " + this.authService.getUserDetail()?.fullName;
      });
    });

    this.notificationService.notification$.subscribe((message: string) => {
      this.handleNewNotification(message);
    });

    this.responsiveOptions = [
      { breakpoint: '1199px', numVisible: 1, numScroll: 1 },
      { breakpoint: '991px', numVisible: 2, numScroll: 1 },
      { breakpoint: '767px', numVisible: 1, numScroll: 1 }
    ];
  }

  loadDashboardData() {
    this.loading = true;
    this.dashboardService.getAllTimeSummary().subscribe({
      next: (data) => {
        this.allTimeSummary = data;
        this.loadPeriodData();
      },
      error: (err) => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load summary' });
        this.loading = false;
      }
    });
  }

  loadPeriodData() {
    this.dashboardService.getDashboardData(this.selectedPeriod, this.selectedCategory).subscribe({
      next: (data) => {
        this.currentPeriodData = data;
        this.updateCharts();
        this.loading = false;
      },
      error: (err) => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load period data' });
        this.loading = false;
      }
    });
  }

  loadCategories() {
    this.categoryService.getCategories().subscribe({
      next: (data) => {
        this.categories = data;
      },
      error: (err) => console.error('Failed to load categories', err)
    });
  }

  loadRecentTransactions() {
    this.transactionService.getTransactions().subscribe({
      next: (data) => {
        this.transactions = data.slice(0, 5);
      },
      error: (err) => console.error('Failed to load transactions', err)
    });
  }

  updateCharts() {
    if (!this.currentPeriodData) return;

    const labels = this.currentPeriodData.periodData.map(p => p.period);
    const incomeData = this.currentPeriodData.periodData.map(p => p.income);
    const expenseData = this.currentPeriodData.periodData.map(p => p.expense);

    if (this.chartType === 'pie') {
      this.chartData = {
        labels: ['Income', 'Expenses'],
        datasets: [{
          data: [this.currentPeriodData.summary.totalIncome, this.currentPeriodData.summary.totalExpense],
          backgroundColor: ['#4CAF50', '#EF5350']
        }]
      };
    } else {
      this.chartData = {
        labels: labels,
        datasets: [
          {
            label: 'Income',
            backgroundColor: '#4CAF50',
            borderColor: '#4CAF50',
            data: incomeData,
            fill: this.chartType === 'line' ? false : true
          },
          {
            label: 'Expenses',
            backgroundColor: '#EF5350',
            borderColor: '#EF5350',
            data: expenseData,
            fill: this.chartType === 'line' ? false : true
          }
        ]
      };
    }

    const expenseCategories = this.currentPeriodData.categoryBreakdown.filter(c => c.type.toLowerCase() === 'expense');
    this.expenseChartData = {
      labels: expenseCategories.map(c => c.categoryName),
      datasets: [{
        data: expenseCategories.map(c => c.amount),
        backgroundColor: ['#42A5F5', '#66BB6A', '#FFA726', '#AB47BC', '#EC407A', '#26C6DA', '#FFCA28']
      }]
    };
  }

  onPeriodChange() {
    this.loadPeriodData();
  }

  onCategoryChange() {
    this.loadPeriodData();
  }

  onChartTypeChange() {
    this.updateCharts();
  }

  handleNewNotification(notification: any) {
    const currentLanguage = this.translateService.currentLang;
    if (notification == "" || !notification || !notification.message) {
      return;
    }
    const newNotification = {
      displayMessage: currentLanguage === 'en' ? notification.id.notificationEnglish : notification.id.notificationMessage,
      idskvNotification: notification.id,
      time: notification.time,
      seen: false,
      priority: notification.priority
    };
    this.notifications.push(newNotification);
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  translateCalendar() {
    this.translateService.get(['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT',
      'SUN', 'JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE', 'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER',
      'JAN', 'FEB', 'MAR', 'APR', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC', 'TODAY', 'CLEAR']).subscribe(translations => {
        this.primengConfig.setTranslation({
          dayNames: [translations['SUNDAY'], translations['MONDAY'], translations['TUESDAY'], translations['WEDNESDAY'],
          translations['THURSDAY'], translations['FRIDAY'], translations['SATURDAY']],
          dayNamesShort: [translations['SUN'], translations['MON'], translations['TUE'], translations['WED'], translations['THU'],
          translations['FRI'], translations['SAT']],
          dayNamesMin: [translations['SUN'], translations['MON'], translations['TUE'], translations['WED'], translations['THU'],
          translations['FRI'], translations['SAT']],
          monthNames: [translations['JANUARY'], translations['FEBRUARY'], translations['MARCH'], translations['APRIL'],
          translations['MAY'], translations['JUNE'], translations['JULY'], translations['AUGUST'], translations['SEPTEMBER'],
          translations['OCTOBER'], translations['NOVEMBER'], translations['DECEMBER']],
          monthNamesShort: [translations['JAN'], translations['FEB'], translations['MAR'], translations['APR'], translations['MAY'], translations['JUN'], translations['JUL'], translations['AUG'],
          translations['SEP'], translations['OCT'], translations['NOV'], translations['DEC']],
          today: translations['TODAY'],
          clear: translations['CLEAR']
        });
      });
  }
}
