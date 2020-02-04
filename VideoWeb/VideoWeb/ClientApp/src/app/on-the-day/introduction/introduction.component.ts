import { Component, OnInit } from '@angular/core';
import { PageUrls } from 'src/app/shared/page-url.constants';
import { Router, ActivatedRoute } from '@angular/router';
import { VideoWebService } from 'src/app/services/api/video-web.service';
import {
  UpdateParticipantStatusEventRequest, ConferenceResponse, EventType
} from 'src/app/services/clients/api-client';
import { AdalService } from 'adal-angular4';
import { ErrorService } from 'src/app/services/error.service';

@Component({
  selector: 'app-introduction',
  templateUrl: './introduction.component.html',
  styleUrls: ['./introduction.component.scss']
})
export class IntroductionComponent implements OnInit {

  conferenceId: string;
  conference: ConferenceResponse;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private videoWebService: VideoWebService,
    private adalService: AdalService,
    private errorService: ErrorService
  ) { }

  ngOnInit() {
    this.getConference();
  }

  getConference() {
    this.conferenceId = this.route.snapshot.paramMap.get('conferenceId');
    this.videoWebService.getConferenceById(this.conferenceId)
      .subscribe((conference) => {
        this.conference = conference;
        this.postParticipantJoiningStatus();
      },
      (error) => {
        if (!this.errorService.returnHomeIfUnauthorised(error)) {
          this.errorService.handleApiError(error);
        }
      });
  }

  goToEquipmentCheck() {
    this.router.navigate([PageUrls.EquipmentCheck, this.conferenceId]);
  }

  postParticipantJoiningStatus() {
    const participant = this.conference.participants.
      find(x => x.username.toLocaleLowerCase() === this.adalService.userInfo.userName.toLocaleLowerCase());
    this.videoWebService.raiseParticipantEvent(this.conference.id,
      new UpdateParticipantStatusEventRequest({
        participant_id: participant.id.toString(), event_type: EventType.ParticipantJoining
      })).subscribe(x => { },
        (error) => {
          console.error(error);
        });
  }
}
