import { Injectable } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { BehaviorSubject, firstValueFrom } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable, of, lastValueFrom } from 'rxjs';
import { NotificationsDTO } from '../Models/notifications-dto.model';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private hubConnection: signalR.HubConnection;
  private notificationSubject = new BehaviorSubject<string>('');
  notification$ = this.notificationSubject.asObservable();
  apiUrl: string = environment.apiUrl;
  private username: string = "";

  apiUrlNot = environment.production == false ? `https://localhost:5001` : "https://kontrolli-tst.aksk.gov.al"; 
  constructor(private http: HttpClient, private authService: AuthService) {
    var user = authService.getUserDetail();
    this.username =  user?.email ?? "";
    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(`${this.apiUrlNot}/notificationHub?username=${encodeURIComponent(this.username)}`)
      .withAutomaticReconnect()  // Enable automatic reconnection
      .build();

    this.hubConnection.serverTimeoutInMilliseconds = 120000;  // Set timeout to 2 minutes

    this.hubConnection.start()
      .then(() => console.log('Connection started, connection ID:', this.hubConnection.connectionId) )
      .catch(err => {
        console.log('Error while starting connection: ' + err);
        setTimeout(() => this.hubConnection.start(), 5000);  // Retry after 5 seconds
      });

    this.hubConnection.on('ReceiveMessage', (userId: string, notification: any) => {
        this.notificationSubject.next(notification);
     
    });

    // Handle disconnection events
    this.hubConnection.onclose(() => {
      console.log('Connection closed. Trying to reconnect...');
    });

    this.hubConnection.onreconnected(() => {
      console.log('Reconnected to the hub.');
    });

    this.hubConnection.onreconnecting(() => {
      console.log('Connection lost, attempting to reconnect...');
    });
  }

  async getNotifications(): Promise<NotificationsDTO[]> {
    try {
      const notifications = await lastValueFrom(
        this.http.get<NotificationsDTO[]>(`${this.apiUrl}/Notifications/getallnotificationlist`)
      );
      return notifications;
    } catch (error) {
      console.error('Error fetching notifications:', error);
      throw error; // Re-throw the error for further handling
    }
  }

  async getNotificationRedirectionLink(notificationId: string): Promise<string> {
    try {
      const response = await lastValueFrom(
        this.http.get(`${this.apiUrl}/Notifications/getNotificationRedirectUrl?id=${notificationId}`, { responseType: 'text' })
      );
      return response;
    } catch (error) {
      console.error('Error fetching notification redirection link:', error);
      throw error;
    }
  }

  updateNotificationOpened(id: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/Notifications/updateOpenedColumn/${id}`, {
      opened: true
    });
  }

  updateNotificationsOpened(notifications: { IdskvNotification: string, Opened: boolean }[]): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/Notifications/updateOpenedColumn`, notifications);
  }

   
  //deleteNotification(notificationId: number): Observable<any> {
  //  return this.http.get(`${this.apiUrl}/Notifications/deleteNotification/${notificationId}`);
  //}

  deleteNotification(notificationId: string): Observable<any> {
    //
    return this.http.delete(`${this.apiUrl}/Notifications/deleteNotification/${notificationId}`);
  }

}
