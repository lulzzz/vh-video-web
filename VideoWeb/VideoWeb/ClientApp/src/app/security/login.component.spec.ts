import { async, ComponentFixture, TestBed, fakeAsync } from '@angular/core/testing';
import { LoginComponent } from './login.component';
import { AdalService } from 'adal-angular4';
import { MockAdalService } from '../testing/mocks/MockAdalService';
import { RouterTestingModule } from '@angular/router/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { ReturnUrlService } from '../services/return-url.service';


describe('LoginComponent', () => {
    let component: LoginComponent;
    let fixture: ComponentFixture<LoginComponent>;
    let adalService: MockAdalService;
    let returnUrlService: ReturnUrlService;
    let returnUrlServiceSpy: jasmine.SpyObj<ReturnUrlService>;
    let route: ActivatedRoute;
    let router: Router;

    beforeEach(() => {
        returnUrlServiceSpy = jasmine.createSpyObj<ReturnUrlService>('ReturnUrlService', ['popUrl', 'setUrl']);

        TestBed.configureTestingModule({
            declarations: [LoginComponent],
            imports: [RouterTestingModule],
            providers: [
                { provide: AdalService, useClass: MockAdalService },
                { provide: ReturnUrlService, useValue: returnUrlServiceSpy }
            ]
        }).compileComponents();
        adalService = TestBed.get(AdalService);
        route = TestBed.get(ActivatedRoute);
        router = TestBed.get(Router);
        returnUrlService = TestBed.get(ReturnUrlService);
        fixture = TestBed.createComponent(LoginComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
