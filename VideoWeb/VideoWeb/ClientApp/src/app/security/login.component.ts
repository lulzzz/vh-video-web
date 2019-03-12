import { Router, ActivatedRoute } from '@angular/router';
import { OnInit, Component, Injectable } from '@angular/core';
import { AdalService } from 'adal-angular4';
import { ReturnUrlService } from '../services/return-url.service';

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html'
})

@Injectable()
export class LoginComponent implements OnInit {
    constructor(private adalSvc: AdalService,
        private route: ActivatedRoute,
        private router: Router,
        private returnUrlService: ReturnUrlService) {
    }

    ngOnInit() {
        this.checkAuthAndRedirect();
    }

    private checkAuthAndRedirect() {
        if (this.adalSvc.userInfo.authenticated) {
            const returnUrl = this.returnUrlService.popUrl() || '/';
            this.router.navigateByUrl(returnUrl).catch(e => {
                console.error(e);
                this.router.navigate(['/']);
            });
        } else {
            const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
            this.returnUrlService.setUrl(returnUrl);
            this.adalSvc.login();
        }
    }
}

