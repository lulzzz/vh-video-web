import { Injectable } from '@angular/core';
import { Participant } from 'src/app/shared/models/participant';
import { NotificationSoundsService } from 'src/app/waiting-space/services/notification-sounds.service';
import {
    ApiClient,
    BadRequestModelResponse,
    ConferenceResponse,
    ConsultationAnswer,
    LeavePrivateConsultationRequest,
    ParticipantResponse,
    PrivateAdminConsultationRequest,
    PrivateConsultationRequest,
    PrivateVideoEndpointConsultationRequest,
    RoomType,
    VideoEndpointResponse
} from '../clients/api-client';
import { Logger } from '../logging/logger-base';
import { ModalService } from '../modal.service';

@Injectable({
    providedIn: 'root'
})
export class ConsultationService {
    static REQUEST_PC_MODAL = 'raise-pc-modal';
    static RECEIVE_PC_MODAL = 'receive-pc-modal';
    static ACCEPTED_PC_MODAL = 'accepted-pc-modal';
    static REJECTED_PC_MODAL = 'rejected-pc-modal';
    static VHO_REQUEST_PC_MODAL = 'vho-raise-pc-modal';
    static NO_ROOM_PC_MODAL = 'no-room-pc-modal';
    static ERROR_PC_MODAL = 'pc-error-modal';

    callRingingTimeout: NodeJS.Timer;
    waitingForConsultationResponse: boolean;
    readonly CALL_TIMEOUT = 120000;

    consultationRequestee: Participant;
    consultationRequester: Participant;

    constructor(
        private apiClient: ApiClient,
        private modalService: ModalService,
        private notificationSoundService: NotificationSoundsService,
        private logger: Logger
    ) {
        this.resetWaitingForResponse();
        this.initCallRingingSound();
    }

    resetWaitingForResponse() {
        this.waitingForConsultationResponse = false;
    }

    /**
     * Raise a private consulation request. Display a requesting PC modal and start call ringing.
     * @param conference conference
     * @param requester participant raising request
     * @param requestee participant user wishes to speak with
     */
    async raiseConsultationRequest(
        conference: ConferenceResponse,
        requester: ParticipantResponse,
        requestee: ParticipantResponse
    ): Promise<void> {
        this.logger.info(`[ConsultationService] - Requesting private consultation`, {
            conference: conference.id,
            requester: requester.id,
            requestee: requestee.id
        });
        await this.handleConsultationRequest(
            new PrivateConsultationRequest({
                conference_id: conference.id,
                requested_by_id: requester.id,
                requested_for_id: requestee.id
            })
        );
        this.displayOutgoingPrivateConsultationRequestModal();
        this.startOutgoingCallRingingTimeout(conference, requester, requestee);
    }

    /**
     * Respond to a private consultation between participants
     * @param conference conference
     * @param requester participant raising request
     * @param requestee participant user wishes to speak with
     * @param answer the response to a consultation request
     */
    async respondToConsultationRequest(
        conference: ConferenceResponse,
        requester: ParticipantResponse,
        requestee: ParticipantResponse,
        answer: ConsultationAnswer
    ): Promise<void> {
        this.waitingForConsultationResponse = false;
        this.logger.info(`[ConsultationService] - Responding to private consultation`, {
            conference: conference.id,
            requester: requester.id,
            requestee: requestee.id,
            answer: answer
        });
        await this.handleConsultationRequest(
            new PrivateConsultationRequest({
                conference_id: conference.id,
                requested_by_id: requester.id,
                requested_for_id: requestee.id,
                answer: answer
            })
        );
    }

    /**
     * Start a private consultation with video endpoint. This will only be allowed for defence advocates linked to the
     * endpoint
     * @param conference conference
     * @param endpoint video endpoint to call
     */
    async startPrivateConsulationWithEndpoint(conference: ConferenceResponse, endpoint: VideoEndpointResponse) {
        this.logger.info(`[ConsultationService] - Starting a private consultation with a video endpoint`, {
            conference: conference.id,
            endpoint: endpoint.id
        });
        try {
            this.stopCallRinging();
            this.clearModals();
            await this.apiClient
                .callVideoEndpoint(
                    new PrivateVideoEndpointConsultationRequest({
                        conference_id: conference.id,
                        endpoint_id: endpoint.id
                    })
                )
                .toPromise();
        } catch (error) {
            if (this.checkNoRoomsLeftError(error)) {
                this.displayNoConsultationRoomAvailableModal();
            } else {
                this.displayConsultationErrorModal();
                throw error;
            }
        }
    }

    /**
     * Raise or respond to a consultation request. Clears any ringing or modals first.
     * Displays "No Rooms Available" modal when attempting to raise or respond to a private consultation when no room is available.
     * Displays an "Error" modal when there is a problem witht the request, informing the user to try again later.
     * @param request request to process
     */
    private async handleConsultationRequest(request: PrivateConsultationRequest): Promise<void> {
        try {
            this.stopCallRinging();
            this.clearModals();
            await this.apiClient.handleConsultationRequest(request).toPromise();
        } catch (error) {
            if (this.checkNoRoomsLeftError(error)) {
                this.displayNoConsultationRoomAvailableModal();
            } else {
                this.displayConsultationErrorModal();
                throw error;
            }
        }
    }

    private checkNoRoomsLeftError(error: any): boolean {
        if (!(error instanceof BadRequestModelResponse)) {
            return false;
        }
        return error.errors && error.errors.findIndex(x => x.errors.includes('No consultation room available')) >= 0;
    }

    /**
     * Display the appropriate modal to a requester once a requestee has responded
     * @param answer response to a consultation request
     */
    handleConsultationResponse(answer: ConsultationAnswer) {
        this.stopCallRinging();
        switch (answer) {
            case ConsultationAnswer.Accepted:
                this.displayModal(ConsultationService.ACCEPTED_PC_MODAL);
                break;
            case ConsultationAnswer.Rejected:
                this.displayModal(ConsultationService.REJECTED_PC_MODAL);
                break;
            default:
                this.clearModals();
                break;
        }
    }

    /**
     * Leave a private consultation
     * @param conference conference
     * @param participant participant attempting to leave a private consultation
     */
    async leaveConsultation(conference: ConferenceResponse, participant: ParticipantResponse): Promise<void> {
        this.logger.info(`[ConsultationService] - Leaving a private consultation`, {
            conference: conference.id,
            participant: participant.id
        });
        await this.apiClient
            .leavePrivateConsultation(
                new LeavePrivateConsultationRequest({
                    conference_id: conference.id,
                    participant_id: participant.id
                })
            )
            .toPromise();
    }

    /**
     * Responsd to a consultation with a VH Officer
     * @param conference conference
     * @param participant participant admin wishes to speak with
     * @param answer the response to a private consultation with an admin
     * @param room the room they wish to be transferred to
     */
    async respondToAdminConsultationRequest(
        conference: ConferenceResponse,
        participant: ParticipantResponse,
        answer: ConsultationAnswer,
        room: RoomType
    ): Promise<void> {
        this.waitingForConsultationResponse = false;
        this.logger.info(`[ConsultationService] - Responding to private consultation with admin.`, {
            conference: conference.id,
            participant: participant.id,
            answer: answer
        });
        try {
            this.stopCallRinging();
            this.clearModals();
            await this.apiClient
                .respondToAdminConsultationRequest(
                    new PrivateAdminConsultationRequest({
                        conference_id: conference.id,
                        participant_id: participant.id,
                        answer: answer,
                        consultation_room: room
                    })
                )
                .toPromise();
        } catch (error) {
            if (this.checkNoRoomsLeftError(error)) {
                this.displayNoConsultationRoomAvailableModal();
            } else {
                this.displayConsultationErrorModal();
                throw error;
            }
        }
    }

    displayOutgoingPrivateConsultationRequestModal() {
        this.logger.debug('[ConsultationService] - Displaying outgoing consultation request modal.');
        this.displayModal(ConsultationService.REQUEST_PC_MODAL);
    }

    async displayIncomingPrivateConsultation() {
        this.logger.debug('[ConsultationService] - Displaying incoming consultation request modal.');
        this.displayModal(ConsultationService.RECEIVE_PC_MODAL);
        await this.startIncomingCallRingingTimeout();
    }

    async displayAdminConsultationRequest() {
        this.logger.debug('[ConsultationService] - Displaying incoming admin consultation request modal.');
        this.displayModal(ConsultationService.VHO_REQUEST_PC_MODAL);
        await this.startIncomingCallRingingTimeout();
    }

    displayNoConsultationRoomAvailableModal() {
        this.logger.debug('[ConsultationService] - Displaying no consultation rooms available modal.');
        this.displayModal(ConsultationService.NO_ROOM_PC_MODAL);
    }

    displayConsultationErrorModal() {
        this.logger.debug('[ConsultationService] - Displaying consultation error modal.');
        this.displayModal(ConsultationService.ERROR_PC_MODAL);
    }

    displayConsultationRejectedModal() {
        this.logger.debug('[ConsultationService] - Displaying consultation rejected modal.');
        this.displayModal(ConsultationService.REJECTED_PC_MODAL);
    }

    clearModals() {
        this.logger.debug('[ConsultationService] - Closing all modals.');
        this.modalService.closeAll();
    }

    displayModal(modalId: string) {
        this.clearModals();
        this.modalService.open(modalId);
    }

    initCallRingingSound(): void {
        this.notificationSoundService.initConsultationRequestRingtone();
    }

    /**
     * Begin a timer which starting the call ringing but automatically cancels after a period of no response
     * @param conference conference
     * @param requester participant raising request
     * @param requestee participant user wishes to speak with
     */
    async startOutgoingCallRingingTimeout(conference: ConferenceResponse, requester: ParticipantResponse, requestee: ParticipantResponse) {
        this.logger.debug('[ConsultationService] - Start outgoing ringing sound.');
        this.waitingForConsultationResponse = true;
        this.callRingingTimeout = setTimeout(async () => {
            await this.cancelTimedOutConsultationRequest(conference, requester, requestee);
        }, this.CALL_TIMEOUT);
        await this.notificationSoundService.playConsultationRequestRingtone();
    }

    /**
     * Begin a timer which starting the call ringing but automatically cancels after a period of no response
     */
    async startIncomingCallRingingTimeout() {
        this.logger.debug('[ConsultationService] - Start incoming ringing sound.');
        this.callRingingTimeout = setTimeout(() => {
            this.cancelTimedOutIncomingRequest();
        }, this.CALL_TIMEOUT);
        await this.notificationSoundService.playConsultationRequestRingtone();
    }

    cancelTimedOutIncomingRequest() {
        this.stopCallRinging();
        this.clearModals();
    }

    async cancelTimedOutConsultationRequest(
        conference: ConferenceResponse,
        requester: ParticipantResponse,
        requestee: ParticipantResponse
    ) {
        if (!this.waitingForConsultationResponse) {
            return;
        }
        this.waitingForConsultationResponse = false;
        this.logger.info('[ConsultationService] - Consultation request timed-out. Cancelling call');
        await this.respondToConsultationRequest(conference, requester, requestee, ConsultationAnswer.Cancelled);
        this.displayConsultationRejectedModal();
    }

    async cancelConsultationRequest(conference: ConferenceResponse, requester: ParticipantResponse, requestee: ParticipantResponse) {
        this.stopCallRinging();
        await this.respondToConsultationRequest(conference, requester, requestee, ConsultationAnswer.Cancelled);
        this.clearModals();
    }

    stopCallRinging() {
        this.logger.debug('[ConsultationService] - Start ringing sound.');
        this.clearOutgoingCallTimeout();
        this.notificationSoundService.stopConsultationRequestRingtone();
    }

    clearOutgoingCallTimeout() {
        if (this.callRingingTimeout) {
            clearTimeout(this.callRingingTimeout);
            this.callRingingTimeout = null;
        }
    }
}
