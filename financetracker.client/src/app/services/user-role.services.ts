import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable, of } from 'rxjs';
import { BehaviorSubject } from 'rxjs';
import { UserRolesDTO } from '../Models/user-roles-dto.model';
import { RoleRightsListDTO } from '../interfaces/role-rights-list';



@Injectable({
  providedIn: 'root',
})
export class UserRoleService {
  apiUrl: string = environment.apiUrl;
  private userRights: { [key: string]: boolean } = {}; 
  private userRoles: { [key: string]: boolean } = {}; 
  constructor(private http: HttpClient) { }


}
