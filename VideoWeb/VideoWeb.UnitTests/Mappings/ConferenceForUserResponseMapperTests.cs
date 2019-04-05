using System.Collections.Generic;
using FizzWare.NBuilder;
using FluentAssertions;
using NUnit.Framework;
using System.Linq;
using Testing.Common.Builders;
using VideoWeb.Contract.Responses;
using VideoWeb.Mappings;
using VideoWeb.Services.Video;
using ConferenceUserRole = VideoWeb.Services.Video.UserRole;

namespace VideoWeb.UnitTests.Mappings
{
    public class ConferenceForUserResponseMapperTests
    {
        private readonly ConferenceForUserResponseMapper _mapper = new ConferenceForUserResponseMapper();

        [Test]
        public void should_map_all_properties()
        {
            var conference = Builder<ConferenceSummaryResponse>.CreateNew().Build();

            var participants = new List<ParticipantSummaryResponse>
            {
                new ParticipantSummaryResponseBuilder(ConferenceUserRole.Individual)
                    .WithStatus(ParticipantState.Available).Build(),
                new ParticipantSummaryResponseBuilder(ConferenceUserRole.Representative)
                    .WithStatus(ParticipantState.Disconnected).Build(),
                new ParticipantSummaryResponseBuilder(ConferenceUserRole.Individual)
                    .WithStatus(ParticipantState.InConsultation).Build(),
                new ParticipantSummaryResponseBuilder(ConferenceUserRole.Representative)
                    .WithStatus(ParticipantState.InConsultation).Build(),
                new ParticipantSummaryResponseBuilder(ConferenceUserRole.Judge)
                    .WithStatus(ParticipantState.NotSignedIn).Build(),
                new ParticipantSummaryResponseBuilder(ConferenceUserRole.VideoHearingsOfficer)
                    .WithStatus(ParticipantState.None).Build(),
            };

            conference.Participants = participants;

            var response = _mapper.MapConferenceSummaryToResponseModel(conference);

            response.Id.Should().Be(conference.Id.GetValueOrDefault());
            response.CaseName.Should().Be(conference.Case_name);
            response.CaseNumber.Should().Be(conference.Case_number);
            response.CaseType.Should().Be(conference.Case_type);
            response.ScheduledDateTime.Should().Be(conference.Scheduled_date_time.GetValueOrDefault());
            response.ScheduledDuration.Should().Be(conference.Scheduled_duration.GetValueOrDefault());
            response.Status.ToString().Should().Be(conference.Status.GetValueOrDefault().ToString());
            response.NoOfParticipantsAvailable.Should().Be(1);
            response.NoOfParticipantsInConsultation.Should().Be(2);
            response.NoOfParticipantsUnavailable.Should().Be(1);
        }

        [Test]
        public void should_map_all_participants()
        {
            var participants = Builder<ParticipantSummaryResponse>.CreateListOfSize(2).Build().ToList();

            var response = _mapper.MapParticipants(participants);

            for (var index = 0; index < participants.Count; index++)
            {
                var participant = participants[index];
                response[index].Username.Should().BeEquivalentTo(participant.Username);
                response[index].Status.ToString().Should().BeEquivalentTo(participant.Status.ToString());
            }
        }

        [Test]
        public void should_map_all_participant_statuses()
        {
            var participantStatuses = Builder<ParticipantState>.CreateListOfSize(8).Build().ToList();

            foreach (var participantStatus in participantStatuses)
            {
                var response = _mapper.MapParticipantStatus(participantStatus);
                response.Should().BeOfType(typeof(ParticipantStatus));
            }
        }
    }
}