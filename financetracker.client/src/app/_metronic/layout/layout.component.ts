import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  ElementRef,
  ChangeDetectorRef,
  AfterViewInit
} from '@angular/core';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { LayoutService } from './core/layout.service';
import { LayoutInitService } from './core/layout-init.service';
import { ILayout, LayoutType } from './core/configs/config';
import { UserService } from '../../services/user/user.service';
import { LogsLoginDTO } from '../../interfaces/user-login.model';
import { JwtService } from '../../services/jwt/jwt.service';

@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss'],
})
export class LayoutComponent implements OnInit, OnDestroy, AfterViewInit {
  private unsubscribe: Subscription[] = [];

  // Header
  appHeaderDefaultClass = '';
  appHeaderDisplay = true;
  appHeaderDefaultStickyEnabled = false;
  appHeaderDefaultStickyAttributes: { [attrName: string]: string } = {};
  appHeaderDefaultMinimizeEnabled = false;
  appHeaderDefaultMinimizeAttributes: { [attrName: string]: string } = {};

  // Sidebar
  appSidebarDisplay = true;
  appSidebarPanelDisplay = false;
  appSidebarDefaultClass = '';
  appSidebarDefaultDrawerEnabled = false;
  appSidebarDefaultDrawerAttributes: { [attrName: string]: string } = {};
  appSidebarDefaultStickyEnabled = false;
  appSidebarDefaultStickyAttributes: { [attrName: string]: string } = {};
  @ViewChild('ktSidebar', { static: true }) ktSidebar: ElementRef;

  // Content
  contentCSSClasses = '';
  contentContainerCSSClass = '';
  appContentContainer: 'fixed' | 'fluid' = 'fluid';
  appContentContainerClass = '';

  // Footer
  appFooterDisplay = true;
  appFooterCSSClass = '';
  appFooterContainerCSSClass = '';
  appFooterContainer = '';

  // ScrollTop
  scrolltopDisplay = true;

  // Logs
  logs: LogsLoginDTO[] = [];
  visibleLogs = false;
  isLoading = false;

  permission: string[] = [];

  constructor(
    private initService: LayoutInitService,
    private layout: LayoutService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private userService: UserService,
    private cdr: ChangeDetectorRef,
    private jwtService: JwtService
  ) {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        const currentLayoutType = this.layout.currentLayoutTypeSubject.value;

        const nextLayoutType: LayoutType =
          this.activatedRoute?.firstChild?.snapshot.data['layout'] ||
          this.layout.getBaseLayoutTypeFromLocalStorage();

        if (currentLayoutType !== nextLayoutType || !currentLayoutType) {
          this.layout.currentLayoutTypeSubject.next(nextLayoutType);
          this.initService.reInitProps(nextLayoutType);
        }
      }

      this.permission = this.jwtService.getUserPermissions();
    });
  }

  ngOnInit() {
    const subscr = this.layout.layoutConfigSubject
      .asObservable()
      .subscribe((config) => {
        this.updateProps(config);
      });
    this.unsubscribe.push(subscr);
  }

  ngAfterViewInit() {
    // Initialize layout safely after view init
  }

  updateProps(config: ILayout) {
    this.scrolltopDisplay = this.layout.getProp('scrolltop.display', config) as boolean;
    this.appHeaderDefaultClass = this.layout.getProp('app.header.default.class', config) as string;
    this.appHeaderDisplay = this.layout.getProp('app.header.display', config) as boolean;
    this.appFooterDisplay = this.layout.getProp('app.footer.display', config) as boolean;
    this.appSidebarDisplay = this.layout.getProp('app.sidebar.display', config) as boolean;
    this.appSidebarPanelDisplay = this.layout.getProp('app.sidebar-panel.display', config) as boolean;
    this.contentCSSClasses = this.layout.getStringCSSClasses('content');
    this.contentContainerCSSClass = this.layout.getStringCSSClasses('contentContainer');
    this.appContentContainer = this.layout.getProp('app.content.container', config) as 'fixed' | 'fluid';
    this.appContentContainerClass = this.layout.getProp('app.content.containerClass', config) as string;
  }

  hasPermission(permission: string): boolean {
    return this.permission.some(p => p.includes(permission));
  }

  ngOnDestroy() {
    this.unsubscribe.forEach(sb => sb.unsubscribe());
  }

  onClickLogs() {
    this.isLoading = true;
    this.userService.getLogsLogin().subscribe({
      next: (response: any) => {
        this.logs = response || [];
        this.visibleLogs = true;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.logs = [];
        this.visibleLogs = true;
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  navigateToLogs() {
    this.visibleLogs = false;
    this.router.navigate(['/logs']);
  }
}
