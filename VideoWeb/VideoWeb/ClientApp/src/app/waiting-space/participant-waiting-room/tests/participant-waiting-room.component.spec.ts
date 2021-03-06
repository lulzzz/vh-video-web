import { fakeAsync, flushMicrotasks, tick } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, Router } from '@angular/router';
import { AdalService } from 'adal-angular4';
import { of, Subscription, BehaviorSubject } from 'rxjs';
import { ConsultationService } from 'src/app/services/api/consultation.service';
import { VideoWebService } from 'src/app/services/api/video-web.service';
import { ConferenceResponse, ConferenceStatus, ParticipantResponse, Role, TokenResponse } from 'src/app/services/clients/api-client';
import { ClockService } from 'src/app/services/clock.service';
import { DeviceTypeService } from 'src/app/services/device-type.service';
import { ErrorService } from 'src/app/services/error.service';
import { Logger } from 'src/app/services/logging/logger-base';
import { HeartbeatModelMapper } from 'src/app/shared/mappers/heartbeat-model-mapper';
import { Hearing } from 'src/app/shared/models/hearing';
import { pageUrls } from 'src/app/shared/page-url.constants';
import { ConferenceTestData } from 'src/app/testing/mocks/data/conference-test-data';
import { consultationServiceSpyFactory } from 'src/app/testing/mocks/mock-consultation-service';
import { eventsServiceSpy } from 'src/app/testing/mocks/mock-events-service';
import { videoCallServiceSpy } from 'src/app/testing/mocks/mock-video-call-service';
import { ParticipantWaitingRoomComponent } from '../participant-waiting-room.component';
import { SelectedUserMediaDevice } from '../../../shared/models/selected-user-media-device';
import { UserMediaService } from 'src/app/services/user-media.service';
import { UserMediaDevice } from '../../../shared/models/user-media-device';
import { UserMediaStreamService } from 'src/app/services/user-media-stream.service';
import { MediaDeviceTestData } from 'src/app/testing/mocks/data/media-device-test-data';
import { HearingRole } from '../../models/hearing-role-model';
import { NotificationSoundsService } from '../../services/notification-sounds.service';

describe('ParticipantWaitingRoomComponent when conference exists', () => {
    let component: ParticipantWaitingRoomComponent;
    const gloalConference = new ConferenceTestData().getConferenceDetailPast() as ConferenceResponse;
    const globalParticipant = gloalConference.participants.filter(x => x.role === Role.Individual)[0];

    const activatedRoute: ActivatedRoute = <any>{ snapshot: { paramMap: convertToParamMap({ conferenceId: gloalConference.id }) } };
    let videoWebService: jasmine.SpyObj<VideoWebService>;
    const eventsService = eventsServiceSpy;

    let adalService: jasmine.SpyObj<AdalService>;
    let errorService: jasmine.SpyObj<ErrorService>;

    let clockService: jasmine.SpyObj<ClockService>;
    let router: jasmine.SpyObj<Router>;
    let heartbeatModelMapper: HeartbeatModelMapper;
    let deviceTypeService: jasmine.SpyObj<DeviceTypeService>;
    const videoCallService = videoCallServiceSpy;
    let consultationService: jasmine.SpyObj<ConsultationService>;
    let notificationSoundsService: jasmine.SpyObj<NotificationSoundsService>;
    let logger: jasmine.SpyObj<Logger>;
    let userMediaService: jasmine.SpyObj<UserMediaService>;
    let userMediaStreamService: jasmine.SpyObj<UserMediaStreamService>;
    const mockCamStream = jasmine.createSpyObj<MediaStream>('MediaStream', ['getVideoTracks']);
    const mockMicStream = jasmine.createSpyObj<MediaStream>('MediaStream', ['getAudioTracks']);
    const testDataDevice = new MediaDeviceTestData();

    const jwToken = new TokenResponse({
        expires_on: '06/10/2020 01:13:00',
        token:
            'eyJhbGciOiJIUzUxMuIsInR5cCI6IkpXRCJ9.eyJ1bmlxdWVfbmFtZSI6IjA0NjllNGQzLTUzZGYtNGExYS04N2E5LTA4OGI0MmExMTQxMiIsIm5iZiI6MTU5MTcyMjcyMCwiZXhwIjoxNTkxNzUxNjQwLCJpYXQiOjE1OTE3MjI3ODAsImlzcyI6ImhtY3RzLnZpZGVvLmhlYXJpbmdzLnNlcnZpY2UifO.USebpA7R7GUiPwF-uSuAd7Sx-bveOFi8LNE3oV7SLxdxASTlq7MfwhgYJhaC69OQAhWcrV7wSdcZ2OS-ZHkSUg'
    });

    beforeAll(() => {
        videoWebService = jasmine.createSpyObj<VideoWebService>('VideoWebService', [
            'getConferenceById',
            'getObfuscatedName',
            'getJwToken'
        ]);
        videoWebService.getConferenceById.and.resolveTo(gloalConference);
        videoWebService.getObfuscatedName.and.returnValue('t***** u*****');
        videoWebService.getJwToken.and.resolveTo(jwToken);

        adalService = jasmine.createSpyObj<AdalService>('AdalService', ['init', 'handleWindowCallback', 'userInfo', 'logOut'], {
            userInfo: <adal.User>{ userName: globalParticipant.username, authenticated: true }
        });
        errorService = jasmine.createSpyObj<ErrorService>('ErrorService', ['goToServiceError', 'handleApiError']);

        clockService = jasmine.createSpyObj<ClockService>('ClockService', ['getClock']);
        clockService.getClock.and.returnValue(of(new Date()));
        router = jasmine.createSpyObj<Router>('Router', ['navigate']);
        heartbeatModelMapper = new HeartbeatModelMapper();
        deviceTypeService = jasmine.createSpyObj<DeviceTypeService>('DeviceTypeService', [
            'getBrowserName',
            'getBrowserVersion',
            'isSupportedBrowser'
        ]);

        consultationService = consultationServiceSpyFactory();

        logger = jasmine.createSpyObj<Logger>('Logger', ['debug', 'info', 'warn', 'event', 'error']);
        userMediaService = jasmine.createSpyObj<UserMediaService>('UserMediaService', [
            'updatePreferredCamera',
            'updatePreferredMicrophone',
            'getPreferredCamera',
            'getPreferredMicrophone'
        ]);
        userMediaStreamService = jasmine.createSpyObj<UserMediaStreamService>('UserMediaStreamService', [
            'stopStream',
            'getStreamForCam',
            'getStreamForMic'
        ]);
        userMediaStreamService.getStreamForCam.and.resolveTo(mockCamStream);
        userMediaStreamService.getStreamForMic.and.resolveTo(mockMicStream);
        userMediaService.getPreferredCamera.and.resolveTo(testDataDevice.getListOfCameras()[0]);
        userMediaService.getPreferredMicrophone.and.resolveTo(testDataDevice.getListOfMicrophones()[0]);
        notificationSoundsService = jasmine.createSpyObj<NotificationSoundsService>('NotificationSoundsService', [
            'playHearingAlertSound',
            'initHearingAlertSound'
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

        const conference = new ConferenceResponse(Object.assign({}, gloalConference));
        const participant = new ParticipantResponse(Object.assign({}, globalParticipant));
        component.hearing = new Hearing(conference);
        component.conference = conference;
        component.participant = participant;
        component.connected = true; // assume connected to pexip
        videoWebService.getConferenceById.calls.reset();
    });

    afterEach(() => {
        component.ngOnDestroy();
    });

    it('should init hearing alert and subscribers', fakeAsync(() => {
        component.ngOnInit();
        flushMicrotasks();
        tick(100);
        expect(component.clockSubscription$).toBeDefined();
        expect(component.eventHubSubscription$).toBeDefined();
        expect(component.videoCallSubscription$).toBeDefined();
        expect(component.displayDeviceChangeModal).toBeFalsy();
        expect(notificationSoundsService.initHearingAlertSound).toHaveBeenCalled();
    }));

    it('should handle api error with error service', async () => {
        component.hearing = undefined;
        component.conference = undefined;
        component.participant = undefined;
        component.connected = false;

        const error = { status: 401, isApiException: true };
        videoWebService.getConferenceById.and.rejectWith(error);
        await component.getConference();
        expect(component.loadingData).toBeFalsy();
        expect(component.hearing).toBeUndefined();
        expect(component.participant).toBeUndefined();
        expect(errorService.handleApiError).toHaveBeenCalled();
    });

    it('should get conference', async () => {
        component.hearing = undefined;
        component.conference = undefined;
        component.participant = undefined;
        component.connected = false;

        videoWebService.getConferenceById.and.resolveTo(gloalConference);
        await component.getConference();
        expect(component).toBeTruthy();
        expect(component.loadingData).toBeFalsy();
        expect(component.hearing).toBeDefined();
        expect(component.participant).toBeDefined();
    });

    it('should not announce hearing is starting when already announced', () => {
        spyOn(component, 'announceHearingIsAboutToStart').and.callFake(() => {});
        component.hearingStartingAnnounced = true;
        component.checkIfHearingIsStarting();
        expect(component.announceHearingIsAboutToStart).toHaveBeenCalledTimes(0);
    });

    it('should not announce hearing is not ready to start', () => {
        spyOn(component, 'announceHearingIsAboutToStart').and.callFake(() => {});
        component.hearing = new Hearing(new ConferenceTestData().getConferenceDetailFuture());
        component.hearingStartingAnnounced = false;
        component.checkIfHearingIsStarting();
        expect(component.announceHearingIsAboutToStart).toHaveBeenCalledTimes(0);
    });

    it('should announce hearing ready to start and not already announced', () => {
        spyOn(component, 'announceHearingIsAboutToStart').and.callFake(() => {});
        component.hearing = new Hearing(new ConferenceTestData().getConferenceDetailNow());
        component.hearingStartingAnnounced = false;
        component.checkIfHearingIsStarting();
        expect(component.announceHearingIsAboutToStart).toHaveBeenCalledTimes(1);
    });

    it('should clear subscription and go to hearing list when conference is past closed time', () => {
        const conf = new ConferenceTestData().getConferenceDetailNow();
        const status = ConferenceStatus.Closed;
        const closedDateTime = new Date(new Date().toUTCString());
        closedDateTime.setUTCMinutes(closedDateTime.getUTCMinutes() - 30);
        conf.status = status;
        conf.closed_date_time = closedDateTime;
        component.hearing = new Hearing(conf);
        component.clockSubscription$ = jasmine.createSpyObj<Subscription>('Subscription', ['unsubscribe']);

        component.checkIfHearingIsClosed();

        expect(component.clockSubscription$.unsubscribe).toHaveBeenCalled();
        expect(router.navigate).toHaveBeenCalledWith([pageUrls.ParticipantHearingList]);
    });

    it('should return empty status text when not started', () => {
        const conference = new ConferenceTestData().getConferenceDetailFuture();
        component.hearing = new Hearing(conference);
        component.hearing.getConference().status = ConferenceStatus.NotStarted;
        expect(component.getConferenceStatusText()).toBe('');
    });

    it('should return "is about to begin" header text', () => {
        const conference = new ConferenceTestData().getConferenceDetailNow();
        conference.status = ConferenceStatus.NotStarted;
        component.hearing = new Hearing(conference);
        expect(component.getConferenceStatusText()).toBe('is about to begin');
    });

    it('should return "is delayed" header text', () => {
        const conference = new ConferenceTestData().getConferenceDetailPast();
        conference.status = ConferenceStatus.NotStarted;
        component.hearing = new Hearing(conference);
        expect(component.getConferenceStatusText()).toBe('is delayed');
    });

    it('should make call to video conference', () => {
        videoCallService.enableH264.calls.reset();
        spyOnProperty(window, 'navigator').and.returnValue({
            userAgent: 'Chrome'
        });
        component.call();
        expect(videoCallService.enableH264).toHaveBeenCalledTimes(0);
    });

    it('should make call to video conference and disable H264 on firefox ', () => {
        videoCallService.enableH264.calls.reset();
        spyOnProperty(window, 'navigator').and.returnValue({
            userAgent: 'FireFox'
        });
        component.call();
        expect(videoCallService.enableH264).toHaveBeenCalledWith(false);
    });

    it('should set hearing announced to true', () => {
        const alertElem = jasmine.createSpyObj<HTMLAudioElement>('HTMLAudioElement', ['play']);
        alertElem.play.and.callFake(() => Promise.resolve());
        component.hearingAlertSound = alertElem;

        component.announceHearingIsAboutToStart();
        expect(component.hearingStartingAnnounced).toBeTruthy();
    });

    it('should get token and connect to video call', async () => {
        await component.getJwtokenAndConnectToPexip();
        expect(component.token).toBeDefined();
        expect(videoCallService.makeCall).toHaveBeenCalled();
    });

    it('should raise leave consultation request on cancel consultation request', async () => {
        await component.onConsultationCancelled();
        expect(consultationService.leaveConsultation).toHaveBeenCalledWith(component.conference, component.participant);
    });

    it('should log error when cancelling consultation returns an error', async () => {
        const error = { status: 401, isApiException: true };
        consultationService.leaveConsultation.and.rejectWith(error);
        await component.onConsultationCancelled();
        expect(logger.error.calls.mostRecent().args[0]).toContain('Failed to leave private consultation');
    });

    const isSupportedBrowserForNetworkHealthTestCases = [
        { isSupportedBrowser: true, browserName: 'Chrome', expected: true },
        { isSupportedBrowser: false, browserName: 'Opera', expected: false },
        { isSupportedBrowser: true, browserName: 'Safari', expected: true },
        { isSupportedBrowser: true, browserName: 'MS-Edge', expected: false }
    ];

    isSupportedBrowserForNetworkHealthTestCases.forEach(testcase => {
        it(`should return ${testcase.expected} when browser is ${testcase.browserName}`, () => {
            deviceTypeService.isSupportedBrowser.and.returnValue(testcase.isSupportedBrowser);
            deviceTypeService.getBrowserName.and.returnValue(testcase.browserName);
            expect(component.isSupportedBrowserForNetworkHealth).toBe(testcase.expected);
        });
    });
    it('should display change device popup', () => {
        component.displayDeviceChangeModal = false;
        component.showChooseCameraDialog();
        expect(component.displayDeviceChangeModal).toBe(true);
    });
    it('should hide change device popup on close popup', () => {
        component.displayDeviceChangeModal = true;
        component.onMediaDeviceChangeCancelled();
        expect(component.displayDeviceChangeModal).toBe(false);
    });
    it('should change device on select device', () => {
        const device = new SelectedUserMediaDevice(
            new UserMediaDevice('camera1', 'id3445', 'videoinput', '1'),
            new UserMediaDevice('microphone', 'id123', 'audioinput', '1')
        );
        component.onMediaDeviceChangeAccepted(device);
        expect(userMediaService.updatePreferredCamera).toHaveBeenCalled();
        expect(userMediaService.updatePreferredMicrophone).toHaveBeenCalled();
        expect(videoCallService.makeCall).toHaveBeenCalled();
    });
    it('should on consultation accept stop streams for devices and close choose device popup', async () => {
        component.displayDeviceChangeModal = true;
        await component.onConsultationAccepted();

        expect(component.displayDeviceChangeModal).toBe(false);
        expect(userMediaStreamService.getStreamForMic).toHaveBeenCalled();
        expect(userMediaStreamService.getStreamForCam).toHaveBeenCalled();
        expect(userMediaStreamService.stopStream).toHaveBeenCalled();
    });
    it('should return false when the participant is not a witness', () => {
        component.participant.hearing_role = HearingRole.WINGER;

        expect(component.isWitness).toBeFalsy();
    });
    it('should return true when the participant is a witness', () => {
        component.participant.hearing_role = HearingRole.WITNESS;

        expect(component.isWitness).toBeTruthy();
    });
    it('should return false when the participant is not a witness', () => {
        component.participant.hearing_role = HearingRole.JUDGE;

        expect(component.isWitness).toBeFalsy();
    });
    it('should show extra content when not showing video and witness is not being transferred in', () => {
        component.isTransferringIn = false;
        component.showVideo = false;

        expect(component.showExtraContent).toBeTruthy();
    });
    it('should not show extra content when we are showing video and witness is not being transferred in', () => {
        component.isTransferringIn = false;
        component.showVideo = true;

        expect(component.showExtraContent).toBeFalsy();
    });
    it('should not show extra content when we are not showing video and witness is being transferred in', () => {
        component.isTransferringIn = true;
        component.showVideo = false;

        expect(component.showExtraContent).toBeFalsy();
    });
    it('should not show extra content when we are showing video and witness is being transferred in', () => {
        component.isTransferringIn = true;
        component.showVideo = true;

        expect(component.showExtraContent).toBeFalsy();
    });
});
