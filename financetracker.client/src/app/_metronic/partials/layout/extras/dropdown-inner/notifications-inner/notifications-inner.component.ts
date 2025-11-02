import { Component, HostBinding, OnInit, Renderer2, ElementRef } from '@angular/core';
import { LayoutService } from '../../../../../layout';
//import { NotificationService } from '../../../../../../services/notifications/notification.service';
import { MessageService } from 'primeng/api';
//import { AlertModel, NewNotificationDTO, LogModel } from '../../../../../../interfaces/Notifications/notificationModel.model';
import { Tab } from 'bootstrap';
import { ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';


export type NotificationsTabsType =
  | 'kt_topbar_notifications_1'
  | 'kt_topbar_notifications_2'
  | 'kt_topbar_notifications_3';

@Component({
  selector: 'app-notifications-inner',
  templateUrl: './notifications-inner.component.html',
})
export class NotificationsInnerComponent implements OnInit {
  @HostBinding('class') class =
    'menu menu-sub menu-sub-dropdown menu-column w-350px w-lg-375px';
  @HostBinding('attr.data-kt-menu') dataKtMenu = 'true';

  //variablat
  notification: string = '';

  activeTabId: NotificationsTabsType = 'kt_topbar_notifications_2';
  //newNotifications: Array<AlertModel> = newNotifications;
  //oldNotifications: Array<LogModel> = oldNotifications;
  showAllNotifications = false;
  isLoadingRefresh = false;
  showAllOldNotifications = false;
  newNotificationsCount = 0;
  oldNotificationsCount = 0;

  constructor( private messageService: MessageService,
    private cdr: ChangeDetectorRef, private router: Router, private elRef: ElementRef, private renderer: Renderer2) { }

  ngOnInit(): void {
    this.cdr.detectChanges();
     
    //metoda qe pret njoftimet ne kohe reale
     
    //merr njoftimet
    //this.loadNewNotifications();
    this.loadOldNotifications();
    this.cdr.detectChanges();

  }

  //butoni referesh do rifreskoje njoftimet ne rast bllokimi te tyre
  refreshNotifications() {
    this.isLoadingRefresh = true; 
    this.loadNewNotifications(); 
    this.loadOldNotifications();
    this.cdr.detectChanges();
    setTimeout(() => {
      this.isLoadingRefresh = false;
    }, 300);  


  }

  //perckaton stilimet ne baze te prioritetit te njoftimit
  getBackgroundColorForPriority(priority: string): string {
     debugger 
     priority = priority.toString();
     switch (priority) {
      case '30':
        return '#ffcccc'; // Light red for high priority
      case '20':
        return '#ffff99'; // Light yellow for normal priority
      case '10':
        return 'transparent'; // No background color for low priority
      default:
        return 'transparent'; // Default to transparent if not recognized
    }
  }

  //metode per ngjyrimin e njoftimeve
  getTextClassForPriority(priority: string): string {

    switch (priority.toString()) {

      case '30':
        return 'text-priority-high'; // i larte
      case '20':
        return 'text-priority-medium'; // i mesem
      case '10':
        return 'text-priority-low'; // i ulet
      default:
        return '';  
    }
  }

  
  //metoda qe percakton ikonen e njotimeve sipas prioritetit
  getIconForPriority(priority: string): string {

    switch (priority.toString()) {
      case '30':
        return 'information-3'; //prioritet i larte
      case '20':
        return 'information-5'; //prioritet i mesem
      case '10':
        return 'information-2'; // prioritet i ulet
      default:
        return 'information-2'; // default
    }
  }

  //funksioni per ngarkimin e njoftimeve te reja
  loadNewNotifications() {
    //this.notificationService.getNewNotifications().subscribe(
    //  (data) => {
    //    var newNotificationsFromBackend = data.newNotifications;

    //    const newNotifications: Array<AlertModel> = newNotificationsFromBackend.map((notification: NewNotificationDTO) => ({
    //      notificationId: notification.id,
    //      title: notification.type,
    //      time: notification.createdOn.toString(),  
    //      description: notification.notificationMessage,   
    //      icon: this.getIconForPriority(notification.priority), 
    //      state: notification.priority,
    //      link: notification.link,
    //      notificationHeader: notification.notificationHeader,
    //      idBase: notification.idBase
    //    }));

    //    //per renditjen sipas prioritetit
    //    //newNotifications.sort((a, b) => {
    //    //  // First, sort by priority (from 30 to 10)
    //    //  const priorityComparison = Number(b.state) - Number(a.state); 
    //    //  if (priorityComparison !== 0) return priorityComparison;
           
    //    //  return new Date(b.time).getTime() - new Date(a.time).getTime();
    //    //});

    //    this.newNotifications = newNotifications;
    //    this.newNotificationsCount = data.newNotificationsCount; 
    //    this.cdr.detectChanges();
    //  },

    //  (error) => {
    //    console.error('Error fetching notifications:', error);
    //  } 
    //);
  }

  loadOldNotifications() {
    //this.notificationService.getOldNotifications().subscribe(
    //  (data) => {
         
    //    if (data && data.oldNotifications && data.oldNotifications.length > 0) {
    //      var oldNotificationsFromBackend = data.oldNotifications;

    //      const oldNotifications: Array<LogModel> = oldNotificationsFromBackend.map((notification: NewNotificationDTO) => ({
    //        notificationId: notification.id,
    //        title: notification.type,
    //        time: notification.createdOn.toString(), 
    //        description: notification.notificationMessage,
    //        icon: this.getIconForPriority(notification.priority),
    //        state: notification.priority,
    //        link: notification.link,
    //        notificationHeader: notification.notificationHeader,
    //        idBase: notification.idBase

    //      }));
             
    //      this.oldNotifications = oldNotifications;
    //      this.oldNotificationsCount = data.oldNotificationsCount;
    //      this.cdr.detectChanges(); 
    //    } else { 
    //      console.log('No old notifications available');
    //      this.oldNotifications = [];   
     
    //    }
    //    this.cdr.detectChanges();
    //  },
    //  (error) => {
    //    console.error('Error fetching notifications:', error); 
    //  }
    //);
  }
  // Check if oldNotifications has data
  get hasOldNotifications(): boolean {
    return true;
    //return this.oldNotifications && this.oldNotifications.length > 5;
  }
  get hasNewNotifications(): boolean {
    return true;
    //return this.newNotifications && this.newNotifications.length > 5;
  }

  //funksioni i perkthimit te dates dhe ores ne kohe relative
  getTimeAgo(date: string | Date): string {
    const now = new Date();
    const notificationDate = new Date(date);
    const seconds = Math.floor((now.getTime() - notificationDate.getTime()) / 1000);

    let interval = Math.floor(seconds / 31536000);
    if (interval >= 1) {
      return `${interval} vit${interval > 1 ? 'e' : 'ë'} më parë`;
    }

    interval = Math.floor(seconds / 2592000);
    if (interval >= 1) {
      return `${interval} muaj më parë`;
    }

    interval = Math.floor(seconds / 86400);
    if (interval >= 1) {
      return `${interval} dit${interval > 1 ? 'ë' : 'ë'} më parë`;
    }

    interval = Math.floor(seconds / 3600);
    if (interval >= 1) {
      return `${interval} or${interval > 1 ? 'ë' : 'ë'} më parë`;
    }

    interval = Math.floor(seconds / 60);
    if (interval >= 1) {
      return `${interval} minut${interval > 1 ? 'a' : 'ë'} më parë`;
    }

    return `${Math.floor(seconds)} sekonda më parë`;
  }

  //shenon te gjitha njoftimet si te lexuara
  markAllAsRead(): void {
    
  }

  //percakton tabin e klikuar te njoftimeve
  setActiveTabId(tabId: NotificationsTabsType) {
    debugger
    if (tabId == "kt_topbar_notifications_2") {
      this.loadNewNotifications();
      this.activeTabId = tabId;

    }
    else {
      this.loadOldNotifications(); 
      this.activeTabId = tabId; 
    }
  }

  //hap listen me njoftime
  toggleNotifications() {
    //this.showAllNotifications = !this.showAllNotifications;
    this.router.navigate(['/notificationList']);
    this.closeNotificationModal();

  } 

  //ne klikim te njoftimit ndryshon statusin dhe ridrejton te linku perkates
  onNotificationClick(notification: any): void {
    debugger 
    // Call your service method to handle the logic if needed
    
  }

  //ne klikim te njoftimit ndryshon statusin dhe ridrejton te linku perkates 
  onOldNotificationClick(notification: any): void {
    debugger;
    if (notification.link == "/new-fine") {
      /*localStorage.removeItem('fineId');
      localStorage.setItem('fineIdV', notification.idBase);
      localStorage.removeItem('ChangeId');
      this.router.navigate(['/new-fine']);*/
      localStorage.removeItem('fineId');
      localStorage.setItem('fineIdV', notification.idBase);
      localStorage.setItem('ChangeId', notification.idBase);
      this.router.navigate(['/new-fine']);
    } else {
      this.router.navigate([notification.link]);
    }
    this.closeNotificationModal();

  }

  //mbylll modalin e njoftimeve
  closeNotificationModal(): void {
    const notificationElement = document.getElementById('notificationDiv'); // Adjust ID if needed
    if (notificationElement) {
      notificationElement.classList.remove('show');
    }

    // If using Bootstrap dropdown
    const dropdown = document.querySelector('[data-kt-menu-trigger]');
    if (dropdown) {
      (dropdown as any).click(); // Simulate a click to close the dropdown
    }
  }

}

   
//const newNotifications: Array<AlertModel> = [
   
//]; 
//const oldNotifications: Array<LogModel> = [ 
   
//];
