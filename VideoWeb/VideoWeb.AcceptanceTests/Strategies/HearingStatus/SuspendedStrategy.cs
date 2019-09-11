﻿using VideoWeb.AcceptanceTests.Builders;
using VideoWeb.AcceptanceTests.Contexts;
using VideoWeb.Services.Video;

namespace VideoWeb.AcceptanceTests.Strategies.HearingStatus
{
    internal class SuspendedStrategy : IHearingStatusStrategies
    {
        public void Execute(TestContext context, string participantId)
        {
            var request = new EventRequestBuilder()
                .WithConferenceId(context.NewConferenceId)
                .WithParticipantId(participantId)
                .WithEventType(EventType.Disconnected)
                .FromRoomType(RoomType.HearingRoom)
                .Build();

            new ExecuteEventBuilder()
                .WithContext(context)
                .WithRequest(request)
                .Execute();
        }
    }
}