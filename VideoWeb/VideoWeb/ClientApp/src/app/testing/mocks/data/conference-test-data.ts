import {
    ConferenceForUserResponse, ConferenceResponse, ConferenceStatus,
    ParticipantResponse, ParticipantStatus, UserRole, ParticipantForUserResponse, TaskResponse, TaskType
} from 'src/app/services/clients/api-client';

export class ConferenceTestData {

    getConferenceNow(): ConferenceForUserResponse {
        const currentDateTime = new Date(new Date().getUTCDate());
        const conference = new ConferenceForUserResponse({
            id: '363725D0-E3D6-4D4A-8D0A-E8E57575FBC4',
            case_name: 'C V I',
            case_number: '123ABC',
            case_type: 'Financial Tax Remedy',
            scheduled_date_time: currentDateTime,
            no_of_participants_available: 2,
            no_of_participants_unavailable: 1,
            no_of_participants_in_consultation: 2,
            scheduled_duration: 50,
            status: ConferenceStatus.NotStarted,
            participants: this.getListOfParticipants()
        });

        return conference;
    }

    getConferencePast(): ConferenceForUserResponse {
        const pastDate = new Date(new Date().getTime());
        pastDate.setUTCHours(pastDate.getUTCHours() - 26);
        const conference = new ConferenceForUserResponse({
            id: '58CB20C7-377D-4581-8069-3776F583684B',
            case_name: 'BW V BP',
            case_number: 'ABC1234',
            case_type: 'Financial Tax Remedy',
            scheduled_date_time: pastDate,
            no_of_participants_available: 2,
            no_of_participants_unavailable: 1,
            no_of_participants_in_consultation: 2,
            scheduled_duration: 50,
            status: ConferenceStatus.NotStarted,
            participants: this.getListOfParticipants()
        });
        return conference;
    }

    getConferenceFuture(): ConferenceForUserResponse {
        const futureDate = new Date(new Date().getTime());
        futureDate.setUTCHours(futureDate.getUTCHours() + 26);
        const conference = new ConferenceForUserResponse({
            id: '612AB52C-BDA5-4F4D-95B8-3F49065219A6',
            case_name: 'WM V T',
            case_number: '0987UDIHH',
            case_type: 'Financial Tax Remedy',
            scheduled_date_time: futureDate,
            no_of_participants_available: 2,
            no_of_participants_unavailable: 1,
            no_of_participants_in_consultation: 2,
            scheduled_duration: 50,
            status: ConferenceStatus.NotStarted,
            participants: this.getListOfParticipants()
        });
        return conference;
    }

    getTestData(): Array<ConferenceForUserResponse> {
        const testData: Array<ConferenceForUserResponse> = [];
        const conference1 = this.getConferenceNow();
        const conference2 = this.getConferencePast();
        const conference3 = this.getConferenceFuture();
        testData.push(conference1);
        testData.push(conference2);
        testData.push(conference3);
        return testData;
    }

    getConferenceDetail(): ConferenceResponse {
        const participants = this.getListOfParticipantDetails();
        const futureDate = new Date(new Date().getTime());
        futureDate.setUTCHours(futureDate.getUTCHours() + 26);
        const conference = new ConferenceResponse({
            id: '612AB52C-BDA5-4F4D-95B8-3F49065219A6',
            case_name: 'WM V T',
            case_number: '0987UDIHH',
            case_type: 'Financial Tax Remedy',
            scheduled_date_time: futureDate,
            scheduled_duration: 45,
            status: ConferenceStatus.NotStarted,
            participants: participants,
            admin_i_frame_uri: 'adminiframe@kinly..com',
            judge_i_frame_uri: 'judgeiframe@kinly..com',
            participant_uri: 'participant@kinly..com',
            pexip_node_uri: 'node@kinly..com'
        });

        return conference;
    }

    getListOfParticipants(): ParticipantForUserResponse[] {
        const participants: ParticipantForUserResponse[] = [];

        const participant1 = new ParticipantForUserResponse({
            status: ParticipantStatus.Available,
            display_name: 'Greeno',
            username: 'chris.green@hearings.net',
        });

        const participant2 = new ParticipantForUserResponse({
            status: ParticipantStatus.NotSignedIn,
            display_name: 'James Green',
            username: 'james.green@hearings.net'
        });

        const participant3 = new ParticipantForUserResponse({
            status: ParticipantStatus.Available,
            display_name: 'Judge Fudge',
            username: 'judge.fudge@hearings.net'
        });

        participants.push(participant1);
        participants.push(participant2);
        participants.push(participant3);
        return participants;
    }

    getListOfParticipantDetails(): ParticipantResponse[] {
        const participants: ParticipantResponse[] = [];
        const participant1 = new ParticipantResponse({
            id: '9F681318-4955-49AF-A887-DED64554429D',
            name: 'Mr Chris Green',
            status: ParticipantStatus.Available,
            role: UserRole.Individual,
            display_name: 'Greeno',
            username: 'chris.green@hearings.net',
            tiled_display_name: 'T1;Greeno;9F681318-4955-49AF-A887-DED64554429D'
        });

        const participant2 = new ParticipantResponse({
            id: '9F681318-4955-49AF-A887-DED64554429J',
            name: 'Mr James Green',
            status: ParticipantStatus.NotSignedIn,
            role: UserRole.Individual,
            display_name: 'James Green',
            username: 'james.green@hearings.net',
            tiled_display_name: 'T2;James Green;9F681318-4955-49AF-A887-DED64554429J'
        });

        const participant3 = new ParticipantResponse({
            id: '9F681318-4955-49AF-A887-DED64554429T',
            name: 'Judge Fudge',
            status: ParticipantStatus.Available,
            role: UserRole.Judge,
            display_name: 'Judge Fudge',
            username: 'judge.fudge@hearings.net',
            tiled_display_name: 'T0;Judge Fudge;9F681318-4955-49AF-A887-DED64554429T'
        });

        participants.push(participant1);
        participants.push(participant2);
        participants.push(participant3);
        return participants;
    }

    getTasksForConference(): TaskResponse[] {
        const task = new TaskResponse({
            body: 'body',
            type: TaskType.Participant,
            created: new Date()
        });
        const participants: ParticipantResponse[] = [];
        const tasks: TaskResponse[] = [];
        tasks.push(task);
        return tasks;
    }
}
