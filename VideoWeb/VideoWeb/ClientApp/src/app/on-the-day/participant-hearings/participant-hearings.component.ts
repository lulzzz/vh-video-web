import { Component, OnInit } from '@angular/core';
import { ConferenceForUserResponse } from 'src/app/services/clients/api-client';
import { VideoWebService } from 'src/app/services/video-web.service';

@Component({
  selector: 'app-participant-hearings',
  templateUrl: './participant-hearings.component.html',
  styleUrls: ['./participant-hearings.component.css']
})
export class ParticipantHearingsComponent implements OnInit {
  conferences: ConferenceForUserResponse[];
  loadingData: boolean;
  interval: any;

  constructor(private videoWebService: VideoWebService) {
    this.loadingData = true;
  }

  ngOnInit() {
    this.retrieveHearingsForUser();
    this.interval = setInterval(() => {
      this.retrieveHearingsForUser();
    }, 30000);
  }

  retrieveHearingsForUser() {
    this.videoWebService.getConferencesForUser().subscribe((data: ConferenceForUserResponse[]) => {
      this.loadingData = false;
      this.conferences = data;
    },
    () => {
      this.loadingData = false;
    });
  }

  hasHearings() {
    return this.conferences !== undefined && this.conferences.length > 0;
  }
}