import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  OnDestroy,
  ChangeDetectorRef
} from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
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
export class LayoutComponent implements OnInit, OnDestroy {
  private unsubscribe: Subscription[] = [];

  // Public variables
  // page
  pageContainerCSSClasses: string;
  // header
  appHeaderDefaultClass: string = '';
  appHeaderDisplay: boolean;
  appHeaderDefaultStickyEnabled: boolean;
  appHeaderDefaultStickyAttributes: { [attrName: string]: string } = {};
  appHeaderDefaultMinimizeEnabled: boolean;
  appHeaderDefaultMinimizeAttributes: { [attrName: string]: string } = {};


  // content
  appContentContiner?: 'fixed' | 'fluid';
  appContentContainerClass: string;
  contentCSSClasses: string;
  contentContainerCSSClass: string;
  // sidebar
  appSidebarDefaultClass: string;
  appSidebarDefaultDrawerEnabled: boolean;
  appSidebarDefaultDrawerAttributes: { [attrName: string]: string } = {};
  appSidebarDisplay: boolean;
  appSidebarDefaultStickyEnabled: boolean;
  appSidebarDefaultStickyAttributes: { [attrName: string]: string } = {};
  @ViewChild('ktSidebar', { static: true }) ktSidebar: ElementRef;
  /// sidebar panel
  appSidebarPanelDisplay: boolean;
  // footer
  appFooterDisplay: boolean;
  appFooterCSSClass: string = '';
  appFooterContainer: string = '';
  appFooterContainerCSSClass: string = '';
  appFooterFixedDesktop: boolean;
  appFooterFixedMobile: boolean;

  // scrolltop
  scrolltopDisplay: boolean;
  permission: string[] = [];

  // Logs
  logs: LogsLoginDTO[] = [];
  visibleLogs: boolean = false;
  isLoading: boolean = false;
  @ViewChild('ktAside', { static: true }) ktAside: ElementRef;
  @ViewChild('ktHeaderMobile', { static: true }) ktHeaderMobile: ElementRef;
  @ViewChild('ktHeader', { static: true }) ktHeader: ElementRef;

  constructor(
    private initService: LayoutInitService,
    private layout: LayoutService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private userService: UserService,
    private cdr: ChangeDetectorRef,
    private jwtService: JwtService
  ) {
    // define layout type and load layout
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

  //kontrollon nese useri ka te drejta te plota ose te pjesshme per x faqe
  hasPermission(permission: string): boolean {
    return this.permission.some(p => p.includes(permission));
  }


  ngOnInit() {
    const subscr = this.layout.layoutConfigSubject
      .asObservable()
      .subscribe((config) => {
        this.updateProps(config);
      });
    this.unsubscribe.push(subscr);
  }

  updateProps(config: ILayout) {
    this.scrolltopDisplay = this.layout.getProp(
      'scrolltop.display',
      config
    ) as boolean;
    this.pageContainerCSSClasses =
      this.layout.getStringCSSClasses('pageContainer');
    this.appHeaderDefaultClass = this.layout.getProp(
      'app.header.default.class',
      config
    ) as string;
    this.appHeaderDisplay = this.layout.getProp(
      'app.header.display',
      config
    ) as boolean;
    this.appFooterDisplay = this.layout.getProp(
      'app.footer.display',
      config
    ) as boolean;
    this.appSidebarDisplay = this.layout.getProp(
      'app.sidebar.display',
      config
    ) as boolean;
    this.appSidebarPanelDisplay = this.layout.getProp(
      'app.sidebar-panel.display',
      config
    ) as boolean;
    this.contentCSSClasses = this.layout.getStringCSSClasses('content');
    this.contentContainerCSSClass =
      this.layout.getStringCSSClasses('contentContainer');
    this.appContentContiner = this.layout.getProp(
      'app.content.container',
      config
    ) as 'fixed' | 'fluid';
    this.appContentContainerClass = this.layout.getProp(
      'app.content.containerClass',
      config
    ) as string;
    // footer
    if (this.appFooterDisplay) {
      this.updateFooter(config);
    }
    // sidebar
    if (this.appSidebarDisplay) {
      this.updateSidebar(config);
    }
    // header
    if (this.appHeaderDisplay) {
      this.updateHeader(config);
    }

  }

  updateSidebar(config: ILayout) {
    this.appSidebarDefaultClass = this.layout.getProp(
      'app.sidebar.default.class',
      config
    ) as string;

    this.appSidebarDefaultDrawerEnabled = this.layout.getProp(
      'app.sidebar.default.drawer.enabled',
      config
    ) as boolean;
    if (this.appSidebarDefaultDrawerEnabled) {
      this.appSidebarDefaultDrawerAttributes = this.layout.getProp(
        'app.sidebar.default.drawer.attributes',
        config
      ) as { [attrName: string]: string };
    }

    this.appSidebarDefaultStickyEnabled = this.layout.getProp(
      'app.sidebar.default.sticky.enabled',
      config
    ) as boolean;
    if (this.appSidebarDefaultStickyEnabled) {
      this.appSidebarDefaultStickyAttributes = this.layout.getProp(
        'app.sidebar.default.sticky.attributes',
        config
      ) as { [attrName: string]: string };
    }

    setTimeout(() => {
      const sidebarElement = document.getElementById('kt_app_sidebar');
      // sidebar
      if (this.appSidebarDisplay && sidebarElement) {
        const sidebarAttributes = sidebarElement
          .getAttributeNames()
          .filter((t) => t.indexOf('data-') > -1);
        sidebarAttributes.forEach((attr) =>
          sidebarElement.removeAttribute(attr)
        );

        if (this.appSidebarDefaultDrawerEnabled) {
          for (const key in this.appSidebarDefaultDrawerAttributes) {
            if (this.appSidebarDefaultDrawerAttributes.hasOwnProperty(key)) {
              sidebarElement.setAttribute(
                key,
                this.appSidebarDefaultDrawerAttributes[key]
              );
            }
          }
        }

        if (this.appSidebarDefaultStickyEnabled) {
          for (const key in this.appSidebarDefaultStickyAttributes) {
            if (this.appSidebarDefaultStickyAttributes.hasOwnProperty(key)) {
              sidebarElement.setAttribute(
                key,
                this.appSidebarDefaultStickyAttributes[key]
              );
            }
          }
        }
      }
    }, 0);
  }

  updateHeader(config: ILayout) {
    this.appHeaderDefaultStickyEnabled = this.layout.getProp(
      'app.header.default.sticky.enabled',
      config
    ) as boolean;
    if (this.appHeaderDefaultStickyEnabled) {
      this.appHeaderDefaultStickyAttributes = this.layout.getProp(
        'app.header.default.sticky.attributes',
        config
      ) as { [attrName: string]: string };
    }

    this.appHeaderDefaultMinimizeEnabled = this.layout.getProp(
      'app.header.default.minimize.enabled',
      config
    ) as boolean;
    if (this.appHeaderDefaultMinimizeEnabled) {
      this.appHeaderDefaultMinimizeAttributes = this.layout.getProp(
        'app.header.default.minimize.attributes',
        config
      ) as { [attrName: string]: string };
    }

    setTimeout(() => {
      const headerElement = document.getElementById('kt_app_header');
      // header
      if (this.appHeaderDisplay && headerElement) {
        const headerAttributes = headerElement
          .getAttributeNames()
          .filter((t) => t.indexOf('data-') > -1);
        headerAttributes.forEach((attr) => headerElement.removeAttribute(attr));

        if (this.appHeaderDefaultStickyEnabled) {
          for (const key in this.appHeaderDefaultStickyAttributes) {
            if (this.appHeaderDefaultStickyAttributes.hasOwnProperty(key)) {
              headerElement.setAttribute(
                key,
                this.appHeaderDefaultStickyAttributes[key]
              );
            }
          }
        }

        if (this.appHeaderDefaultMinimizeEnabled) {
          for (const key in this.appHeaderDefaultMinimizeAttributes) {
            if (this.appHeaderDefaultMinimizeAttributes.hasOwnProperty(key)) {
              headerElement.setAttribute(
                key,
                this.appHeaderDefaultMinimizeAttributes[key]
              );
            }
          }
        }
      }
    }, 0);
  }

  updateFooter(config: ILayout) {
    this.appFooterCSSClass = this.layout.getProp('app.footer.class', config) as string;
    this.appFooterContainer = this.layout.getProp('app.footer.container', config) as string;
    this.appFooterContainerCSSClass = this.layout.getProp('app.footer.containerClass', config) as string;
    if (this.appFooterContainer === 'fixed') {
      this.appFooterContainerCSSClass += ' container-xxl';
    } else {
      if (this.appFooterContainer === 'fluid') {
        this.appFooterContainerCSSClass += ' container-fluid';
      }
    }

    this.appFooterFixedDesktop = this.layout.getProp('app.footer.fixed.desktop', config) as boolean;
    if (this.appFooterFixedDesktop) {
      document.body.setAttribute('data-kt-app-footer-fixed', 'true')
    }

    this.appFooterFixedMobile = this.layout.getProp('app.footer.fixed.mobile') as boolean;
    if (this.appFooterFixedMobile) {
      document.body.setAttribute('data-kt-app-footer-fixed-mobile', 'true')
    }
  }

  ngOnDestroy() {
    this.unsubscribe.forEach((sb) => sb.unsubscribe());
  }

  onClickLogs() {
    this.isLoading = true;
    this.userService.getLogsLogin().subscribe({
      next: (response: any) => {
        debugger
        this.visibleLogs = true;
        this.logs = response ? response : [];
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.visibleLogs = true;
        this.isLoading = false;
        this.logs = [];
        this.cdr.detectChanges();
      }
    });
  }
  navigateToLogs() {
    this.visibleLogs = false;
    this.router.navigate(['/logs']);
  }
}
