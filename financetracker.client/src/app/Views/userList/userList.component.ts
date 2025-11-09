import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { usersService } from '../../services/users.service';
import { UserDetailsDTO } from '../../Models/user-details-dto.model';
import { Table } from 'primeng/table';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { MessageService, MenuItem, ConfirmationService } from 'primeng/api'; 
import { AuthService } from '../../services/auth.service';
import { SelectItem } from 'primeng/api';

@Component({
  selector: 'app-userList',
  templateUrl: './userList.component.html',
  styleUrls: ['./userList.component.css'],
  providers: [ConfirmationService, MessageService]
})
export class UserListComponent  { }
