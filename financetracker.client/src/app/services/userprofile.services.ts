import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { UserDetailsDTO } from '../Models/user-details-dto.model';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';
import { PersonDTOEmail } from '../Models/register-request';
import { BehaviorSubject } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class usersprofileservice {
  private apiUrl: string = environment.apiUrl;
  private profileImageChangedSource = new BehaviorSubject<boolean>(false);
  profileImageChanged$ = this.profileImageChangedSource.asObservable();
  constructor(private http: HttpClient, private router: Router) { }


  getUsers(): Observable<UserDetailsDTO[]> {
    const url = `${this.apiUrl}/userProfile/list`;
    return this.http.get<UserDetailsDTO[]>(url);
  }


  getListOfEmails(): Observable<PersonDTOEmail[]> {
    const url = `${this.apiUrl}/userProfile/GetEmails`;
    return this.http.get<PersonDTOEmail[]>(url);
  }


  getUserRole(): Observable<string[]> {
    const url = `${this.apiUrl}/userProfile/getUserRole`;
    return this.http.get<string[]>(url);
  }

  notifyImageChange(): void {
    this.profileImageChangedSource.next(true);
  }

  uploadProfileImage(formData: FormData): Observable<any> {
    const url = `${this.apiUrl}/userProfile/uploadProfileImage`;
    return this.http.post<any>(url, formData);
  }


  getProfileImage(): Observable<Blob> {
    const url = `${this.apiUrl}/userProfile/getProfileImage`;
    return this.http.get(url, { responseType: 'blob' });
  }
  
}
