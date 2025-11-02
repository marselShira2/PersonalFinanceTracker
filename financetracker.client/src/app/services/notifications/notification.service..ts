// src/app/services/notifications/notification.service.ts
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  sendNotification(msg: string): Observable<boolean> {
    console.log('Notification:', msg);
    return of(true);
  }
}
