using System;
using System.Net;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Swashbuckle.AspNetCore.Annotations;
using VideoWeb.Common.Caching;
using VideoWeb.EventHub.Handlers.Core;
using VideoWeb.Mappings;
using VideoWeb.Services.Video;
using EventType = VideoWeb.EventHub.Enums.EventType;
using VAEventType = VideoWeb.Services.Video.EventType;

namespace VideoWeb.Controllers
{
    [Produces("application/json")]
    [ApiController]
    [Route("callback")]
    [Authorize(AuthenticationSchemes = "Callback")]
    public class VideoEventsController : Controller
    {
        private readonly IVideoApiClient _videoApiClient;
        private readonly IEventHandlerFactory _eventHandlerFactory;
        private readonly IConferenceCache _conferenceCache;
        private readonly ILogger<VideoEventsController> _logger;

        public VideoEventsController(IVideoApiClient videoApiClient,
            IEventHandlerFactory eventHandlerFactory, IConferenceCache conferenceCache,
            ILogger<VideoEventsController> logger)
        {
            _videoApiClient = videoApiClient;
            _eventHandlerFactory = eventHandlerFactory;
            _conferenceCache = conferenceCache;
            _logger = logger;
        }

        [HttpPost]
        [SwaggerOperation(OperationId = "SendEvent")]
        [ProducesResponseType((int) HttpStatusCode.NoContent)]
        [ProducesResponseType(typeof(string), (int) HttpStatusCode.BadRequest)]
        public async Task<IActionResult> SendHearingEventAsync(ConferenceEventRequest request)
        {
            try
            {
                _logger.LogTrace("Received callback from Kinly.");
                _logger.LogTrace($"ConferenceId: {request.Conference_id}, EventType: {request.Event_type}, Participant ID : {request.Participant_id}");

                var conferenceId = Guid.Parse(request.Conference_id);
                var conference = await _conferenceCache.GetOrAddConferenceAsync(conferenceId, () =>
                {
                    _logger.LogTrace($"Retrieving conference details for conference: ${conferenceId}");
                    return _videoApiClient.GetConferenceDetailsByIdAsync(conferenceId);
                });
                
                var callbackEvent = CallbackEventMapper.MapConferenceEventToCallbackEventModel(request, conference);
                request.Event_type = Enum.Parse<VAEventType>(callbackEvent.EventType.ToString());
                if (callbackEvent.EventType != EventType.VhoCall)
                {
                    _logger.LogTrace($"Raising video event: ConferenceId: {request.Conference_id}, EventType: {request.Event_type}");
                    await _videoApiClient.RaiseVideoEventAsync(request);
                }

                if (!string.IsNullOrEmpty(request.Phone))
                {
                    return NoContent();
                }

                var handler = _eventHandlerFactory.Get(callbackEvent.EventType);
                await handler.HandleAsync(callbackEvent);
                return NoContent();
            }
            catch (VideoApiException e)
            {
                _logger.LogError(e, $"ConferenceId: {request.Conference_id}, ErrorCode: {e.StatusCode}");
                return StatusCode(e.StatusCode, e.Response);
            }
        }
    }
}
