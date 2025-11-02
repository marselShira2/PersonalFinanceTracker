import {
  Component,
  Input,
  OnInit,
  OnDestroy,
  ViewChild,
  ElementRef,
  Renderer2,
  ChangeDetectorRef,
} from '@angular/core';
import { NotificationService } from '../../../../../services/notifications/notification.service.';
import { NotificationsInnerComponent } from '../../../../../../app/_metronic/partials/layout/extras/dropdown-inner/notifications-inner/notifications-inner.component';
import { JwtService } from '../../../../../services/jwt/jwt.service';
import { UserService as UserServiceV2 } from '../../../../../services/user/user.service';
import { PhotoDTO } from '../../../../../interfaces/photo.model';
import { Router, NavigationStart } from '@angular/router';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
})
export class NavbarComponent implements OnInit, OnDestroy {
  @Input() appHeaderDefaulMenuDisplay: boolean = false;
  @Input() isRtl: boolean = false;

  @ViewChild(NotificationsInnerComponent) notificationsInner: NotificationsInnerComponent;
  @ViewChild('notificationsModal', { static: true }) notificationsModal!: NotificationsInnerComponent;

  itemClass = 'ms-1 ms-lg-3';
  btnClass = 'btn btn-icon btn-custom btn-icon-muted btn-active-light btn-active-color-primary w-35px h-35px w-md-40px h-md-40px';
  userAvatarClass = 'symbol-35px symbol-md-40px';
  btnIconClass = 'fs-2 fs-md-1';
  notificationModalWidth = '50vh';
  defaultImage = './assets/media/avatars/user-photo.png';

  userId: string | undefined;
  userImageUrl: string = this.defaultImage;
  userName: string | undefined;
  notificationCount = 0;

  isNotificationOpen = false;
  isUserMenuOpen = false;

  private globalClickUnlisten: (() => void) | null = null;
  private globalFocusUnlisten: (() => void) | null = null;

  constructor(
    private notificationService: NotificationService,
    private cdr: ChangeDetectorRef,
    private elRef: ElementRef,
    private renderer: Renderer2,
    private jwtService: JwtService,
    private userServiceV2: UserServiceV2,
    private router: Router
  ) { }

  ngOnInit(): void {
    const token = this.jwtService.decodeToken();
    this.userId = token?.UserID || '';
    this.userName = token?.fullname || '';

    //this.loadUserImage();

    //this.notificationService.notificationCount$.subscribe((count) => {
    //  this.notificationCount = count;
    //  this.cdr.detectChanges();
    //});

    this.router.events.subscribe((event) => {
      if (event instanceof NavigationStart) {
        this.closeAllMenus();
      }
    });

    // Delayed global listeners to allow menu toggling to complete before checking clicks
    this.globalClickUnlisten = this.renderer.listen('document', 'click', (event: Event) => {
      setTimeout(() => this.handleOutsideInteraction(event), 50);
    });

    this.globalFocusUnlisten = this.renderer.listen('document', 'focusin', (event: Event) => {
      setTimeout(() => this.handleOutsideInteraction(event), 50);
    });
  }

  ngOnDestroy(): void {
    if (this.globalClickUnlisten) this.globalClickUnlisten();
    if (this.globalFocusUnlisten) this.globalFocusUnlisten();
  }

  private handleOutsideInteraction(event: Event): void {
    const target = event.target as HTMLElement;
    if (!this.elRef.nativeElement.contains(target)) {
      this.closeAllMenus();
    }
  }

  async resetNotificationCount() {
    console.log("___resetNotificationCount")
    if (this.notificationsInner) {
     await this.notificationsInner.loadNewNotifications();
      //await this.notificationsInner.loadOldNotifications();
    }
  }

  sendNewNotification() {
    //const message = 'A new notification from the Navbar!';
    //this.notificationService.sendNotificationToBackend(message).subscribe({
    //  next: (response) => console.log('Response ListUser', response),
    //  error: (error) => console.error('Error sending notification to backend', error),
    //});
  }

  loadUserImage(): void {
    //if (!this.userId) return;
    //this.userServiceV2.getUserPhoto(this.userId).subscribe(
    //  (response: PhotoDTO) => {
    //    if (response.content) {
    //      this.userImageUrl = `data:image/${response.extension};base64,${response.content}`;
    //      this.cdr.detectChanges();
    //    }
    //  },
    //  (error) => console.error('Error fetching user image:', error)
    //);
  }

  toggleMenu(type: 'notification' | 'user') {
    if (type === 'notification') {
      this.isNotificationOpen = !this.isNotificationOpen;
      if (this.isNotificationOpen) this.isUserMenuOpen = false;
    } else {
      this.isUserMenuOpen = !this.isUserMenuOpen;
      if (this.isUserMenuOpen) this.isNotificationOpen = false;
    }
  }

  closeAllMenus() {
    this.isNotificationOpen = false;
    this.isUserMenuOpen = false;
    this.cdr.detectChanges();
  }
}
