import { HttpClientModule } from '@angular/common/http';
import { async, ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { AdalService } from 'adal-angular4';
import { configureTestSuite } from 'ng-bullet';
import { AppComponent } from './app.component';
import { ConfigService } from './services/api/config.service';
import { ProfileService } from './services/api/profile.service';
import { ClientSettingsResponse, Role, UserProfileResponse } from './services/clients/api-client';
import { DeviceTypeService } from './services/device-type.service';
import { LocationService } from './services/location.service';
import { Logger } from './services/logging/logger-base';
import { PageTrackerService } from './services/page-tracker.service';
import { MockLogger } from './testing/mocks/MockLogger';
import { BetaBannerStubComponent } from './testing/stubs/beta-banner-stub';
import { FooterStubComponent } from './testing/stubs/footer-stub';
import { HeaderStubComponent } from './testing/stubs/header-stub';
import { ParticipantStatusUpdateService } from './services/participant-status-update.service';
import { eventsServiceSpy } from 'src/app/testing/mocks/mock-events-service';
import { EventsService } from './services/events.service';

describe('AppComponent', () => {
    let configServiceSpy: jasmine.SpyObj<ConfigService>;
    let adalServiceSpy: jasmine.SpyObj<AdalService>;
    let deviceTypeServiceSpy: jasmine.SpyObj<DeviceTypeService>;
    let profileServiceSpy: jasmine.SpyObj<ProfileService>;
    let locationServiceSpy: jasmine.SpyObj<LocationService>;
    let participantStatusUpdateService: jasmine.SpyObj<ParticipantStatusUpdateService>;

    const clientSettings = new ClientSettingsResponse({
        tenant_id: 'tenantid',
        client_id: 'clientid',
        post_logout_redirect_uri: '/logout',
        redirect_uri: '/home',
        video_api_url: 'http://vh-video-api/'
    });

    let component: AppComponent;
    let fixture: ComponentFixture<AppComponent>;
    let router: Router;
    let pageTracker: jasmine.SpyObj<PageTrackerService>;

    configureTestSuite(() => {
        configServiceSpy = jasmine.createSpyObj<ConfigService>('ConfigService', ['clientSettings', 'getClientSettings', 'loadConfig']);
        configServiceSpy.getClientSettings.and.returnValue(clientSettings);

        adalServiceSpy = jasmine.createSpyObj<AdalService>('AdalService', ['init', 'handleWindowCallback', 'userInfo', 'logOut']);

        deviceTypeServiceSpy = jasmine.createSpyObj<DeviceTypeService>(['isSupportedBrowser']);

        profileServiceSpy = jasmine.createSpyObj<ProfileService>('ProfileService', ['getUserProfile']);
        const profile = new UserProfileResponse({ role: Role.Representative });
        profileServiceSpy.getUserProfile.and.returnValue(Promise.resolve(profile));

        locationServiceSpy = jasmine.createSpyObj<LocationService>('LocationService', ['getCurrentUrl', 'getCurrentPathName']);
        pageTracker = jasmine.createSpyObj('PageTrackerService', ['trackNavigation', 'trackPreviousPage']);

        participantStatusUpdateService = jasmine.createSpyObj('ParticipantStatusUpdateService', ['postParticipantStatus']);
        participantStatusUpdateService.postParticipantStatus.and.returnValue(Promise.resolve());

        TestBed.configureTestingModule({
            imports: [HttpClientModule, RouterTestingModule],
            declarations: [AppComponent, HeaderStubComponent, FooterStubComponent, BetaBannerStubComponent],
            providers: [
                { provide: AdalService, useValue: adalServiceSpy },
                { provide: ConfigService, useValue: configServiceSpy },
                { provide: Logger, useClass: MockLogger },
                { provide: DeviceTypeService, useValue: deviceTypeServiceSpy },
                { provide: DeviceTypeService, useValue: deviceTypeServiceSpy },
                { provide: ProfileService, useValue: profileServiceSpy },
                { provide: LocationService, useValue: locationServiceSpy },
                { provide: PageTrackerService, useValue: pageTracker },
                { provide: ParticipantStatusUpdateService, useValue: participantStatusUpdateService },
                { provide: EventsService, useValue: eventsServiceSpy }
            ]
        });
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(AppComponent);
        component = fixture.componentInstance;
        deviceTypeServiceSpy.isSupportedBrowser.and.returnValue(true);
        router = TestBed.inject(Router);
        spyOn(router, 'navigate').and.returnValue(Promise.resolve(true));
        spyOn(router, 'navigateByUrl').and.returnValue(Promise.resolve(true));
    });

    it('should have a tag Skip to main content', () => {
        const compiled = fixture.debugElement.nativeElement;
        expect(compiled.querySelector('a').textContent).toContain('Skip to main content');
    });
});
