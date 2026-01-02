import { Component, HostListener, OnInit, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { NotificationService } from '../../services/notifications.service';
import { ChangeDetectorRef } from '@angular/core';
import { NotificationsDTO } from '../../Models/notifications-dto.model';
import { Observable } from 'rxjs';
import { TagModule } from 'primeng/tag';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.css'],
})
export class NotificationsComponent implements OnInit {

  @Output() closeOtherDropdowns = new EventEmitter<void>();

  notificationsDropdownVisible: boolean = false;

  activeTab: 'new' | 'old' = 'new';
  notifications: any[] = [];
  languageChangeSubscription?: Subscription;
  userId: string | undefined | null;
  constructor(private router: Router, private notificationService: NotificationService, private authService: AuthService, private translate: TranslateService, private cdr: ChangeDetectorRef) { }


  ngOnInit(): void {
     this.userId = this.authService.getUserDetail()?.id;
    this.loadNotifications();

    // Subscribe to language change events
    this.languageChangeSubscription = this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.loadNotifications();
    });

    this.notificationService.notification$.subscribe((notification: any) => {
      this.handleNewNotification(notification);
    });
  }
   

  ngOnDestroy(): void {
    // Unsubscribe to prevent memory leaks
    if (this.languageChangeSubscription) {
      this.languageChangeSubscription.unsubscribe();
    }
  }

  async loadNotifications(): Promise<void> {
    try {
      const data = await this.notificationService.getNotificationsPaginated(1, 5);
      const currentLanguage = this.translate.currentLang;

      this.notifications = data.notifications.map((notification: any) => ({
        ...notification,
        seen: notification.isRead,
        time: notification.createdAt,
        displayMessage: notification.message,
        idskvNotification: notification.notificationId
      }));
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  }

  handleNewNotification(notification: any) {
    if (!notification || !notification.message) {
      /*console.error('Received empty or invalid notification');*/
      return;
    }
    if (notification.userId == this.userId) {
      const currentLanguage = this.translate.currentLang;
      // Create a new notification object with the received data
      const newNotification = {
        displayMessage: currentLanguage === 'en' ? notification.englishMessage : notification.message,
        idskvNotification: notification.id,
        time: notification.time,
        seen: false,
        englishMessage: notification.englishMessage,
        link: notification.Link,
        priority: notification.priority
      };

      // Add the notification to the list
      this.notifications.push(newNotification);
      console.log('Updated notifications:', this.notifications);
    }
  }

  sortNotificationsByTime(notifications: any[]): any[] {
    return notifications.sort((a, b) => {
      const dateA = new Date(a.time).getTime();
      const dateB = new Date(b.time).getTime();
      return dateB - dateA; // Newest first
    });
  }


  toggleNotificationsDropdown(event: Event) {
    //
    event.stopPropagation();
    this.notificationsDropdownVisible = !this.notificationsDropdownVisible;

    if (this.notificationsDropdownVisible) {
      //
      this.closeOtherDropdowns.emit(); // Emit event to close other dropdowns in the parent
    }

    if (!this.notificationsDropdownVisible) {
      this.markNotificationsAsSeen();
    }
  }
  markNotificationsAsSeen() {
    const unseenNotifications = this.notifications
      .filter(notification => !notification.seen)
      .map(notification => {
        notification.seen = true; // Mark notification as seen
        return {
          IdskvNotification: notification.idskvNotification,
          Opened: true
        };
      });
      
    if (unseenNotifications.length > 0) {
      this.notificationService.updateNotificationsOpened(unseenNotifications).subscribe(
        () => console.log('Notifications marked as opened'),
        (error) => console.error('Error marking notifications as opened', error)
      );
    }
  }


  markNotificationsAsSeen2() {
    this.notifications.forEach(notification => {
      if (!notification.seen) {
        notification.seen = true; // Mark notification as seen
        this.notificationService.updateNotificationOpened(notification.idskvNotification).subscribe(
          () => console.log('Notification marked as opened'),
          (error) => console.error('Error marking notification as opened', error)
        );
      }
    });
  }

  get unseenNotificationCount() {
    return this.notifications.filter(notification => !notification.seen).length;
  }

  setActiveTab(tab: 'new' | 'old', event: Event) {
    event.stopPropagation();
    this.activeTab = tab;
  }

  getFilteredNotifications() {
    const filtered = this.activeTab === 'new'
      ? this.notifications.filter(notification => !notification.seen)
      : this.notifications.filter(notification => notification.seen);

    console.log(this.notifications);
    return this.sortNotificationsByTime(filtered);
  }


  async getRedirectionLink(notification: NotificationsDTO): Promise<string> {
    try {
      
      const response = await this.notificationService.getNotificationRedirectionLink(notification.idskvNotification);
      return response;
    } catch (error) {
      console.error('Error in getRedirectionLink:', error);
      return "/dashboard"; // Default redirection in case of an error
    }
  }


  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    const dropdown = document.querySelector('.notifications-dropdown');
    const bellContainer = document.querySelector('.bell-container');

    // Check if the click is outside the notifications dropdown and bell icon
    if (this.notificationsDropdownVisible && !dropdown?.contains(target) && !bellContainer?.contains(target)) {
      this.notificationsDropdownVisible = false;
      this.markNotificationsAsSeen();
    }
  }


  get newNotificationsCount() {
    return this.notifications.filter(notification => !notification.seen).length;
  }

  get oldNotificationsCount() {
    return this.notifications.filter(notification => notification.seen).length;
  }


  async navigateToNotification(notification: any, event: Event) {
    
    try {
      const url = await this.getRedirectionLink(notification);
      
      if (url.startsWith('http') || url.startsWith('https')) {
        // For external URLs (full URLs), redirect using window.location.href
        
        window.location.href = url;

      } else {
        if (url != "") {
          this.router.navigateByUrl(url);
        }
      }
      this.markNotificationAsSeen(notification);
    this.notificationsDropdownVisible = false;
  } catch(error) {
    console.error('Error navigating to notification link:', error);
    // Handle error (e.g., redirect to a default page or show an error message)
  }
}




  markNotificationAsSeen(notification: any) {
    const index = this.notifications.findIndex(n => n.idskvNotification === notification.idskvNotification);
    if (index !== -1) {
      this.notifications[index].seen = true;
      this.notificationService.updateNotificationOpened(notification.idskvNotification).subscribe(
        () => console.log('Notification marked as opened'),
        (error) => console.error('Error marking notification as opened', error)
      );
    }
  }
   
  async deleteNotification(notificationId: string, event: Event): Promise<void> {
    event.stopPropagation();
    this.notifications = this.notifications.filter(notification => notification.idskvNotification !== notificationId);

    try {
      await this.notificationService.deleteNotification(parseInt(notificationId));
      console.log(`Notification ${notificationId} deleted`);
    } catch (error: any) {
      console.error(`Error deleting notification ${notificationId}`, error);
    }
  }
   
  navigateToNotificationsPage(): void {
    this.router.navigate(['/notifications-page']);
    this.notificationsDropdownVisible = false;
  }

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
}
