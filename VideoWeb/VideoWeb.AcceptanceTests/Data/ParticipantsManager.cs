using System;
using System.Collections.Generic;
using FluentAssertions;
using VideoWeb.Services.Bookings;
using VideoWeb.Services.Video;

namespace VideoWeb.AcceptanceTests.Data
{
    public static class ParticipantsManager
    {
        public static List<ParticipantResponse> GetParticipantsFromRole(List<ParticipantResponse> hearingParticipants, string userRole)
        {
            userRole = ChangeClerkForJudge(userRole);
            var participants = userRole.ToLower().Equals("participants") ? hearingParticipants.FindAll(x => x.User_role_name == "Individual" || x.User_role_name == "Representative") : hearingParticipants.FindAll(x => x.User_role_name == EnsureRoleTypeHasCapitalLetter(userRole));
            participants.Should().NotBeNullOrEmpty($"No participants with role {userRole} found");
            return participants;
        }

        public static List<ParticipantDetailsResponse> GetParticipantsFromRole(List<ParticipantDetailsResponse> conferenceParticipants, string userRole)
        {
            userRole = ChangeClerkForJudge(userRole);
            List<ParticipantDetailsResponse> participants;
            if (userRole.ToLower().Equals("participants"))
            {
                participants = conferenceParticipants.FindAll(x => x.User_role == UserRole.Individual || x.User_role == UserRole.Representative);

            }
            else
            {
                Enum.TryParse(EnsureRoleTypeHasCapitalLetter(userRole), out UserRole userRoleEnum);
                participants = conferenceParticipants.FindAll(x => x.User_role == userRoleEnum);
            }

            participants.Should().NotBeNullOrEmpty($"No participants with role {userRole} found");
            return participants;
        }

        private static string ChangeClerkForJudge(string userRole)
        {
            return userRole.ToLower().Replace("clerk", "Judge");
        }

        private static string EnsureRoleTypeHasCapitalLetter(string userRole)
        {
            return char.ToUpper(userRole[0]) + userRole.Substring(1);
        }
    }
}