import { ConferenceTestData } from 'src/app/testing/mocks/data/conference-test-data';
import { HearingSummary } from './hearing-summary';
import { UserRole } from 'src/app/services/clients/api-client';

describe('HearingSummary', () => {
    it('should throw an error if passing an invlid type', () => {
        const c = new ConferenceTestData().getConferenceDetailFuture();
        expect(() => new HearingSummary(c)).toThrowError();
    });

    it('should map hearing summary info', () => {
        const c = new ConferenceTestData().getConferenceFuture();
        const hearing = new HearingSummary(c);
        expect(hearing.id).toBe(c.id);
        expect(hearing.status).toBe(c.status);
        expect(hearing.caseName).toBe(c.case_name);
        expect(hearing.caseNumber).toBe(c.case_number);
        expect(hearing.scheduledStartTime).toEqual(c.scheduled_date_time);
        expect(hearing.scheduledEndTime).toBeDefined();
        expect(hearing.numberOfUnreadMessages).toBe(c.number_of_unread_messages);
        expect(hearing.hearingVenueName).toBe(c.hearing_venue_name);
    });

    it('should get applicant rep', () => {
        const c = new ConferenceTestData().getConferenceFuture();
        const hearing = new HearingSummary(c);
        const appRep = hearing.applicantRepresentative;
        expect(appRep.role).toBe(UserRole.Representative);
    });

    it('should get applicants', () => {
        const c = new ConferenceTestData().getConferenceFuture();
        const hearing = new HearingSummary(c);
        const apps = hearing.applicants;
        const groups = apps.filter(x => x.caseGroup !== 'applicant').length;
        expect(groups).toBe(0);
    });

    it('should get defendent rep', () => {
        const c = new ConferenceTestData().getConferenceFuture();
        const hearing = new HearingSummary(c);
        const defRep = hearing.defendantRepresentative;
        expect(defRep.role).toBe(UserRole.Representative);
    });

    it('should get respondents', () => {
        const c = new ConferenceTestData().getConferenceFuture();
        const hearing = new HearingSummary(c);
        const respondents = hearing.respondents;
        const groups = respondents.filter(x => x.caseGroup !== 'respondent').length;
        expect(groups).toBe(0);
    });

    it('should return judge', () => {
        const c = new ConferenceTestData().getConferenceFuture();
        const judge = new HearingSummary(c).judge;
        expect(judge).toBeDefined();
        expect(judge.role).toBe(UserRole.Judge);
    });

    it('should return base participants', () => {
        const c = new ConferenceTestData().getConferenceFuture();
        const hearing = new HearingSummary(c);
        const p = hearing.getParticipants();
        expect(c.participants).toEqual(p);
    });

    it('should return duration as text', () => {
        const c = new ConferenceTestData().getConferenceFuture();
        c.scheduled_duration = 30;
        const hearing = new HearingSummary(c);
        expect(hearing.getDurationAsText()).toBe('30 minutes');
    });
});