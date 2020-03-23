import { async, TestBed } from '@angular/core/testing';
import { ActivatedRoute, ActivatedRouteSnapshot, convertToParamMap, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { VideoWebService } from '../services/api/video-web.service';
import { ConferenceResponse, ConferenceStatus } from '../services/clients/api-client';
import { Logger } from '../services/logging/logger-base';
import { SharedModule } from '../shared/shared.module';
import { MockLogger } from '../testing/mocks/MockLogger';
import { ConferenceGuard } from './conference.guard';

describe('ConferenceGuard', () => {
    let videoWebServiceSpy: jasmine.SpyObj<VideoWebService>;
    let guard: ConferenceGuard;
    const router = {
        navigate: jasmine.createSpy('navigate')
    };
    let activateRoute: any = { paramMap: convertToParamMap({ conferenceId: 'cef3051f-6909-40b9-a846-100cf4040a9a' }) };

    beforeEach(() => {
        videoWebServiceSpy = jasmine.createSpyObj<VideoWebService>('VideoWebService', ['getConferenceById']);

        TestBed.configureTestingModule({
            imports: [RouterTestingModule, SharedModule],
            providers: [
                ConferenceGuard,
                { provide: Router, useValue: router },
                { provide: VideoWebService, useValue: videoWebServiceSpy },
                { provide: Logger, useClass: MockLogger },
                { provide: ActivatedRoute, useValue: activateRoute },
                { provide: ActivatedRouteSnapshot, useValue: activateRoute }
            ]
        });
        guard = TestBed.get(ConferenceGuard);
    });

    it('should be able to activate component', async(async () => {
        const response = new ConferenceResponse({ status: ConferenceStatus.NotStarted });
        videoWebServiceSpy.getConferenceById.and.returnValue(response);
        const result = await guard.canActivate(activateRoute);

        expect(result).toBeTruthy();
    }));

    it('should not be able to activate component when conference closed', async () => {
        const response = new ConferenceResponse({ status: ConferenceStatus.Closed });
        videoWebServiceSpy.getConferenceById.and.returnValue(response);
        const result = await guard.canActivate(activateRoute);

        expect(result).toBeFalsy();
        expect(router.navigate).toHaveBeenCalledWith(['home']);
    });

    it('should not be able to activate component if conferenceId null', async(async () => {
        activateRoute = { paramMap: convertToParamMap({ conferenceId: null }) };
        videoWebServiceSpy.getConferenceById.and.returnValue(undefined);
        const result = await guard.canActivate(activateRoute);

        expect(result).toBeFalsy();
        expect(router.navigate).toHaveBeenCalledWith(['home']);
    }));

    it('should not be able to activate component when exception', async(async () => {
        videoWebServiceSpy.getConferenceById.and.returnValue(Promise.reject({ status: 500, isApiException: true }));
        const result = await guard.canActivate(activateRoute);

        expect(result).toBeFalsy();
        expect(router.navigate).toHaveBeenCalledWith(['home']);
    }));
});
