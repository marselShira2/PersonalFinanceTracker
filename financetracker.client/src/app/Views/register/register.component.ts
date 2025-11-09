import { Component, NgZone, inject, Renderer2, ElementRef, ChangeDetectorRef, ViewChild } from '@angular/core';
import { MessageService, MenuItem, ConfirmationService } from 'primeng/api';
import { ProgressBarModule } from 'primeng/progressbar';
import { ToastModule } from 'primeng/toast';
 

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
  providers: [ConfirmationService, MessageService,
    ProgressBarModule, ToastModule]
})

export class RegisterComponent { }
