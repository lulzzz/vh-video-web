import { fakeAsync, flushMicrotasks } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, Router } from '@angular/router';
import { AdalService } from 'adal-angular4';
import { Guid } from 'guid-typescript';
import { ConsultationService } from 'src/app/services/api/consultation.service';
import { VideoWebService } from 'src/app/services/api/video-web.service';
import {
    ConferenceResponse,
    ConferenceStatus,
    ConsultationAnswer,
    ParticipantResponse,
    ParticipantStatus,
    Role,
    RoomType,
    TokenResponse
} from 'src/app/services/clients/api-client';
import { ClockService } from 'src/app/services/clock.service';
import { DeviceTypeService } from 'src/app/services/device-type.service';
import { ErrorService } from 'src/app/services/error.service';
import { Logger } from 'src/app/services/logging/logger-base';
import { AdminConsultationMessage } from 'src/app/services/models/admin-consultation-message';
import { ConferenceStatusMessage } from 'src/app/services/models/conference-status-message';
import { HearingTransfer, TransferDirection } from 'src/app/services/models/hearing-transfer';
import { ParticipantStatusMessage } from 'src/app/services/models/participant-status-message';
import { UserMediaStreamService } from 'src/app/services/user-media-stream.service';
import { UserMediaService } from 'src/app/services/user-media.service';
import { HeartbeatModelMapper } from 'src/app/shared/mappers/heartbeat-model-mapper';
import { ConferenceTestData } from 'src/app/testing/mocks/data/conference-test-data';
import { consultationServiceSpyFactory } from 'src/app/testing/mocks/mock-consultation-service';
import {
    adminConsultationMessageSubjectMock,
    eventHubDisconnectSubjectMock,
    eventHubReconnectSubjectMock,
    eventsServiceSpy,
    hearingStatusSubjectMock,
    hearingTransferSubjectMock,
    participantStatusSubjectMock
} from 'src/app/testing/mocks/mock-events-service';
import { videoCallServiceSpy } from 'src/app/testing/mocks/mock-video-call-service';
import { MockLogger } from 'src/app/testing/mocks/MockLogger';
import { Hearing } from '../../../shared/models/hearing';
import { HearingRole } from '../../models/hearing-role-model';
import { NotificationSoundsService } from '../../services/notification-sounds.service';
import { ParticipantWaitingRoomComponent } from '../participant-waiting-room.component';

describe('ParticipantWaitingRoomComponent event hub events', () => {
    let component: ParticipantWaitingRoomComponent;
    let globalConference: ConferenceResponse;
    let globalParticipant: ParticipantResponse;
    let globalWitness: ParticipantResponse;
    let participantsWitness: ParticipantResponse[];
    const testdata = new ConferenceTestData();

    const eventsService = eventsServiceSpy;
    const participantStatusSubject = participantStatusSubjectMock;
    const hearingStatusSubject = hearingStatusSubjectMock;
    const adminConsultationMessageSubject = adminConsultationMessageSubjectMock;
    const eventHubDisconnectSubject = eventHubDisconnectSubjectMock;
    const eventHubReconnectSubject = eventHubReconnectSubjectMock;
    const hearingTransferSubject = hearingTransferSubjectMock;

    const videoCallService = videoCallServiceSpy;
    let activatedRoute: ActivatedRoute;
    let videoWebService: jasmine.SpyObj<VideoWebService>;

    let adalService: jasmine.SpyObj<AdalService>;
    let errorService: jasmine.SpyObj<ErrorService>;

    let clockService: jasmine.SpyObj<ClockService>;
    let router: jasmine.SpyObj<Router>;
    let heartbeatModelMapper: HeartbeatModelMapper;
    let deviceTypeService: jasmine.SpyObj<DeviceTypeService>;

    let consultationService: jasmine.SpyObj<ConsultationService>;
    const logger: Logger = new MockLogger();
    let userMediaService: jasmine.SpyObj<UserMediaService>;
    let userMediaStreamService: jasmine.SpyObj<UserMediaStreamService>;
    let notificationSoundsService: jasmine.SpyObj<NotificationSoundsService>;

    const jwToken = new TokenResponse({
        expires_on: '06/10/2020 01:13:00',
        token:
            'eyJhbGciOiJIUzUxMuIsInR5cCI6IkpXRCJ9.eyJ1bmlxdWVfbmFtZSI6IjA0NjllNGQzLTUzZGYtNGExYS04N2E5LTA4OGI0MmExMTQxMiIsIm5iZiI6MTU5MTcyMjcyMCwiZXhwIjoxNTkxNzUxNjQwLCJpYXQiOjE1OTE3MjI3ODAsImlzcyI6ImhtY3RzLnZpZGVvLmhlYXJpbmdzLnNlcnZpY2UifO.USebpA7R7GUiPwF-uSuAd7Sx-bveOFi8LNE3oV7SLxdxASTlq7MfwhgYJhaC69OQAhWcrV7wSdcZ2OS-ZHkSUg'
    });

    beforeAll(() => {
        globalConference = testdata.getConferenceDetailPast() as ConferenceResponse;
        participantsWitness = testdata.getListOfParticipantsWitness();
        participantsWitness.forEach(x => {
            globalConference.participants.push(x);
        });
        globalParticipant = globalConference.participants.filter(x => x.role === Role.Individual)[0];
        globalWitness = globalConference.participants.filter(x => x.hearing_role === HearingRole.WITNESS)[0];
        activatedRoute = <any>{ snapshot: { paramMap: convertToParamMap({ conferenceId: globalConference.id }) } };

        videoWebService = jasmine.createSpyObj<VideoWebService>('VideoWebService', [
            'getConferenceById',
            'getObfuscatedName',
            'getJwToken'
        ]);
        videoWebService.getConferenceById.and.resolveTo(globalConference);
        videoWebService.getObfuscatedName.and.returnValue('t***** u*****');
        videoWebService.getJwToken.and.resolveTo(jwToken);

        adalService = jasmine.createSpyObj<AdalService>('AdalService', ['init', 'handleWindowCallback', 'userInfo', 'logOut'], {
            userInfo: <adal.User>{ userName: globalParticipant.username, authenticated: true }
        });
        errorService = jasmine.createSpyObj<ErrorService>('ErrorService', ['goToServiceError', 'handleApiError']);

        clockService = jasmine.createSpyObj<ClockService>('ClockService', ['getClock']);
        router = jasmine.createSpyObj<Router>('Router', ['navigate']);
        heartbeatModelMapper = new HeartbeatModelMapper();
        deviceTypeService = jasmine.createSpyObj<DeviceTypeService>('DeviceTypeService', ['getBrowserName', 'getBrowserVersion']);
        consultationService = consultationServiceSpyFactory();
        userMediaService = jasmine.createSpyObj<UserMediaService>('UserMediaService', [
            'updatePreferredCamera',
            'updatePreferredMicrophone'
        ]);
        userMediaStreamService = jasmine.createSpyObj<UserMediaStreamService>('UserMediaStreamService', [
            'stopStream',
            'getStreamForCam',
            'getStreamForMic'
        ]);
        notificationSoundsService = jasmine.createSpyObj<NotificationSoundsService>('NotificationSoundsService', [
            'playHearingAlertSound',
            'stopHearingAlertSound'
        ]);
    });

    beforeEach(() => {
        component = new ParticipantWaitingRoomComponent(
            activatedRoute,
            videoWebService,
            eventsService,
            adalService,
            logger,
            errorService,
            heartbeatModelMapper,
            videoCallService,
            deviceTypeService,
            router,
            consultationService,
            clockService,
            userMediaService,
            userMediaStreamService,
            notificationSoundsService
        );
        adalService.userInfo.userName = globalParticipant.username;

        const conference = new ConferenceResponse(Object.assign({}, globalConference));
        const participant = new ParticipantResponse(Object.assign({}, globalParticipant));
        component.hearing = new Hearing(conference);
        component.conference = conference;
        component.participant = participant;
        component.connected = true; // assume connected to pexip
        component.startEventHubSubscribers();
        videoWebService.getConferenceById.calls.reset();
    });

    afterEach(() => {
        component.eventHubSubscription$.unsubscribe();
    });

    it('should update transferring in when inTransfer message has been received', fakeAsync(() => {
        const transferDirection = TransferDirection.In;
        const payload = new HearingTransfer(globalConference.id, globalParticipant.id, transferDirection);

        hearingTransferSubject.next(payload);
        flushMicrotasks();

        expect(component.isTransferringIn).toBeTruthy();
    }));

    it('should not update transferring in when inTransfer message has been received and participant is not current user', fakeAsync(() => {
        const transferDirection = TransferDirection.In;
        const participant = globalConference.participants.filter(x => x.id !== globalParticipant.id)[0];
        const payload = new HearingTransfer(globalConference.id, participant.id, transferDirection);

        hearingTransferSubject.next(payload);
        flushMicrotasks();

        expect(component.isTransferringIn).toBeFalsy();
    }));

    it('should not update transferring in when inTransfer message has been received and is for a different conference', fakeAsync(() => {
        const transferDirection = TransferDirection.In;
        const payload = new HearingTransfer(Guid.create().toString(), globalParticipant.id, transferDirection);

        hearingTransferSubject.next(payload);
        flushMicrotasks();

        expect(component.isTransferringIn).toBeFalsy();
    }));

    it('should update conference status, play hearing sound and show video when "in session" message received and participant is not a witness', fakeAsync(() => {
        const status = ConferenceStatus.InSession;
        const message = new ConferenceStatusMessage(globalConference.id, status);
        notificationSoundsService.playHearingAlertSound.calls.reset();
        hearingStatusSubject.next(message);
        flushMicrotasks();

        expect(component.hearing.status).toBe(status);
        expect(component.conference.status).toBe(status);
        expect(component.showVideo).toBeTruthy();
        expect(component.getConferenceStatusText()).toBe('is in session');
        expect(notificationSoundsService.playHearingAlertSound).toHaveBeenCalled();
    }));

    it('should update conference status, not play hearing sound and not show video when "in session" message received and participant is a witness', fakeAsync(() => {
        adalService.userInfo.userName = globalWitness.username;
        component.participant = globalWitness;
        const status = ConferenceStatus.InSession;
        const message = new ConferenceStatusMessage(globalConference.id, status);
        notificationSoundsService.playHearingAlertSound.calls.reset();

        hearingStatusSubject.next(message);
        flushMicrotasks();

        expect(component.hearing.status).toBe(status);
        expect(component.conference.status).toBe(status);
        expect(component.showVideo).toBeFalsy();
        expect(component.getConferenceStatusText()).toBe('is in session');
        expect(notificationSoundsService.playHearingAlertSound).toHaveBeenCalledTimes(0);
    }));

    it('should show video when participant is witness and status is set to "hearing"', fakeAsync(() => {
        adalService.userInfo.userName = globalWitness.username;
        component.participant = globalWitness;
        component.conference.status = ConferenceStatus.InSession;
        component.hearing.getConference().status = ConferenceStatus.InSession;
        const status = ParticipantStatus.InHearing;
        const message = new ParticipantStatusMessage(globalWitness.id, globalWitness.username, globalConference.id, status);

        participantStatusSubject.next(message);
        flushMicrotasks();

        expect(component.showVideo).toBeTruthy();
    }));

    it('should update conference status and get closed time when "closed" message received', fakeAsync(() => {
        const status = ConferenceStatus.Closed;
        const confWithCloseTime = new ConferenceResponse(Object.assign({}, globalConference));
        confWithCloseTime.closed_date_time = new Date();
        confWithCloseTime.status = status;
        videoWebService.getConferenceById.and.resolveTo(confWithCloseTime);

        const message = new ConferenceStatusMessage(globalConference.id, status);

        hearingStatusSubject.next(message);
        flushMicrotasks();

        expect(component.hearing.status).toBe(status);
        expect(component.conference.status).toBe(status);
        expect(component.showVideo).toBeFalsy();
        expect(videoWebService.getConferenceById).toHaveBeenCalledWith(globalConference.id);
        expect(component.getConferenceStatusText()).toBe('is closed');
        expect(notificationSoundsService.stopHearingAlertSound).toHaveBeenCalled();
    }));

    it('should return correct conference status text when suspended', fakeAsync(() => {
        const status = ConferenceStatus.Suspended;
        const message = new ConferenceStatusMessage(globalConference.id, status);

        hearingStatusSubject.next(message);
        flushMicrotasks();

        expect(component.hearing.status).toBe(status);
        expect(component.conference.status).toBe(status);
        expect(component.showVideo).toBeFalsy();
        expect(component.getConferenceStatusText()).toBe('is suspended');
    }));

    it('should return correct conference status text when paused', fakeAsync(() => {
        const status = ConferenceStatus.Paused;
        const message = new ConferenceStatusMessage(globalConference.id, status);

        hearingStatusSubject.next(message);
        flushMicrotasks();

        expect(component.hearing.status).toBe(status);
        expect(component.conference.status).toBe(status);
        expect(component.showVideo).toBeFalsy();
        expect(component.getConferenceStatusText()).toBe('is paused');
    }));

    it('should update participant status to available', () => {
        const status = ParticipantStatus.Available;
        const message = new ParticipantStatusMessage(globalParticipant.id, globalParticipant.username, globalConference.id, status);

        participantStatusSubject.next(message);

        const participant = component.hearing.getConference().participants.find(x => x.id === message.participantId);
        expect(participant.status).toBe(message.status);
        expect(component.isAdminConsultation).toBeFalsy();
        expect(component.showVideo).toBeFalsy();
    });

    it('should update logged in participant status to in consultation', () => {
        const status = ParticipantStatus.InConsultation;
        const participant = globalParticipant;
        const message = new ParticipantStatusMessage(participant.id, participant.username, globalConference.id, status);
        component.connected = true;

        participantStatusSubject.next(message);

        expect(component.participant.status).toBe(message.status);
        expect(component.showVideo).toBeTruthy();
        expect(component.isAdminConsultation).toBeFalsy();
    });

    it('should update non logged in participant status to in consultation', () => {
        const status = ParticipantStatus.InConsultation;
        const participant = globalConference.participants.filter(x => x.id !== globalParticipant.id)[0];
        const message = new ParticipantStatusMessage(participant.id, participant.username, globalConference.id, status);
        component.connected = true;
        component.participant.status = ParticipantStatus.Available;
        participantStatusSubject.next(message);

        const postUpdateParticipant = component.hearing.getConference().participants.find(p => p.id === message.participantId);
        expect(postUpdateParticipant.status).toBe(message.status);
        expect(component.showVideo).toBeFalsy();
    });

    it('should not set isAdminConsultation to true when participant has rejected admin consultation', () => {
        const message = new AdminConsultationMessage(
            globalConference.id,
            RoomType.ConsultationRoom1,
            globalParticipant.username,
            ConsultationAnswer.Rejected
        );
        adminConsultationMessageSubject.next(message);
        expect(component.isAdminConsultation).toBeFalsy();
    });

    it('should set isAdminConsultation to true when participant accepts admin consultation', () => {
        const message = new AdminConsultationMessage(
            globalConference.id,
            RoomType.ConsultationRoom1,
            globalParticipant.username,
            ConsultationAnswer.Accepted
        );
        adminConsultationMessageSubject.next(message);
        expect(component.isAdminConsultation).toBeTruthy();
    });

    it('should get conference when disconnected from eventhub less than 7 times', fakeAsync(() => {
        component.participant.status = ParticipantStatus.InHearing;
        component.conference.status = ConferenceStatus.InSession;

        const newParticipantStatus = ParticipantStatus.InConsultation;
        const newConferenceStatus = ConferenceStatus.Paused;
        const newConference = new ConferenceResponse(Object.assign({}, globalConference));
        newConference.status = newConferenceStatus;
        newConference.participants.find(x => x.id === globalParticipant.id).status = newParticipantStatus;

        videoWebService.getConferenceById.and.resolveTo(newConference);
        eventHubDisconnectSubject.next(1);
        eventHubDisconnectSubject.next(2);
        eventHubDisconnectSubject.next(3);
        eventHubDisconnectSubject.next(4);
        eventHubDisconnectSubject.next(5);
        eventHubDisconnectSubject.next(6);

        flushMicrotasks();
        expect(videoWebService.getConferenceById).toHaveBeenCalledTimes(6);
        expect(component.participant.status).toBe(newParticipantStatus);
        expect(component.conference.status).toBe(newConferenceStatus);
        expect(component.conference).toEqual(newConference);
    }));

    it('should go to service error when disconnected from eventhub more than 7 times', () => {
        eventHubDisconnectSubject.next(8);
        expect(videoWebService.getConferenceById).toHaveBeenCalledTimes(0);
    });

    it('should get conference on eventhub reconnect', () => {
        videoWebService.getConferenceById.calls.reset();
        errorService.goToServiceError.calls.reset();
        eventHubReconnectSubject.next();
        expect(videoWebService.getConferenceById).toHaveBeenCalledTimes(1);
    });
});
