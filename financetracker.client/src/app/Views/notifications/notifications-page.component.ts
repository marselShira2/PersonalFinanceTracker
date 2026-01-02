import { Component, OnInit } from '@angular/core';
import { NotificationService } from '../../services/notifications.service';
import { MessageService, ConfirmationService } from 'primeng/api';

interface NotificationItem {
  notificationId: number;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: Date;
}

interface NotificationResponse {
  notifications: NotificationItem[];
  totalCount: number;
  unreadCount: number;
  hasMore: boolean;
}

@Component({
  selector: 'app-notifications-page',
  templateUrl: './notifications-page.component.html',
  styleUrls: ['./notifications-page.component.css']
})
export class NotificationsPageComponent implements OnInit {
  notifications: NotificationItem[] = [];
  totalCount = 0;
  unreadCount = 0;
  readCount = 0;
  hasMore = false;
  loading = false;
  currentPage = 1;
  pageSize = 10;

  constructor(
    private notificationService: NotificationService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit(): void {
    this.loadNotifications();
  }

  async loadNotifications(reset = true): Promise<void> {
    this.loading = true;
    
    try {
      if (reset) {
        this.currentPage = 1;
        this.notifications = [];
      }

      const response = await this.notificationService.getNotificationsPaginated(this.currentPage, this.pageSize);
      
      if (reset) {
        this.notifications = response.notifications;
      } else {
        this.notifications = [...this.notifications, ...response.notifications];
      }
      
      this.totalCount = response.totalCount;
      this.unreadCount = response.unreadCount;
      this.readCount = this.totalCount - this.unreadCount;
      this.hasMore = response.hasMore;
      
    } catch (error) {
      console.error('Error loading notifications:', error);
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to load notifications'
      });
    } finally {
      this.loading = false;
    }
  }

  async loadMore(): Promise<void> {
    this.currentPage++;
    await this.loadNotifications(false);
  }

  async markAsRead(notificationId: number): Promise<void> {
    try {
      await this.notificationService.markAsRead(notificationId);
      
      const notification = this.notifications.find(n => n.notificationId === notificationId);
      if (notification) {
        notification.isRead = true;
        this.unreadCount--;
        this.readCount++;
      }
      
      this.messageService.add({
        severity: 'success',
        summary: 'Success',
        detail: 'Notification marked as read'
      });
    } catch (error) {
      console.error('Error marking notification as read:', error);
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to mark notification as read'
      });
    }
  }

  async markAllAsRead(): Promise<void> {
    this.confirmationService.confirm({
      message: 'Are you sure you want to mark all notifications as read?',
      header: 'Confirm Action',
      icon: 'pi pi-exclamation-triangle',
      accept: async () => {
        try {
          await this.notificationService.markAllAsRead();
          
          this.notifications.forEach(n => n.isRead = true);
          this.readCount = this.totalCount;
          this.unreadCount = 0;
          
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'All notifications marked as read'
          });
        } catch (error) {
          console.error('Error marking all notifications as read:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to mark all notifications as read'
          });
        }
      }
    });
  }

  async deleteNotification(notificationId: number): Promise<void> {
    this.confirmationService.confirm({
      message: 'Are you sure you want to delete this notification?',
      header: 'Confirm Delete',
      icon: 'pi pi-exclamation-triangle',
      accept: async () => {
        try {
          await this.notificationService.deleteNotification(notificationId);
          
          const index = this.notifications.findIndex(n => n.notificationId === notificationId);
          if (index > -1) {
            const notification = this.notifications[index];
            if (!notification.isRead) {
              this.unreadCount--;
            } else {
              this.readCount--;
            }
            this.notifications.splice(index, 1);
            this.totalCount--;
          }
          
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Notification deleted'
          });
        } catch (error) {
          console.error('Error deleting notification:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to delete notification'
          });
        }
      }
    });
  }

  async deleteAllRead(): Promise<void> {
    this.confirmationService.confirm({
      message: 'Are you sure you want to delete all read notifications?',
      header: 'Confirm Delete',
      icon: 'pi pi-exclamation-triangle',
      accept: async () => {
        try {
          const result = await this.notificationService.deleteAllRead();
          
          this.notifications = this.notifications.filter(n => !n.isRead);
          this.totalCount -= this.readCount;
          this.readCount = 0;
          
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: `${result.deletedCount} read notifications deleted`
          });
        } catch (error) {
          console.error('Error deleting read notifications:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to delete read notifications'
          });
        }
      }
    });
  }

  getTypeLabel(type: string): string {
    const typeLabels: { [key: string]: string } = {
      'general': 'General',
      'expense_warning': 'Expense Warning',
      'budget_exceeded': 'Budget Alert',
      'transaction_added': 'Transaction',
      'welcome': 'Welcome'
    };
    return typeLabels[type] || 'Notification';
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString() + ' ' + new Date(date).toLocaleTimeString();
  }
}