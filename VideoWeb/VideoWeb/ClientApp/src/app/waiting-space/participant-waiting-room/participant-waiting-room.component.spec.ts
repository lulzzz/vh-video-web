import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ParticipantWaitingRoomComponent } from './participant-waiting-room.component';
import { ParticipantStatusListStubComponent } from 'src/app/testing/stubs/participant-status-list-stub';
import { RouterTestingModule } from '@angular/router/testing';
import { SharedModule } from 'src/app/shared/shared.module';
import { VideoWebService } from 'src/app/services/video-web.service';
import { of, throwError } from 'rxjs';
import { ConferenceTestData } from 'src/app/testing/mocks/data/conference-test-data';
import { ActivatedRoute, convertToParamMap, Router } from '@angular/router';
import { ConferenceResponse, ConferenceStatus } from 'src/app/services/clients/api-client';
import { MockAdalService } from 'src/app/testing/mocks/MockAdalService';
import { AdalService } from 'adal-angular4';
import { MockConfigService } from 'src/app/testing/mocks/MockConfigService';
import { ConfigService } from 'src/app/services/config.service';
import { ServerSentEventsService } from 'src/app/services/server-sent-events.service';
import { MockServerSentEventsService } from 'src/app/testing/mocks/MockServerEventService';

describe('ParticipantWaitingRoomComponent when conference exists', () => {
  let component: ParticipantWaitingRoomComponent;
  let fixture: ComponentFixture<ParticipantWaitingRoomComponent>;
  let videoWebServiceSpy: jasmine.SpyObj<VideoWebService>;
  let route: ActivatedRoute;
  let conference: ConferenceResponse;
  let adalService: MockAdalService;
  let eventService: MockServerSentEventsService;

  beforeEach(() => {
    conference = new ConferenceTestData().getConferenceDetail();
    videoWebServiceSpy = jasmine.createSpyObj<VideoWebService>('VideoWebService', ['getConferenceById']);
    videoWebServiceSpy.getConferenceById.and.returnValue(of(conference));

    TestBed.configureTestingModule({
      imports: [SharedModule, RouterTestingModule],
      declarations: [ParticipantWaitingRoomComponent, ParticipantStatusListStubComponent],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: convertToParamMap({ conferenceId: conference.id })
            }
          },
        },
        { provide: VideoWebService, useValue: videoWebServiceSpy },
        { provide: AdalService, useClass: MockAdalService },
        { provide: ConfigService, useClass: MockConfigService },
        { provide: ServerSentEventsService, useClass: MockServerSentEventsService }
      ]
    })
      .compileComponents();

    adalService = TestBed.get(AdalService);
    eventService = TestBed.get(ServerSentEventsService);
    route = TestBed.get(ActivatedRoute);
    fixture = TestBed.createComponent(ParticipantWaitingRoomComponent);
    component = fixture.componentInstance;
    spyOn(component, 'call').and.callFake(() => { Promise.resolve(true); });
    fixture.detectChanges();
  });

  it('should create and display conference details', () => {
    expect(component).toBeTruthy();
    expect(component.loadingData).toBeFalsy();
    expect(component.conference).toBeDefined();
  });

  it('should redirect back home if conference not found', () => {
    expect(component).toBeTruthy();
    expect(component.loadingData).toBeFalsy();
    expect(component.conference).toBeDefined();
  });

  it('should update conference status', () => {
    const conferenceStatus = ConferenceStatus.InSession;
    component.handleHearingStatusChange(conferenceStatus);
    expect(component.conference.status).toBe(conferenceStatus);
  });

  it('should update participant status', () => {
    const message = eventService.nextParticipantStatusMessage;
    component.handleParticipantStatusChange(message);
  });
});

describe('ParticipantWaitingRoomComponent when service returns an error', () => {
  let component: ParticipantWaitingRoomComponent;
  let fixture: ComponentFixture<ParticipantWaitingRoomComponent>;
  let videoWebServiceSpy: jasmine.SpyObj<VideoWebService>;
  let route: ActivatedRoute;
  let router: Router;
  let conference: ConferenceResponse;
  let adalService: MockAdalService;

  beforeEach(() => {
    conference = new ConferenceTestData().getConferenceFuture();
    videoWebServiceSpy = jasmine.createSpyObj<VideoWebService>('VideoWebService', ['getConferenceById']);
    videoWebServiceSpy.getConferenceById.and.returnValue(throwError({ status: 404 }));

    TestBed.configureTestingModule({
      imports: [SharedModule, RouterTestingModule],
      declarations: [ParticipantWaitingRoomComponent, ParticipantStatusListStubComponent],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: convertToParamMap({ conferenceId: conference.id })
            }
          }
        },
        { provide: VideoWebService, useValue: videoWebServiceSpy },
        { provide: AdalService, useClass: MockAdalService },
        { provide: ConfigService, useClass: MockConfigService },
        { provide: ServerSentEventsService, useClass: MockServerSentEventsService }
      ]
    })
      .compileComponents();

    adalService = TestBed.get(AdalService);
    router = TestBed.get(Router);
    route = TestBed.get(ActivatedRoute);
    fixture = TestBed.createComponent(ParticipantWaitingRoomComponent);
    component = fixture.componentInstance;
  });

  it('should redirect back home if conference not found', () => {
    spyOn(router, 'navigate').and.callFake(() => { Promise.resolve(true); });
    fixture.detectChanges();
    expect(component).toBeTruthy();
    expect(component.loadingData).toBeFalsy();
    expect(component.conference).toBeUndefined();
    expect(component.participant).toBeUndefined();
    expect(router.navigate).toHaveBeenCalledWith(['home']);
  });
});
