using FizzWare.NBuilder;
using FluentAssertions;
using NUnit.Framework;
using Testing.Common.Builders;
using VideoWeb.Contract.Responses;
using VideoWeb.Mappings;
using VideoWeb.Services.Video;
using BookingParticipant = VideoWeb.Services.Bookings.ParticipantResponse;
using UserRole = VideoWeb.Contract.Responses.UserRole;

namespace VideoWeb.UnitTests.Mappings
{
    public class ParticipantResponseMapperTests
    {
        private readonly ParticipantResponseMapper _mapper = new ParticipantResponseMapper();

        [Test]
        public void should_map_all_properties()
        {
            const ParticipantStatus expectedStatus = ParticipantStatus.Available;
            const UserRole expectedRole = UserRole.Individual;
            var participant = new ParticipantDetailsResponseBuilder(Services.Video.UserRole.Individual, "Claimant")
                .WithStatus(ParticipantState.Available).Build();

            var bookingParticipant = Builder<BookingParticipant>.CreateNew().With(
                x => x.Id = participant.Ref_id).Build();
            
            var response = _mapper.MapParticipantToResponseModel(participant, bookingParticipant);
            response.Id.Should().Be(participant.Id.GetValueOrDefault());
            response.Name.Should().Be(participant.Name);
            response.Username.Should().Be(participant.Username);
            response.Status.Should().Be(expectedStatus);
            response.DisplayName.Should().Be(participant.Display_name);
            response.Role.Should().Be(expectedRole);
            response.CaseTypeGroup.Should().Be(participant.Case_type_group);
            response.Representee.Should().Be(participant.Representee);
            response.FirstName.Should().NotBeNullOrEmpty();
            response.LastName.Should().NotBeNullOrEmpty();
            response.ContactEmail.Should().NotBeNullOrEmpty();
            response.ContactTelephone.Should().NotBeNullOrEmpty();
        }
    }
}