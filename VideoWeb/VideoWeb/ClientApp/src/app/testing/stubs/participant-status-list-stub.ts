import { Component, Input } from '@angular/core';
import { ConferenceResponse } from 'src/app/services/clients/api-client';

@Component({ selector: 'app-participant-status-list', template: '' })
export class ParticipantStatusListStubComponent {
    @Input() conference: ConferenceResponse[];
}
