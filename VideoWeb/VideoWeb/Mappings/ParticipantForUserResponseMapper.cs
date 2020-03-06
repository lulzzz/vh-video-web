using System;
using System.Collections.Generic;
using System.Linq;
using VideoWeb.Contract.Responses;
using VideoWeb.Services.Video;
using UserRole = VideoWeb.Contract.Responses.UserRole;

namespace VideoWeb.Mappings
{
    public class ParticipantForUserResponseMapper
    {
        public List<ParticipantForUserResponse> MapParticipants(IEnumerable<ParticipantSummaryResponse> participants)
        {
            return participants.Select(participant => new ParticipantForUserResponse
                {
                    Username = participant.Username,
                    DisplayName = participant.Display_name,
                    Status = Enum.Parse<ParticipantStatus>(participant.Status.ToString()),
                    Role = Enum.Parse<UserRole>(participant.User_role.ToString()),
                    Representee = string.IsNullOrWhiteSpace(participant.Representee) ? null : participant.Representee,
                    CaseTypeGroup = participant.Case_group
                })
                .ToList();
        }
    }
}