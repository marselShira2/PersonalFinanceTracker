
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UserDetailsDTO } from '../../Models/user-details-dto.model';
@Injectable({
  providedIn: 'root'
})
export class usersList {
  private apiUrl = 'http://localhost:5001/api/Users'; // Replace with your actual API URL 
  constructor(private http: HttpClient) { }

  getUsers(): Observable<UserDetailsDTO[]> {
    return this.http.get<UserDetailsDTO[]>(this.apiUrl);
  }
}
