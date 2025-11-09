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
@Component({
  templateUrl: './dashboard.component.html',
   styleUrls: ['./dashboard.component.css'],
})

export class DashboardComponent implements OnInit, OnDestroy {
  @ViewChild('dt1') dt1!: Table;

  private apiUrl: string = environment.apiUrl;
  getPdfContent(): HTMLElement | null {
    return document.getElementById('pdf-content');
  }

  router = inject(Router);
  paths: MenuItem[] | undefined;
  subscription!: Subscription;
  selectedFiles2: TreeNode[] = [];
  cols = [
    { field: 'header', header: 'Emertimi' },
  ];
  //////
  chartData: any;
  chartOptions: any;
  expenseChartData: any;
  doughnutOptions: any;
  transactions: any[];


  ///////
  files2: TreeNode[] = [];
  loading: boolean = false;
  displaySelfDeclarationDialog: boolean = false;
  userStatus: boolean = false;
  notifications: any[] = [];
  role: string = "";
  welcomeMessage: string = "";
  labels: any;
  labelsUsersChart: any;
  backgroundColor: any;
  borderColor: any;
  jsonData?: any;
  items!: MenuItem[]; 

  FullName: string | undefined = this.authService.getUserDetail()?.fullName;

  responsiveOptions: any[] | undefined;


  usersList: usersListDTO[] = [];
  profileImage: any = null;

   
  users: UserDetailsDTO[] = [];
  FirstName: string | null = '';
  Address: string | null = '';
  NID_NIPT: string | null = '';
  PhoneNumber: string | null = '';
  LastName: string | null = '';
  Email!: string | null;
  Birthdate!: string | null;
  StartDate!: string | null;
  currentDate: string = new Date().toLocaleDateString();

 
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
  ) {
    this.chartData = {
      labels: ['Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov'],
      datasets: [
        {
          label: 'Income',
          backgroundColor: '#4CAF50',
          data: [3200, 3100, 3500, 3300, 3400, 3600]
        },
        {
          label: 'Expenses',
          backgroundColor: '#EF5350',
          data: [2400, 2600, 2300, 2500, 2450, 2600]
        }
      ]
    };

    this.chartOptions = {
      responsive: true,
      plugins: {
        legend: { position: 'top' },
        title: { display: true, text: 'Monthly Overview' }
      }
    };

    this.expenseChartData = {
      labels: ['Housing', 'Food', 'Transport', 'Entertainment', 'Health'],
      datasets: [
        {
          data: [35, 25, 15, 10, 15],
          backgroundColor: ['#42A5F5', '#66BB6A', '#FFA726', '#AB47BC', '#EC407A']
        }
      ]
    };

    this.doughnutOptions = {
      cutout: '60%',
      plugins: {
        legend: { position: 'bottom' }
      }
    };

    this.transactions = [
      { date: '2025-11-05', description: 'Salary', category: 'Income', type: 'Income', amount: '$2,000' },
      { date: '2025-11-06', description: 'Groceries', category: 'Food', type: 'Expense', amount: '$150' },
      { date: '2025-11-07', description: 'Internet Bill', category: 'Utilities', type: 'Expense', amount: '$40' },
      { date: '2025-11-08', description: 'Investment', category: 'Stocks', type: 'Expense', amount: '$200' },
      { date: '2025-11-09', description: 'Freelance', category: 'Income', type: 'Income', amount: '$500' }
    ];
   
  }

  handleNewNotification(notification: any) {

    const currentLanguage = this.translateService.currentLang;
    /*console.error('Inserted at handleNewNotification');*/
    if (notification == "") {
      return;
    }
    if (!notification || !notification.message) {
      console.error('Received empty or invalid notification');
      return;
    }

    // Create a new notification object with the received data
    const newNotification = {
      displayMessage: currentLanguage === 'en' ? notification.id.notificationEnglish : notification.id.notificationMessage,
      idskvNotification: notification.id,
      time: notification.time,
      seen: false,
      priority: notification.priority
    };

    // Add the notification to the list
    this.notifications.push(newNotification);
    console.log('Updated notifications:', this.notifications);
  }


  ngOnInit() {

    this.items = [
      { label: 'Add New', icon: 'pi pi-fw pi-plus' },
      { label: 'Remove', icon: 'pi pi-fw pi-minus' }
    ];
    this.translateService.get(['EVALUATED', 'NO_ITEMS_FOUND', 'LNG_TOTAL', 'UNDER_EVALUATION', 'CRITICAL', 'IMPORTANT', 'HALFIMPLEMENTED','LNG_NOT_APPLICABLE',
      'WELCOME', 'PO', 'JO', 'N/A', 'CORRECTIVE', 'LNG_RECOMPLETED', 'LNG_INCOMPLETE', 'LNG_COMPLETE', 'LNG_CONFIRMED', 'IMPLEMENTED','NOT_IMPLEMENTED',
      'LNG_REJECTED', 'LNG_NOT_APPLIED', 'JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE', 'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER',
      'DECEMBER', 'LNG_CRITICAL_PROJECTS_DEADLINE', 'LNG_CRITICAL_PROJECTS_PROCESS', 'LNG_IMPORTANT_PROJECTS_DEADLINE', 'LNG_IMPORTANT_PROJECTS_PROCESS',
      'I', 'PERSON_CHARGE', 'LNG_CRITICAL_PROJECTS_FINISHED', 'LNG_IMPORTANT_PROJECTS_FINISHED' , 'Approved','Refused','N/A']).subscribe(translations => {
      this.translations = translations;
      this.paths = [
        { icon: 'pi pi-home', route: '/dashboard' }
      ]
      this.labelsUsersChart = [translations['Approved'], translations['Refused'], translations['N/A']];
      this.labels = [translations['IMPLEMENTED'], translations['NOT_IMPLEMENTED'], translations['HALFIMPLEMENTED'],translations['LNG_NOT_APPLICABLE']];
      this.welcomeMessage = translations['WELCOME'] + ", " + this.authService.getUserDetail()?.fullName ?? '';
    });
    this.translateCalendar();
    this.translateService.onLangChange.subscribe((event) => {
      this.translateCalendar();
      this.translateService.get(['EVALUATED', 'UNDER_EVALUATION', 'WELCOME', 'PO', 'Approved',
        'Refused', 'LNG_CORRECTED', 'JO', 'N/A', 'CORRECTIVE', 'LNG_RECOMPLETED', 'LNG_INCOMPLETE',
        'LNG_COMPLETE', 'LNG_CONFIRMED', 'LNG_REJECTED', 'LNG_NOT_APPLIED', 'JANUARY', 'FEBRUARY', 'HALFIMPLEMENTED','LNG_NOT_APPLICABLE',
        'MARCH', 'APRIL', 'MAY', 'JUNE', 'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER', 'IMPLEMENTED','NOT_IMPLEMENTED',
        'LNG_CRITICAL_PROJECTS_DEADLINE', 'LNG_CRITICAL_PROJECTS_PROCESS', 'LNG_IMPORTANT_PROJECTS_DEADLINE',
        'LNG_IMPORTANT_PROJECTS_PROCESS', 'LNG_CRITICAL_PROJECTS_FINISHED', 'LNG_IMPORTANT_PROJECTS_FINISHED']).subscribe(translations => {
        this.paths = [
          { icon: 'pi pi-home', route: '/dashboard' }
        ]
        this.labelsUsersChart = [translations['Approved'], translations['Refused'], translations['N/A']];
        this.labels = [translations['IMPLEMENTED'], translations['NOT_IMPLEMENTED'], translations['HALFIMPLEMENTED'], translations['LNG_NOT_APPLICABLE']];
        this.welcomeMessage = translations['WELCOME'] + ", " + this.authService.getUserDetail()?.fullName ?? ''
      });
    });
   


     

    this.notificationService.notification$.subscribe((message: string) => {
      this.handleNewNotification(message);
    });
 
    this.responsiveOptions = [
      {
        breakpoint: '1199px',
        numVisible: 1,
        numScroll: 1
      },
      {
        breakpoint: '991px',
        numVisible: 2,
        numScroll: 1
      },
      {
        breakpoint: '767px',
        numVisible: 1,
        numScroll: 1
      }
    ]; 

  }

  getSeverity(riskValue: number): 'success' | 'warning' | 'danger' | undefined {
    if (riskValue <= 0.5) {
      return 'success';  // Green
    } else if (riskValue > 0.5 && riskValue <= 0.7) {
      return 'warning';  // Yellow
    } else {
      return 'danger';   // Red
    }
  }

  showValue(riskValue: number) {
    return (riskValue * 100).toFixed(2) + '%';
  }

 

  get jsonKeys() {
    return this.jsonData ? Object.keys(this.jsonData) : [];
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

 

  loadProfileImage(base64String: string): any {
    if (base64String) {
      const base64Image = `data:image/png;base64,${base64String}`;
      return this.sanitizer.bypassSecurityTrustUrl(base64Image);
    } else {
      return this.setDefaultProfileImage();
    }
  }

  setDefaultProfileImage(): any {
    return 'assets/layout/images/default-user.png';
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
  };


}

