﻿using System;
using System.Linq;
using System.Net;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Swashbuckle.AspNetCore.Annotations;
using VideoWeb.Common.Caching;
using VideoWeb.Common.Extensions;
using VideoWeb.Contract.Request;
using VideoWeb.Services.Video;

namespace VideoWeb.Controllers
{
    [Produces("application/json")]
    [ApiController]
    [Route("conferences")]
    public class InternalEventController: Controller
    {
        private readonly IVideoApiClient _videoApiClient;
        private readonly IConferenceCache _conferenceCache;

        public InternalEventController(IVideoApiClient videoApiClient, IConferenceCache conferenceCache)
        {
            _videoApiClient = videoApiClient;
            _conferenceCache = conferenceCache;
        }

        [HttpPost("{conferenceId}/mediaevents")]
        [SwaggerOperation(OperationId = "AddMediaEventToConference")]
        [ProducesResponseType((int)HttpStatusCode.NotFound)]
        [ProducesResponseType((int)HttpStatusCode.BadRequest)]
        [ProducesResponseType((int)HttpStatusCode.NoContent)]
        public async Task<IActionResult> AddMediaEventToConferenceAsync(Guid conferenceId, [FromBody] AddMediaEventRequest addMediaEventRequest)
        {
            var participantId = await GetIdForParticipantByUsernameInConference(conferenceId);
            try
            {
                await _videoApiClient.RaiseVideoEventAsync(new ConferenceEventRequest
                {
                    Conference_id = conferenceId.ToString(),
                    Participant_id = participantId.ToString(),
                    Event_id = Guid.NewGuid().ToString(),
                    Event_type = addMediaEventRequest.EventType,
                    Time_stamp_utc = DateTime.UtcNow,
                    Reason = "media permission denied"
                });

                return NoContent();
            }
            catch (VideoApiException e)
            {
                return StatusCode(e.StatusCode, e.Response);
            }
        }

        [HttpPost("{conferenceId}/connectingtoconference")]
        [SwaggerOperation(OperationId = "AddConnectingToConference")]
        [ProducesResponseType((int)HttpStatusCode.NotFound)]
        [ProducesResponseType((int)HttpStatusCode.BadRequest)]
        [ProducesResponseType((int)HttpStatusCode.NoContent)]
        public async Task<IActionResult> AddConnectingToConferenceAsync(Guid conferenceId, [FromBody] ConnectingToConference addConnectingToConferenceRequest)
        {
            var participantId = await GetIdForParticipantByUsernameInConference(conferenceId);
            try
            {
                await _videoApiClient.RaiseVideoEventAsync(new ConferenceEventRequest
                {
                    Conference_id = conferenceId.ToString(),
                    Participant_id = participantId.ToString(),
                    Event_id = Guid.NewGuid().ToString(),
                    Event_type = addConnectingToConferenceRequest.EventType,
                    Time_stamp_utc = DateTime.UtcNow,
                    Reason = "Setting up Pexip client for self-test."
                });

                return NoContent();
            }
            catch (VideoApiException e)
            {
                return StatusCode(e.StatusCode, e.Response);
            }
        }

        [HttpPost("{conferenceId}/selectingdevicemedia")]
        [SwaggerOperation(OperationId = "AddSelectingDeviceMedia")]
        [ProducesResponseType((int)HttpStatusCode.NotFound)]
        [ProducesResponseType((int)HttpStatusCode.BadRequest)]
        [ProducesResponseType((int)HttpStatusCode.NoContent)]
        public async Task<IActionResult> AddSelectingDeviceMediaAsync(Guid conferenceId, [FromBody] SelectingDeviceMedia addSelectingDeviceMediaRequest)
        {
            var participantId = await GetIdForParticipantByUsernameInConference(conferenceId);
            var reason = "Self-test: Multiple devices - " + addSelectingDeviceMediaRequest.HasMultipleDevices + "; Camera - " + addSelectingDeviceMediaRequest.Camera + "; Mic - " + addSelectingDeviceMediaRequest.Mic;
            try
            {
                await _videoApiClient.RaiseVideoEventAsync(new ConferenceEventRequest
                {
                    Conference_id = conferenceId.ToString(),
                    Participant_id = participantId.ToString(),
                    Event_id = Guid.NewGuid().ToString(),
                    Event_type = addSelectingDeviceMediaRequest.EventType,
                    Time_stamp_utc = DateTime.UtcNow,
                    Reason = reason
                });

                return NoContent();
            }
            catch (VideoApiException e)
            {
                return StatusCode(e.StatusCode, e.Response);
            }
        }

        [HttpPost("{conferenceId}/connectingtoeventhub")]
        [SwaggerOperation(OperationId = "AddConnectingToEventHub")]
        [ProducesResponseType((int)HttpStatusCode.NotFound)]
        [ProducesResponseType((int)HttpStatusCode.BadRequest)]
        [ProducesResponseType((int)HttpStatusCode.NoContent)]
        public async Task<IActionResult> AddConnectingToEventHubAsync(Guid conferenceId, [FromBody] ConnectingToEventHub addConnectingToEventHubRequest)
        {
            var participantId = await GetIdForParticipantByUsernameInConference(conferenceId);
            try
            {
                await _videoApiClient.RaiseVideoEventAsync(new ConferenceEventRequest
                {
                    Conference_id = conferenceId.ToString(),
                    Participant_id = participantId.ToString(),
                    Event_id = Guid.NewGuid().ToString(),
                    Event_type = addConnectingToEventHubRequest.EventType,
                    Time_stamp_utc = DateTime.UtcNow
                });

                return NoContent();
            }
            catch (VideoApiException e)
            {
                return StatusCode(e.StatusCode, e.Response);
            }
        }

        [HttpPost("{conferenceId}/selftestfailureevents")]
        [SwaggerOperation(OperationId = "AddSelfTestFailureEventToConference")]
        [ProducesResponseType((int)HttpStatusCode.NotFound)]
        [ProducesResponseType((int)HttpStatusCode.BadRequest)]
        [ProducesResponseType((int)HttpStatusCode.NoContent)]
        public async Task<IActionResult> AddSelfTestFailureEventToConferenceAsync(Guid conferenceId, 
            [FromBody] AddSelfTestFailureEventRequest addSelfTestFailureEventRequest)
        {
            var participantId = await GetIdForParticipantByUsernameInConference(conferenceId);
            try
            {
                var eventRequest = new ConferenceEventRequest
                {
                    Conference_id = conferenceId.ToString(),
                    Participant_id = participantId.ToString(),
                    Event_id = Guid.NewGuid().ToString(),
                    Event_type = addSelfTestFailureEventRequest.EventType,
                    Time_stamp_utc = DateTime.UtcNow,
                    Reason = $"Failed self-test ({addSelfTestFailureEventRequest.SelfTestFailureReason.DescriptionAttr()})"
                };
                await _videoApiClient.RaiseVideoEventAsync(eventRequest);

                return NoContent();
            }
            catch (VideoApiException e)
            {
                return StatusCode(e.StatusCode, e.Response);
            }
        }

        private async Task<Guid> GetIdForParticipantByUsernameInConference(Guid conferenceId)
        {
            var conference = await _conferenceCache.GetOrAddConferenceAsync
            (
                conferenceId, 
                () => _videoApiClient.GetConferenceDetailsByIdAsync(conferenceId)
            );

            var username = User.Identity.Name;
            
            return conference.Participants
                .Single(x => x.Username.Equals(username, StringComparison.CurrentCultureIgnoreCase)).Id;
        }
    }
}
