import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { inject } from '@angular/core';
import { MessageService } from 'primeng/api';
import { AuthResponse } from '../interfaces/auth-response';
import { CheckMfa } from '../interfaces/check-mfa';
import { TranslateService } from '@ngx-translate/core';
import { UserRoleService } from './../services/user-role.services'; 
import { of, from, never } from 'rxjs';
import { map, catchError, switchMap } from 'rxjs/operators';
import { CookieService } from 'ngx-cookie-service';

export const authGuard: CanActivateFn = (route, state) => {
  const messageService = inject(MessageService);
  const router = inject(Router);
  const authService = inject(AuthService);
  const translate = inject(TranslateService);
  const userRightsService = inject(UserRoleService);
  const cookieService = inject(CookieService);

  const currentLang = cookieService.get('selectedLanguage') || 'sq';


  return from(authService.isLoggedIn()).pipe(
    
    //switchMap((isLoggedIn) => {
    //  if (!isLoggedIn) {
    //    router.navigate(['/auth/login']); // Redirect if not logged in
    //    return of(false);
    //  }

    //  const user = authService.getUserDetail();

    //  return userRightsService.getUserRights().pipe(
    //    map((rights: string[]) => {
    //      const route = state.url; 
    //      // Switch case for rights-based access control
    //      switch (route) {
    //        case '/usersList':
    //          if (!rights.includes('usli')) {
    //            showUnauthorizedMessage(messageService, translate, currentLang, router);
    //            return false;
    //          }
    //          break;

    //      }
         
    //      return true;
    //    }),
    //    catchError((err) => {
    //      console.error('Error fetching user rights:', err);
    //      router.navigate(['/dashboard']); 
    //      return of(false);
    //    })
    //  );
    //}),
    catchError((err) => {
      console.error('Error during login check:', err);
      router.navigate(['/auth/login']); 
      return of(false);
    })
  );
};

// Helper function to show unauthorized message and redirect
function showUnauthorizedMessage(
  messageService: MessageService,
  translate: TranslateService,
  currentLang: string,
  router: Router): void {
  translate.get('MESSAGE_Unauthorized', 'LNG_CONFIGURATIONS').subscribe(() => {
    messageService.add({
      severity: 'warn',
      summary: currentLang === 'sq' ? 'Konfigurimet' : 'Configurations',
      detail: currentLang === 'sq' ? 'Nuk keni autorizim!' : 'You are not authorized!',
    });
  });

  router.navigate(['/dashboard']); // Redirect user to a safe route
}


// MFA GUARD
export const mfaGuard: CanActivateFn = async (route, state) => {
  const messageService = inject(MessageService);
  const router = inject(Router);
  const authService = inject(AuthService);

  const isLoggedIn = await authService.isLoggedInBeforeMfa(); // Await the asynchronous call

  if (isLoggedIn) {
    return true; // User is logged in before MFA
  }

  router.navigate(['/auth/login']);
  return false; // User is not logged in
};

export const initialRedirectGuard: CanActivateFn = async (route, state) => {
  const router = inject(Router);
  const authService = inject(AuthService);

  const isLoggedIn = await authService.isLoggedIn(); // Await the asynchronous call

  if (isLoggedIn) {
    router.navigate(['/dashboard']);
  } else {
    router.navigate(['/auth/login']);
  }

  return false; // Prevents further navigation as we are redirecting
};

