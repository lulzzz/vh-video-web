import { ActivatedRoute, convertToParamMap, Router } from '@angular/router';
import { AdalService } from 'adal-angular4';
import { ConsultationService } from 'src/app/services/api/consultation.service';
import { VideoWebService } from 'src/app/services/api/video-web.service';
import { ConferenceStatus } from 'src/app/services/clients/api-client';
import { ClockService } from 'src/app/services/clock.service';
import { DeviceTypeService } from 'src/app/services/device-type.service';
import { ErrorService } from 'src/app/services/error.service';
import { Logger } from 'src/app/services/logging/logger-base';
import { HeartbeatModelMapper } from 'src/app/shared/mappers/heartbeat-model-mapper';
import { ConferenceTestData } from 'src/app/testing/mocks/data/conference-test-data';
import { consultationServiceSpyFactory } from 'src/app/testing/mocks/mock-consultation-service';
import { eventsServiceSpy } from 'src/app/testing/mocks/mock-events-service';
import { videoCallServiceSpy } from 'src/app/testing/mocks/mock-video-call-service';
import { MockLogger } from 'src/app/testing/mocks/MockLogger';
import { Hearing } from '../../../shared/models/hearing';
import { ParticipantWaitingRoomComponent } from '../participant-waiting-room.component';
import { UserMediaService } from 'src/app/services/user-media.service';
import { UserMediaStreamService } from 'src/app/services/user-media-stream.service';
import { HearingRole } from '../../models/hearing-role-model';
import { NotificationSoundsService } from '../../services/notification-sounds.service';

describe('ParticipantWaitingRoomComponent message and clock', () => {
    let component: ParticipantWaitingRoomComponent;
    const gloalConference = new ConferenceTestData().getConferenceDetailPast();
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
    const logger: Logger = new MockLogger();
    let userMediaService: jasmine.SpyObj<UserMediaService>;
    let userMediaStreamService: jasmine.SpyObj<UserMediaStreamService>;
    let notificationSoundsService: jasmine.SpyObj<NotificationSoundsService>;

    beforeAll(() => {
        videoWebService = jasmine.createSpyObj<VideoWebService>('VideoWebService', [
            'getConferenceById',
            'getObfuscatedName',
            'getJwToken'
        ]);
        adalService = jasmine.createSpyObj<AdalService>('AdalService', ['init', 'handleWindowCallback', 'userInfo', 'logOut']);
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
        notificationSoundsService = jasmine.createSpyObj<NotificationSoundsService>('NotificationSoundsService', ['playHearingAlertSound']);
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
    });

    it('should return delayed class when conference is suspended', () => {
        const conference = new ConferenceTestData().getConferenceDetailNow();
        component.hearing = new Hearing(conference);
        component.hearing.getConference().status = ConferenceStatus.Suspended;
        component.participant = conference.participants[0];
        expect(component.getCurrentTimeClass()).toBe('hearing-delayed');
    });

    it('should return delayed class when conference is delayed', () => {
        const conference = new ConferenceTestData().getConferenceDetailPast();
        conference.status = ConferenceStatus.NotStarted;
        component.hearing = new Hearing(conference);
        component.participant = conference.participants[0];
        expect(component.getCurrentTimeClass()).toBe('hearing-delayed');
    });

    it('should return hearing-near-start class when conference is due to begin', () => {
        const conference = new ConferenceTestData().getConferenceDetailNow();
        component.hearing = new Hearing(conference);
        component.participant = conference.participants[0];
        expect(component.getCurrentTimeClass()).toBe('hearing-near-start');
    });

    it('should return hearing-on-time class when conference has not started and on time', () => {
        const conference = new ConferenceTestData().getConferenceDetailFuture();
        component.hearing = new Hearing(conference);
        component.participant = conference.participants[0];
        expect(component.getCurrentTimeClass()).toBe('hearing-on-time');
    });

    it('should return hearing-on-time class when conference has paused', () => {
        const conference = new ConferenceTestData().getConferenceDetailPast();
        conference.status = ConferenceStatus.Paused;
        component.hearing = new Hearing(conference);
        component.participant = conference.participants[0];
        expect(component.getCurrentTimeClass()).toBe('hearing-on-time');
    });

    it('should return hearing-on-time class when conference has closed', () => {
        const conference = new ConferenceTestData().getConferenceDetailPast();
        conference.status = ConferenceStatus.Closed;
        component.hearing = new Hearing(conference);
        component.participant = conference.participants[0];
        expect(component.getCurrentTimeClass()).toBe('hearing-on-time');
    });

    it('should return hearing-near-start class when conference is in session and user is a witness', () => {
        const conference = new ConferenceTestData().getConferenceDetailPast();
        conference.status = ConferenceStatus.InSession;
        component.hearing = new Hearing(conference);
        component.participant = conference.participants[0];
        component.participant.hearing_role = HearingRole.WITNESS;

        expect(component.getCurrentTimeClass()).toBe('hearing-near-start');
    });
    it('should return hearing-on-time as default for a witness', () => {
        const conference = new ConferenceTestData().getConferenceDetailPast();
        conference.status = ConferenceStatus.NotStarted;
        component.hearing = new Hearing(conference);
        component.participant = conference.participants[0];
        component.participant.hearing_role = HearingRole.WITNESS;

        expect(component.getCurrentTimeClass()).toBe('hearing-on-time');
    });
});
