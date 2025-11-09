import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { UserDetailsDTO, SelfDeclarationODTO, OperatorsdDTO, SDDocumentsDTO } from '../Models/user-details-dto.model';
import { catchError } from 'rxjs/operators';
import { PersonDTO, PersonDTOEmail,PersonDTOResult, newPhoneNumberDTO, editPhoneNumber, newEmailDTO, EmailDTOResult, PersonDTOPhoneNumbers, editEmail, newPassword, PersonDTOEdit, PasswordDTOResult, SubjectOperatorDTO, OperatorDTO, SectorDropdown, eventsDTO, operatorsDropdown, eventsHistoryDTO } from '../Models/register-request';
import { AuthResponse } from '../interfaces/auth-response';
import { environment } from '../../environments/environment';
import { Router } from '@angular/router'; 

@Injectable({
  providedIn: 'root'
})
export class usersService {
  private apiUrl: string = environment.apiUrl; 
    constructor(private http: HttpClient, private router: Router) { }
    visibleComponents: boolean = true;
    EditOrCreateNew: boolean = false;
    personId!: string | null;
  userIdEdit!: string | null;
  userRole!: string | null;


  getUsers(type : string): Observable<UserDetailsDTO[]> {
    const url = `${this.apiUrl}/Users/list?type=${type}`;
    return this.http.get<UserDetailsDTO[]>(url);
  } 

  getOperatorsSDList(): Observable<SelfDeclarationODTO[]> {
    //
    const url = `${this.apiUrl}/Users/vetedeklarimet_list`;
    return this.http.get<SelfDeclarationODTO[]>(url);
  }

  getDocumentsofSD(userId: string): Observable<SDDocumentsDTO[]> {
    //
    return this.http.get<SDDocumentsDTO[]>(`${this.apiUrl}/Users/GetDocumentsofSD`, {
      params: { id: userId } 
    });
  }

  getContent(idSelfdeclaration: number): Observable<SDDocumentsDTO[]> {
    
    return this.http.get<SDDocumentsDTO[]>(`${this.apiUrl}/Users/GeContentbySD`, {
      params: {
        id: idSelfdeclaration
      }
    });
  }


  getUserDetails(): Observable<UserDetailsDTO> {
    const url = `${this.apiUrl}/Users/details`; 
    return this.http.get<UserDetailsDTO>(url)
      .pipe(
        catchError(error => {
          console.error('Error fetching user details:', error);
          return throwError(error);
        })
      );
  }
  
  ChangePassword(data: newPassword) {
    console.log(data);
    const url = `${this.apiUrl}/Users/ChangePassword`;
    return this.http.post<PasswordDTOResult>(url, data).pipe(
      catchError(error => {
        console.error('Error changing password:', error);
        return throwError(error);
      })
    );;
  }
  GetPersonsWorker(): Observable<UserDetailsDTO[]> {
    const url = `${this.apiUrl}/Users/PersonWorker`;
    return this.http.get<UserDetailsDTO[]>(url);
  }

  
}
