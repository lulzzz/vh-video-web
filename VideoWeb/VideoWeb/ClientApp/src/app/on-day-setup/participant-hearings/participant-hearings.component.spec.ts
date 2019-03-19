import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ParticipantHearingsComponent } from './participant-hearings.component';
import { ConferenceForUserResponse } from '../../services/clients/api-client';
import { SharedModule } from 'src/app/shared/shared.module';
import { of } from 'rxjs';
import { ConferenceTestData } from 'src/app/testing/mocks/data/conference-test-data';
import { VideoWebService } from 'src/app/services/video-web.service';

describe('ParticipantHearingsComponent with no conferences for user', () => {
  let videoWebServiceSpy: jasmine.SpyObj<VideoWebService>;
  let component: ParticipantHearingsComponent;
  let fixture: ComponentFixture<ParticipantHearingsComponent>;
  const noConferences: ConferenceForUserResponse[] = [];

  beforeEach(() => {
    videoWebServiceSpy = jasmine.createSpyObj<VideoWebService>('VideoWebService', ['getConferencesForUser']);
    videoWebServiceSpy.getConferencesForUser.and.returnValue(of(noConferences));

    TestBed.configureTestingModule({
      imports: [SharedModule],
      declarations: [ParticipantHearingsComponent],
      providers: [
        { provide: VideoWebService, useValue: videoWebServiceSpy }
      ]
    })
      .compileComponents();

    fixture = TestBed.createComponent(ParticipantHearingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show no hearings message', () => {
    expect(component.hasHearings()).toBeFalsy();
  });
});

describe('ParticipantHearingsComponent with conferences for user', () => {
  let videoWebServiceSpy: jasmine.SpyObj<VideoWebService>;
  let component: ParticipantHearingsComponent;
  let fixture: ComponentFixture<ParticipantHearingsComponent>;
  const conferences = new ConferenceTestData().getTestData();

  beforeEach(() => {
    videoWebServiceSpy = jasmine.createSpyObj<VideoWebService>('VideoWebService', ['getConferencesForUser']);
    videoWebServiceSpy.getConferencesForUser.and.returnValue(of(conferences));

    TestBed.configureTestingModule({
      imports: [SharedModule],
      declarations: [ParticipantHearingsComponent],
      providers: [
        { provide: VideoWebService, useValue: videoWebServiceSpy }
      ]
    })
      .compileComponents();

    fixture = TestBed.createComponent(ParticipantHearingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should list hearings', () => {
    expect(component.hasHearings()).toBeTruthy();
  });

  it('should not show sign in when start time is more 30 minutes from start time', () => {
    const conference = new ConferenceTestData().getConferenceFuture();
    expect(component.canStartHearing(conference)).toBeFalsy();
  });

  it('should show sign in when start time is less than 30 minutes from start time', () => {
    const conference = new ConferenceTestData().getConferencePast();
    expect(component.canStartHearing(conference)).toBeTruthy();
  });
});
