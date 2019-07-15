import { TestBed, async, inject } from '@angular/core/testing';

import { AdminGuard } from './admin.guard';
import { SharedModule } from '../shared/shared.module';
import { RouterTestingModule } from '@angular/router/testing';
import { ProfileService } from '../services/api/profile.service';
import { of, throwError } from 'rxjs';
import { UserProfileResponse, UserRole } from '../services/clients/api-client';
import { Router } from '@angular/router';
import { Logger } from '../services/logging/logger-base';
import { MockLogger } from '../testing/mocks/MockLogger';

describe('AdminGuard', () => {
  let profileServiceSpy: jasmine.SpyObj<ProfileService>;
  let guard: AdminGuard;
  const router = {
    navigate: jasmine.createSpy('navigate')
  };

  beforeEach(() => {
    profileServiceSpy = jasmine.createSpyObj<ProfileService>('ProfileService', ['getUserProfile']);
    TestBed.configureTestingModule({
      imports: [RouterTestingModule, SharedModule],
      providers: [
        AdminGuard,
        { provide: Router, useValue: router },
        { provide: ProfileService, useValue: profileServiceSpy },
        { provide: Logger, useClass: MockLogger }
      ]
    });
    guard = TestBed.get(AdminGuard);
  });

  it('should not be able to activate component if role is not VHOfficer', async(async () => {
    const profile = new UserProfileResponse({ role: UserRole.Judge });
    profileServiceSpy.getUserProfile.and.returnValue(profile);
    const result = await guard.canActivate(null, null);
    expect(result).toBeFalsy();
    expect(router.navigate).toHaveBeenCalledWith(['/home']);
  }));

  it('should be able to activate component if role is VHOfficer', async(async () => {
    const profile = new UserProfileResponse({ role: UserRole.VideoHearingsOfficer });
    profileServiceSpy.getUserProfile.and.returnValue(profile);
    const result = await guard.canActivate(null, null);
    expect(result).toBeTruthy();
  }));

  it('should logout when user profile cannot be retrieved', async(async () => {
    profileServiceSpy.getUserProfile.and.returnValue(Promise.reject({ status: 404, isApiException: true }));
    const result = await guard.canActivate(null, null);
    expect(result).toBeFalsy();
    expect(router.navigate).toHaveBeenCalledWith(['/logout']);
  }));
});
