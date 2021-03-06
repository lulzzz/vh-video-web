using System;
using System.Collections.Generic;
using System.Linq;
using FizzWare.NBuilder;
using FluentAssertions;
using NUnit.Framework;
using VideoWeb.Common.Models;
using VideoWeb.Mappings;
using VideoWeb.Services.Video;
using VideoWeb.UnitTests.Builders;
using BookingParticipant = VideoWeb.Services.Bookings.ParticipantResponse;
using UserRole = VideoWeb.Services.Video.UserRole;


namespace VideoWeb.UnitTests.Mappings
{
   public class ConferenceResponseVhoMapperTests
    {
        [Test]
        public void Should_map_all_properties()
        {
            var participants = new List<ParticipantDetailsResponse>
            {
                new ParticipantDetailsResponseBuilder(UserRole.Individual, "Claimant").Build(),
                new ParticipantDetailsResponseBuilder(UserRole.Individual, "Defendant").Build(),
                new ParticipantDetailsResponseBuilder(UserRole.Representative, "Defendant").Build(),
                new ParticipantDetailsResponseBuilder(UserRole.Judge, "None").Build(),
                new ParticipantDetailsResponseBuilder(UserRole.CaseAdmin, "None").Build()
            };

            var bookingParticipants = Builder<BookingParticipant>.CreateListOfSize(participants.Count)
                .Build().ToList();
            participants[0].Ref_id = bookingParticipants[0].Id;
            participants[1].Ref_id = bookingParticipants[1].Id;
            participants[2].Ref_id = bookingParticipants[2].Id;
            participants[3].Ref_id = bookingParticipants[3].Id;
            participants[4].Ref_id = bookingParticipants[4].Id;

            var expectedConferenceStatus = ConferenceStatus.Suspended;

            var meetingRoom = Builder<MeetingRoomResponse>.CreateNew().Build();

            var conference = Builder<ConferenceDetailsResponse>.CreateNew()
                .With(x => x.Current_status = ConferenceState.Suspended)
                .With(x => x.Participants = participants)
                .With(x => x.Meeting_room = meetingRoom)
                .Build();

            var response = ConferenceResponseVhoMapper.MapConferenceDetailsToResponseModel(conference);

            response.Id.Should().Be(conference.Id);
            response.CaseName.Should().Be(conference.Case_name);
            response.CaseType.Should().Be(conference.Case_type);
            response.CaseNumber.Should().Be(conference.Case_number);
            response.ScheduledDateTime.Should().Be(conference.Scheduled_date_time);
            response.ScheduledDuration.Should().Be(conference.Scheduled_duration);
            response.Status.Should().Be(expectedConferenceStatus);

            var participantsResponse = response.Participants;
            participantsResponse.Should().NotBeNullOrEmpty();
            foreach (var participantResponse in participantsResponse)
            {
                if (participantResponse.Role == Role.Representative)
                {
                    participantResponse.TiledDisplayName.StartsWith("T4").Should().BeTrue();

                }
                if (participantResponse.Role == Role.Judge)
                {
                    participantResponse.TiledDisplayName.StartsWith("T0").Should().BeTrue();
                }
                if (participantResponse.Role == Role.Individual)
                {
                    (participantResponse.TiledDisplayName.StartsWith("T1") ||
                        participantResponse.TiledDisplayName.StartsWith("T2")).Should().BeTrue();
                }
                if (participantResponse.Role == Role.CaseAdmin)
                {
                    participantResponse.TiledDisplayName.Should().BeNull();
                }
            }

            var caseTypeGroups = participantsResponse.Select(p => p.CaseTypeGroup).Distinct().ToList();
            caseTypeGroups.Count.Should().BeGreaterThan(2);
            caseTypeGroups[0].Should().Be("Claimant");
            caseTypeGroups[1].Should().Be("Defendant");
            caseTypeGroups[2].Should().Be("None");

            response.AdminIFrameUri.Should().Be(meetingRoom.Admin_uri);
            response.ParticipantUri.Should().Be(meetingRoom.Participant_uri);
            response.PexipNodeUri.Should().Be(meetingRoom.Pexip_node);
        }

        [Test]
        public void Should_map_all_properties_with_empty_participants_list()
        {
            var participants = new List<ParticipantDetailsResponse>();

            var expectedConferenceStatus = ConferenceStatus.Suspended;

            var meetingRoom = Builder<MeetingRoomResponse>.CreateNew().Build();

            var conference = Builder<ConferenceDetailsResponse>.CreateNew()
                .With(x => x.Current_status = ConferenceState.Suspended)
                .With(x => x.Participants = participants)
                .With(x => x.Meeting_room = meetingRoom)
                .Build();

            var response = ConferenceResponseVhoMapper.MapConferenceDetailsToResponseModel(conference);

            response.Id.Should().Be(conference.Id);
            response.CaseName.Should().Be(conference.Case_name);
            response.CaseType.Should().Be(conference.Case_type);
            response.CaseNumber.Should().Be(conference.Case_number);
            response.ScheduledDateTime.Should().Be(conference.Scheduled_date_time);
            response.ScheduledDuration.Should().Be(conference.Scheduled_duration);
            response.Status.Should().Be(expectedConferenceStatus);

            response.AdminIFrameUri.Should().Be(meetingRoom.Admin_uri);
            response.ParticipantUri.Should().Be(meetingRoom.Participant_uri);
            response.PexipNodeUri.Should().Be(meetingRoom.Pexip_node);
        }

        [Test]
        public void Should_map_all_properties_with_participants_list_null()
        {
            var expectedConferenceStatus = ConferenceStatus.Suspended;

            var meetingRoom = Builder<MeetingRoomResponse>.CreateNew().Build();

            var conference = Builder<ConferenceDetailsResponse>.CreateNew()
                .With(x => x.Current_status = ConferenceState.Suspended)
                .With(x => x.Participants = null)
                .With(x => x.Meeting_room = meetingRoom)
                .Build();

            var response = ConferenceResponseVhoMapper.MapConferenceDetailsToResponseModel(conference);

            response.Id.Should().Be(conference.Id);
            response.CaseName.Should().Be(conference.Case_name);
            response.CaseType.Should().Be(conference.Case_type);
            response.CaseNumber.Should().Be(conference.Case_number);
            response.ScheduledDateTime.Should().Be(conference.Scheduled_date_time);
            response.ScheduledDuration.Should().Be(conference.Scheduled_duration);
            response.Status.Should().Be(expectedConferenceStatus);

            response.AdminIFrameUri.Should().Be(meetingRoom.Admin_uri);
            response.ParticipantUri.Should().Be(meetingRoom.Participant_uri);
            response.PexipNodeUri.Should().Be(meetingRoom.Pexip_node);
        }

        [Test]
        public void Should_map_if_have_not_booking_participants_with_the_same_id()
        {
            var participants = new List<ParticipantDetailsResponse>
            {
                new ParticipantDetailsResponseBuilder(UserRole.Individual, "Claimant").Build(),
                new ParticipantDetailsResponseBuilder(UserRole.Individual, "Defendant").Build(),
                new ParticipantDetailsResponseBuilder(UserRole.Representative, "Defendant").Build(),
                new ParticipantDetailsResponseBuilder(UserRole.Judge, "None").Build(),
                new ParticipantDetailsResponseBuilder(UserRole.CaseAdmin, "None").Build()
            };

            participants[0].Ref_id = Guid.NewGuid();
            participants[1].Ref_id = Guid.NewGuid();
            participants[2].Ref_id = Guid.NewGuid();
            participants[3].Ref_id = Guid.NewGuid();
            participants[4].Ref_id = Guid.NewGuid();


            var meetingRoom = Builder<MeetingRoomResponse>.CreateNew().Build();

            var conference = Builder<ConferenceDetailsResponse>.CreateNew()
                .With(x => x.Current_status = ConferenceState.Suspended)
                .With(x => x.Participants = participants)
                .With(x => x.Meeting_room = meetingRoom)
                .Build();

            var response = ConferenceResponseVhoMapper.MapConferenceDetailsToResponseModel(conference);

            response.Id.Should().Be(conference.Id);
            response.CaseName.Should().Be(conference.Case_name);
            response.CaseType.Should().Be(conference.Case_type);
            response.CaseNumber.Should().Be(conference.Case_number);
            response.ScheduledDateTime.Should().Be(conference.Scheduled_date_time);
            response.ScheduledDuration.Should().Be(conference.Scheduled_duration);

            response.AdminIFrameUri.Should().Be(meetingRoom.Admin_uri);
            response.ParticipantUri.Should().Be(meetingRoom.Participant_uri);
            response.PexipNodeUri.Should().Be(meetingRoom.Pexip_node);
        }
    }
}
