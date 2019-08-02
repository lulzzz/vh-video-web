import { Component, Input, NgZone, OnInit } from '@angular/core';
import { AdalService } from 'adal-angular4';
import { ConsultationService } from 'src/app/services/api/consultation.service';
import {
  ConferenceResponse, ConsultationAnswer, ParticipantResponse, ParticipantStatus, UserRole
} from 'src/app/services/clients/api-client';
import { EventsService } from 'src/app/services/events.service';
import { Logger } from 'src/app/services/logging/logger-base';
import { ModalService } from 'src/app/services/modal.service';
import { ConsultationMessage } from 'src/app/services/models/consultation-message';
import { Participant } from 'src/app/shared/models/participant';
import { Hearing } from 'src/app/shared/models/hearing';

@Component({
  selector: 'app-individual-participant-status-list',
  templateUrl: './individual-participant-status-list.component.html',
  styleUrls: ['./individual-participant-status-list.component.scss']
})
export class IndividualParticipantStatusListComponent implements OnInit {

  @Input() conference: ConferenceResponse;

  nonJugdeParticipants: ParticipantResponse[];
  judge: ParticipantResponse;

  consultationRequestee: Participant;
  consultationRequester: Participant;

  incomingCallSound: HTMLAudioElement;
  incomingCallTimeout: NodeJS.Timer;
  outgoingCallTimeout: NodeJS.Timer;
  waitingForConsultationResponse: boolean;

  private readonly REQUEST_PC_MODAL = 'raise-pc-modal';
  private readonly RECIEVE_PC_MODAL = 'receive-pc-modal';
  private readonly ACCEPTED_PC_MODAL = 'accepted-pc-modal';
  private readonly REJECTED_PC_MODAL = 'rejected-pc-modal';

  constructor(
    private adalService: AdalService,
    private consultationService: ConsultationService,
    private eventService: EventsService,
    private ngZone: NgZone,
    private modalService: ModalService,
    private logger: Logger
  ) { }

  ngOnInit() {
    this.waitingForConsultationResponse = false;
    this.initConsultationRequestAlert();
    this.filterNonJudgeParticipants();
    this.filterJudge();
    this.setupSubscribers();
  }

  initConsultationRequestAlert(): void {
    this.incomingCallSound = new Audio();
    this.incomingCallSound.src = '/assets/audio/consultation_request.mp3';
    this.incomingCallSound.load();
    this.incomingCallSound.addEventListener('ended', function () {
      this.play();
    }, false);
  }

  playIncomingCallSound() {
    const self = this;
    this.incomingCallSound.play()
      .then(() => {
        self.incomingCallTimeout = setTimeout(async () => {
          await self.cancelIncomingCall();
        }, 120000);
      })
      .catch(function (reason) {
        self.logger.error('Failed to announce hearing starting', reason);
      });
  }

  async cancelIncomingCall() {
    this.logger.info('Consultation request timed-out. Rejecting call');
    this.closeAllPCModals();
    this.stopCallRinging();
    await this.answerConsultationRequest(ConsultationAnswer.Rejected);
  }

  stopCallRinging() {
    this.incomingCallSound.pause();
    this.incomingCallSound.currentTime = 0;
  }

  cancelOutgoingCall() {
    this.logger.info('Consultation request timed-out. Cancelling call');
    this.closeAllPCModals();
  }

  private setupSubscribers() {
    this.eventService.start();

    this.eventService.getConsultationMessage().subscribe(message => {
      this.ngZone.run(() => {
        if (message.result === ConsultationAnswer.Accepted) {
          this.handleAcceptedConsultationRequest(message);
        } else if (message.result === ConsultationAnswer.Rejected) {
          this.handleRejectedConsultationRequest(message);
        } else {
          this.displayConsultationRequestPopup(message);
        }
      });
    });
  }

  isParticipantAvailable(participant: ParticipantResponse): boolean {
    return participant.status === ParticipantStatus.Available;
  }

  getParticipantStatusText(participant: ParticipantResponse): string {
    return participant.status === ParticipantStatus.Available ? 'Available' : 'Unavailable';
  }

  canCallParticipant(participant: ParticipantResponse): boolean {
    const hearing = new Hearing(this.conference);
    if (hearing.isReadyToStart() || hearing.isDelayed() || hearing.isSuspended()) {
      return false;
    }

    if (participant.username.toLocaleLowerCase().trim() === this.adalService.userInfo.userName.toLocaleLowerCase().trim()) {
      return false;
    }
    return this.isParticipantAvailable(participant);
  }

  begingCallWith(participant: ParticipantResponse): void {
    if (this.canCallParticipant(participant)) {
      this.displayModal(this.REQUEST_PC_MODAL);
      const requestee = this.conference.participants.find(x => x.id === participant.id);
      const requester = this.conference.participants.find
        (x => x.username.toLowerCase() === this.adalService.userInfo.userName.toLocaleLowerCase());

      this.consultationRequestee = new Participant(requestee);
      this.logger.event(`${requester.username} requesting private consultation with ${requestee.username}`);
      this.consultationService.raiseConsultationRequest(this.conference, requester, requestee)
        .subscribe(() => {
          this.logger.info('Raised consultation request event');
          this.waitingForConsultationResponse = true;
          this.outgoingCallTimeout = setTimeout(() => {
            this.cancelOutgoingCall();
          }, 120000);
        },
          error => {
            this.logger.error('Failed to raise consultation request', error);
          }
        );
    }
  }

  cancelConsultationRequest() {
    this.closeAllPCModals();
  }

  private displayConsultationRequestPopup(message: ConsultationMessage) {
    const requester = this.conference.participants.find(x => x.username === message.requestedBy);
    const requestee = this.conference.participants.find(x => x.username === message.requestedFor);
    this.logger.info(`Incoming request for private consultation from ${requester.display_name}`);
    this.consultationRequester = new Participant(requester);
    this.consultationRequestee = new Participant(requestee);
    this.displayModal(this.RECIEVE_PC_MODAL);
    this.playIncomingCallSound();
  }

  async answerConsultationRequest(answer: ConsultationAnswer) {
    this.stopCallRinging();
    this.closeAllPCModals();
    this.logger.event(`${this.consultationRequestee.displayName} responded to consultation: ${answer}`);

    try {
      await this.consultationService.respondToConsultationRequest(
        this.conference, this.consultationRequester.base,
        this.consultationRequestee.base,
        ConsultationAnswer.Accepted).toPromise();
    } catch (error) {
      this.logger.error('Failed to respond to consultation request', error);
    }
  }

  private handleAcceptedConsultationRequest(message: ConsultationMessage) {
    this.initConsultationParticipants(message);
    this.displayModal(this.ACCEPTED_PC_MODAL);
  }

  private handleRejectedConsultationRequest(message: ConsultationMessage) {
    this.initConsultationParticipants(message);
    this.displayModal(this.REJECTED_PC_MODAL);
  }

  displayModal(modalId: string) {
    this.closeAllPCModals();
    this.modalService.open(modalId);
  }

  private closeAllPCModals(): void {
    this.modalService.close(this.REQUEST_PC_MODAL);
    this.modalService.close(this.RECIEVE_PC_MODAL);
    this.modalService.close(this.ACCEPTED_PC_MODAL);
    this.modalService.close(this.REJECTED_PC_MODAL);
  }

  closeConsultationRejection() {
    this.closeAllPCModals();
  }

  private initConsultationParticipants(message: ConsultationMessage): void {
    const requester = this.conference.participants.find(x => x.username === message.requestedBy);
    const requestee = this.conference.participants.find(x => x.username === message.requestedFor);
    this.consultationRequester = new Participant(requester);
    this.consultationRequestee = new Participant(requestee);
  }

  private filterNonJudgeParticipants(): void {
    this.nonJugdeParticipants = this.conference.participants.filter(x => x.role !== UserRole.Judge);
  }

  private filterJudge(): void {
    this.judge = this.conference.participants.find(x => x.role === UserRole.Judge);
  }
}
