// src/app/services/user/user.service.ts
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { PhotoDTO } from '../../interfaces/photo.model';
import { LogsLoginDTO } from '../../interfaces/user-login.model';

@Injectable({ providedIn: 'root' })
export class UserService {
  getUserPhoto(userId: string): Observable<PhotoDTO> {
    return;
  }

  getLogsLogin(): Observable<LogsLoginDTO[]> {
    return of([]);
  }
}
