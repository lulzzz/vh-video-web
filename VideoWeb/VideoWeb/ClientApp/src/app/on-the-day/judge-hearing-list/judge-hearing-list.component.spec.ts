import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { configureTestSuite } from 'ng-bullet';
import { of, throwError } from 'rxjs';
import { VideoWebService } from 'src/app/services/api/video-web.service';
import { ErrorService } from 'src/app/services/error.service';
import { SharedModule } from 'src/app/shared/shared.module';
import { ConferenceTestData } from 'src/app/testing/mocks/data/conference-test-data';
import { JudgeHearingTableStubComponent } from 'src/app/testing/stubs/judge-hearing-list-table-stub';
import { ConferenceForUserResponse } from '../../services/clients/api-client';
import { JudgeHearingListComponent } from './judge-hearing-list.component';
import { ProfileService } from 'src/app/services/api/profile.service';
import { MockProfileService } from 'src/app/testing/mocks/MockProfileService';
import { PageUrls } from 'src/app/shared/page-url.constants';

describe('JudgeHearingListComponent with no conferences for user', () => {
  let videoWebServiceSpy: jasmine.SpyObj<VideoWebService>;
  let component: JudgeHearingListComponent;
  let fixture: ComponentFixture<JudgeHearingListComponent>;
  const noConferences: ConferenceForUserResponse[] = [];

  configureTestSuite(() => {
    videoWebServiceSpy = jasmine.createSpyObj<VideoWebService>('VideoWebService', ['getConferencesForUser']);
    videoWebServiceSpy.getConferencesForUser.and.returnValue(of(noConferences));

    TestBed.configureTestingModule({
      imports: [RouterTestingModule, SharedModule],
      declarations: [JudgeHearingListComponent, JudgeHearingTableStubComponent],
      providers: [
        { provide: VideoWebService, useValue: videoWebServiceSpy },
        { provide: ProfileService, useClass: MockProfileService }
      ]
    });
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(JudgeHearingListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should show no hearings message', () => {
    expect(component.hasHearings()).toBeFalsy();
  });
});

describe('JudgeHearingListComponent with conferences for user', () => {
  let videoWebServiceSpy: jasmine.SpyObj<VideoWebService>;
  let component: JudgeHearingListComponent;
  let fixture: ComponentFixture<JudgeHearingListComponent>;
  const conferences = new ConferenceTestData().getTestData();
  let router: Router;
  let profileService: ProfileService;

  configureTestSuite(() => {
    videoWebServiceSpy = jasmine.createSpyObj<VideoWebService>('VideoWebService', ['getConferencesForUser']);
    videoWebServiceSpy.getConferencesForUser.and.returnValue(of(conferences));

    TestBed.configureTestingModule({
      imports: [SharedModule, RouterTestingModule],
      declarations: [JudgeHearingListComponent, JudgeHearingTableStubComponent],
      providers: [
        { provide: VideoWebService, useValue: videoWebServiceSpy },
        { provide: ProfileService, useClass: MockProfileService }
      ]
    });
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(JudgeHearingListComponent);
    component = fixture.componentInstance;
    router = TestBed.get(Router);
    profileService = TestBed.get(ProfileService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should list hearings', () => {
    expect(component.hasHearings()).toBeTruthy();
  });

  it('should have profile name as the court name', async () => {
    const profile = (<MockProfileService>profileService).mockProfile;
    component.profile = profile;
    expect(component.courtName).toBe(`${profile.first_name}, ${profile.last_name}`);
  });

  it('should navigate to judge waiting room when conference is selected', () => {
    spyOn(router, 'navigate').and.callFake(() =>  {});
    const conference = conferences[0];
    component.onConferenceSelected(conference);
    expect(router.navigate).toHaveBeenCalledWith([PageUrls.JudgeWaitingRoom, conference.id]);
  });
});

describe('JudgeHearingListComponent with service error', () => {
  let videoWebServiceSpy: jasmine.SpyObj<VideoWebService>;
  let component: JudgeHearingListComponent;
  let fixture: ComponentFixture<JudgeHearingListComponent>;
  let errorService: ErrorService;

  configureTestSuite(() => {
    videoWebServiceSpy = jasmine.createSpyObj<VideoWebService>('VideoWebService', ['getConferencesForUser']);
    videoWebServiceSpy.getConferencesForUser.and.returnValue(throwError({ status: 401, isApiException: true }));

    TestBed.configureTestingModule({
      imports: [SharedModule, RouterTestingModule],
      declarations: [JudgeHearingListComponent, JudgeHearingTableStubComponent],
      providers: [
        { provide: VideoWebService, useValue: videoWebServiceSpy },
        { provide: ProfileService, useClass: MockProfileService }
      ]
    });
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(JudgeHearingListComponent);
    component = fixture.componentInstance;
    errorService = TestBed.get(ErrorService);
  });

  it('should handle api error with error service', () => {
    spyOn(errorService, 'handleApiError').and.callFake(() => { Promise.resolve(true); });
    fixture.detectChanges();
    expect(component).toBeTruthy();
    expect(component.loadingData).toBeFalsy();
    expect(errorService.handleApiError).toHaveBeenCalled();
  });
});
