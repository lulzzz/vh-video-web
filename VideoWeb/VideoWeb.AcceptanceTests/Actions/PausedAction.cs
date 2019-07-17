﻿using VideoWeb.AcceptanceTests.Builders;
using VideoWeb.AcceptanceTests.Contexts;
using VideoWeb.Services.Video;

namespace VideoWeb.AcceptanceTests.Actions
{
    internal class PausedAction : IHearingStatusActions
    {
        public void Execute(TestContext context, string participantId)
        {
            var request = new CreateEventRequestBuilder()
                .WithConferenceId(context.NewConferenceId)
                .WithParticipantId(participantId)
                .WithEventType(EventType.Pause)
                .FromRoomType(RoomType.HearingRoom)
                .Build();

            new ExecuteEventRequestBuilder()
                .WithContext(context)
                .WithRequest(request)
                .Execute();
        }
    }
}