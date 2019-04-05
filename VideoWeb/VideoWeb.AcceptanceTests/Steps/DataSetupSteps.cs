﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using FluentAssertions;
using TechTalk.SpecFlow;
using Testing.Common.Assertions;
using Testing.Common.Builders;
using Testing.Common.Helpers;
using VideoWeb.AcceptanceTests.Configuration;
using VideoWeb.AcceptanceTests.Contexts;
using VideoWeb.Services.Bookings;
using VideoWeb.Services.Video;
using ParticipantRequest = VideoWeb.Services.Bookings.ParticipantRequest;

namespace VideoWeb.AcceptanceTests.Steps
{
    [Binding]
    public sealed class DataSetupSteps
    {
        private readonly TestContext _context;
        private readonly HearingsEndpoints _bookingEndpoints = new BookingsApiUriFactory().HearingsEndpoints;
        private readonly ConferenceEndpoints _videoEndpoints = new VideoApiUriFactory().ConferenceEndpoints;
        private const int NumberOfIndividuals = 2;
        private const int NumberOfRepresentatives = 2;
        private const int HearingDuration = 60;

        public DataSetupSteps(TestContext context)
        {
            _context = context;
        }

        [Given(@"I have a hearing and a conference")]
        public void GivenIHaveAHearingAndAConference()
        {
            GivenIHaveAHearing();
            GivenIHaveAConference();
        }

        [Given(@"I have a hearing")]
        public void GivenIHaveAHearing()
        {
            var request = new CreateHearingRequest();
            _context.RequestBody = request.WithRandomCaseName().BuildRequest();

            var participants = new List<ParticipantRequest>();

            var judge = _context.GetJudgeUser();
            var individualUsers = _context.GetIndividualUsers();
            var representativeUsers = _context.GetRepresentativeUsers();

            AddIndividualParticipants(individualUsers, participants);

            AddRepresentativeParticipants(representativeUsers, participants);

            AddJudgeParticipant(judge, participants);

            _context.RequestBody.Participants = participants;
            _context.RequestBody.Scheduled_date_time = DateTime.Now;
            _context.RequestBody.Scheduled_duration = HearingDuration;
            _context.Request = _context.Post(_bookingEndpoints.BookNewHearing(), _context.RequestBody);

            WhenISendTheRequestToTheBookingsApiEndpoint();
            ThenTheHearingOrConferenceShouldBeCreated();
            ThenTheHearingDetailsShouldBeRetrieved();
        }

        [Given(@"I have a conference")]
        public void GivenIHaveAConference()
        {
            var participants = new List<VideoWeb.Services.Video.ParticipantRequest>();
            foreach (var p in _context.Hearing.Participants)
            {
                Enum.TryParse(p.User_role_name, out UserRole role);
                var participantsRequest =
                    new VideoWeb.Services.Video.ParticipantRequest
                    {
                        Participant_ref_id = p.Id,
                        Name = p.Title + " " + p.First_name + " " + p.Last_name,
                        Display_name = p.Display_name,
                        Username = p.Username,
                        User_role = (UserRole?)role,
                        Case_type_group = p.Case_role_name
                    };
                participants.Add(participantsRequest);
            }

            var request = new BookNewConferenceRequest
            {
                Hearing_ref_id = _context.Hearing.Id,
                Case_type = _context.Hearing.Case_type_name,
                Scheduled_date_time = _context.Hearing.Scheduled_date_time,
                Scheduled_duration = HearingDuration,
                Case_number = _context.Hearing.Cases.First().Number,
                Case_name = _context.Hearing.Cases.First().Name,
                Participants = participants
            };

            _context.RequestBody = null;
            _context.Request = _context.Post(_videoEndpoints.BookNewConference, request);

            WhenISendTheRequestToTheVideoApiEndpoint();
            ThenTheHearingOrConferenceShouldBeCreated();
            ThenTheConferenceDetailsShouldBeRetrieved();
        }

        [When(@"I send the requests to the bookings api")]
        public void WhenISendTheRequestToTheBookingsApiEndpoint()
        {
            _context.Response = _context.BookingsApiClient().Execute(_context.Request);
            if (_context.Response.Content != null)
                _context.Json = _context.Response.Content;
        }

        [When(@"I send the requests to the video api")]
        public void WhenISendTheRequestToTheVideoApiEndpoint()
        {
            _context.Response = _context.VideoApiClient().Execute(_context.Request);
            if (_context.Response.Content != null)
                _context.Json = _context.Response.Content;
        }

        [Then(@"the hearings should be created")]
        [Then(@"the conference should be created")]
        public void ThenTheHearingOrConferenceShouldBeCreated()
        {
            _context.Response.StatusCode.Should().Be(HttpStatusCode.Created);
            _context.Response.IsSuccessful.Should().Be(true);           
        }

        [Then(@"hearing details should be retrieved")]
        public void ThenTheHearingDetailsShouldBeRetrieved()
        {
            var hearing = ApiRequestHelper.DeserialiseSnakeCaseJsonToResponse<HearingDetailsResponse>(_context.Json);
            hearing.Should().NotBeNull();
            AssertHearingResponse.ForHearing(hearing);
            _context.Hearing = hearing;
            _context.NewHearingId = hearing.Id;
        }

        [Then(@"the conference details should be retrieved")]
        public void ThenTheConferenceDetailsShouldBeRetrieved()
        {
            var conference = ApiRequestHelper.DeserialiseSnakeCaseJsonToResponse<ConferenceDetailsResponse>(_context.Json);
            conference.Should().NotBeNull();
            AssertConferenceDetailsResponse.ForConference(conference);
            _context.Conference = conference;
            _context.NewConferenceId = conference.Id;
        }

        private static void AddJudgeParticipant(UserAccount judge, ICollection<ParticipantRequest> participants)
        {
            participants.Add(new ParticipantRequest()
            {
                Case_role_name = "Judge",
                Contact_email = judge.Email,
                Display_name = judge.Displayname,
                First_name = judge.Firstname,
                Hearing_role_name = "Judge",
                Last_name = judge.Lastname,
                Middle_names = "",
                Representee = "",
                Solicitors_reference = "",
                Telephone_number = "01234567890",
                Title = "Mrs",
                Username = judge.Username
            });
        }

        private static void AddRepresentativeParticipants(List<UserAccount> representativeUsers, List<ParticipantRequest> participants)
        {
            for (var j = 0; j < NumberOfRepresentatives; j++)
            {
                var participant = new ParticipantRequest
                {
                    Case_role_name = representativeUsers[j].CaseRoleName,
                    Contact_email = representativeUsers[j].Email,
                    Display_name = representativeUsers[j].Displayname,
                    First_name = representativeUsers[j].Firstname,
                    Hearing_role_name = representativeUsers[j].HearingRoleName,
                    Last_name = representativeUsers[j].Lastname,
                    Middle_names = "",
                    Representee = representativeUsers[j].Representee,
                    Solicitors_reference = "",
                    Telephone_number = "01234567890",
                    Title = "Mrs",
                    Username = representativeUsers[j].Username
                };
                participants.Add(participant);
            }
        }

        private static void AddIndividualParticipants(List<UserAccount> individualUsers, List<ParticipantRequest> participants)
        {
            for (var i = 0; i < NumberOfIndividuals; i++)
            {
                var participant = new ParticipantRequest
                {
                    Case_role_name = individualUsers[i].CaseRoleName,
                    Contact_email = individualUsers[i].Email,
                    Display_name = individualUsers[i].Displayname,
                    First_name = individualUsers[i].Firstname,
                    Hearing_role_name = individualUsers[i].HearingRoleName,
                    Last_name = individualUsers[i].Lastname,
                    Middle_names = "",
                    Representee = "",
                    Solicitors_reference = individualUsers[i].SolicitorsReference,
                    Telephone_number = "01234567890",
                    Title = "Mrs",
                    Username = individualUsers[i].Username
                };
                participants.Add(participant);
            }
        }
    }
}