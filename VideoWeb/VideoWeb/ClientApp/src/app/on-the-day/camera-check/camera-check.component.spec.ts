import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CameraCheckComponent } from './camera-check.component';
import { RouterTestingModule } from '@angular/router/testing';
import { SharedModule } from 'src/app/shared/shared.module';
import { AbstractControl } from '@angular/forms';
import { Router, ActivatedRoute, convertToParamMap } from '@angular/router';
import { PageUrls } from 'src/app/shared/page-url.constants';
import { ConferenceTestData } from 'src/app/testing/mocks/data/conference-test-data';
import { VideoWebService } from 'src/app/services/video-web.service';
import { MockVideoWebService } from 'src/app/testing/mocks/MockVideoService';

describe('CameraCheckComponent', () => {
  let component: CameraCheckComponent;
  let fixture: ComponentFixture<CameraCheckComponent>;
  let cameraAnswer: AbstractControl;
  let router: Router;
  const conference = new ConferenceTestData().getConferenceDetail();

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule, SharedModule],
      declarations: [CameraCheckComponent],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: convertToParamMap({ conferenceId: conference.id })
            }
          },
        },
        { provide: VideoWebService, useClass: MockVideoWebService }
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CameraCheckComponent);
    component = fixture.componentInstance;
    router = TestBed.get(Router);
    fixture.detectChanges();

    cameraAnswer = component.form.controls['cameraCheck'];
  });

  it('should default no selected values', () => {
    expect(component.form.pristine).toBeTruthy();
  });

  it('should invalidate form when "No" is selected', () => {
    spyOn(router, 'navigate').and.callFake(() => { });
    cameraAnswer.setValue('No');
    component.onSubmit();
    expect(component.form.valid).toBeFalsy();
    expect(router.navigate).toHaveBeenCalledTimes(0);
  });

  it('should validate form when "Yes" is selected', () => {
    spyOn(router, 'navigate').and.callFake(() => { });
    cameraAnswer.setValue('Yes');
    component.onSubmit();
    expect(component.form.valid).toBeTruthy();
    expect(router.navigate).toHaveBeenCalledWith([PageUrls.MicrophoneWorking, conference.id]);
  });

  it('should allow equipment check when answered "No"', () => {
    spyOn(router, 'navigate').and.callFake(() => { });
    cameraAnswer.setValue('No');
    component.form.markAsDirty();
    component.checkEquipmentAgain();
    expect(component.form.invalid).toBeTruthy();
    expect(router.navigate).toHaveBeenCalledWith([PageUrls.EquipmentCheck, conference.id]);
  });

  it('should not allow equipment check when answered "Yes"', () => {
    spyOn(router, 'navigate').and.callFake(() => { });
    cameraAnswer.setValue('Yes');
    component.form.markAsDirty();
    component.checkEquipmentAgain();
    expect(component.form.valid).toBeTruthy();
    expect(router.navigate).toHaveBeenCalledTimes(0);
  });
});