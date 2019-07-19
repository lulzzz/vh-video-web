﻿using VideoWeb.AcceptanceTests.Builders;
using VideoWeb.AcceptanceTests.Contexts;
using VideoWeb.Services.Video;

namespace VideoWeb.AcceptanceTests.Actions
{
    internal class InSessionAction : IHearingStatusActions
    {
        public void Execute(TestContext context, string participantId)
        {
            var request = new EventRequestBuilder()
                .WithConferenceId(context.NewConferenceId)
                .WithParticipantId(participantId)
                .WithEventType(EventType.Transfer)
                .FromRoomType(RoomType.WaitingRoom)
                .ToRoomType(RoomType.HearingRoom)
                .Build();

            new ExecuteEventBuilder()
                .WithContext(context)
                .WithRequest(request)
                .Execute();

            request = new EventRequestBuilder()
                .WithConferenceId(context.NewConferenceId)
                .WithParticipantId(participantId)
                .WithEventType(EventType.Joined)
                .FromRoomType(null)
                .ToRoomType(null)
                .Build();

            new ExecuteEventBuilder()
                .WithContext(context)
                .WithRequest(request)
                .Execute();
        }
    }
}