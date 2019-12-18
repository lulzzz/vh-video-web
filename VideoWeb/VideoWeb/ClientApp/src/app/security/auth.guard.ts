import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AdalService } from 'adal-angular4';
import { MsalService } from '@azure/msal-angular';

@Injectable()
export class AuthGuard implements CanActivate {

    constructor(private adalSvc: AdalService, private router: Router, private msalSvc: MsalService) { }

    canActivate(): boolean {
        /* if (this.adalSvc.userInfo.authenticated) { */
        if (this.msalSvc._oauthData.isAuthenticated) {
            return true;
        }
        this.router.navigate(['/login']);
        return false;
    }
}
