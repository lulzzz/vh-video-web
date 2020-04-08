using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Polly.CircuitBreaker;
using Swashbuckle.AspNetCore.Annotations;
using VideoWeb.Common.Caching;
using VideoWeb.Common.Models;
using VideoWeb.Contract.Responses;
using VideoWeb.Helpers;
using VideoWeb.Mappings;
using VideoWeb.Services.Bookings;
using VideoWeb.Services.User;
using VideoWeb.Services.Video;
using BookingParticipant = VideoWeb.Services.Bookings.ParticipantResponse;
using ConferenceForIndividualResponse = VideoWeb.Contract.Responses.ConferenceForIndividualResponse;
using ConferenceForJudgeResponse = VideoWeb.Contract.Responses.ConferenceForJudgeResponse;

namespace VideoWeb.Controllers
{
    [Produces("application/json")]
    [ApiController]
    [Route("conferences")]
    public class ConferencesController : Controller
    {
        private readonly IVideoApiClient _videoApiClient;
        private readonly IUserApiClient _userApiClient;
        private readonly IBookingsApiClient _bookingsApiClient;
        private readonly ILogger<ConferencesController> _logger;
        private readonly IConferenceCache _conferenceCache;

        public ConferencesController(IVideoApiClient videoApiClient, IUserApiClient userApiClient,
            IBookingsApiClient bookingsApiClient, ILogger<ConferencesController> logger,
            IConferenceCache conferenceCache)
        {
            _videoApiClient = videoApiClient;
            _userApiClient = userApiClient;
            _bookingsApiClient = bookingsApiClient;
            _logger = logger;
            _conferenceCache = conferenceCache;
        }

        /// <summary>
        /// Get conferences today for a judge or a clerk
        /// </summary>
        /// <returns>List of conferences, if any</returns>
        [HttpGet("judges")]
        [ProducesResponseType(typeof(List<ConferenceForJudgeResponse>), (int)HttpStatusCode.OK)]
        [ProducesResponseType((int)HttpStatusCode.BadRequest)]
        [SwaggerOperation(OperationId = "GetConferencesForJudge")]
        public async Task<ActionResult<List<ConferenceForJudgeResponse>>> GetConferencesForJudgeAsync()
        {
            _logger.LogDebug("GetConferencesForJudge");
            try
            {
                var username = User.Identity.Name;
                var conferencesForJudge = await _videoApiClient.GetConferencesTodayForJudgeByUsernameAsync(username);
                var response = conferencesForJudge
                    .Select(ConferenceForJudgeResponseMapper.MapConferenceSummaryToModel)
                    .ToList();
                return Ok(response);
            }
            catch (VideoApiException e)
            {
                _logger.LogError(e, "Unable to get conferences for user");
                return StatusCode(e.StatusCode, e.Response);
            }
        }

        /// <summary>
        /// Get conferences today for individual or representative excluding those that have been closed for over 30 minutes
        /// </summary>
        /// <returns>List of conferences, if any</returns>
        [HttpGet("individuals")]
        [ProducesResponseType(typeof(List<ConferenceForIndividualResponse>), (int)HttpStatusCode.OK)]
        [ProducesResponseType((int)HttpStatusCode.BadRequest)]
        [SwaggerOperation(OperationId = "GetConferencesForIndividual")]
        public async Task<ActionResult<IEnumerable<ConferenceForIndividualResponse>>> GetConferencesForIndividual()
        {
            _logger.LogDebug("GetConferencesForIndividual");
            try
            {
                var username = User.Identity.Name;
                var conferencesForIndividual = await _videoApiClient.GetConferencesTodayForIndividualByUsernameAsync(username);
                var response = conferencesForIndividual
                    .Select(ConferenceForIndividualResponseMapper.MapConferenceSummaryToModel).ToList();
                return Ok(response);
            }
            catch (VideoApiException e)
            {
                _logger.LogError(e, "Unable to get conferences for user");
                return StatusCode(e.StatusCode, e.Response);
            }
        }


        /// <summary>
        /// Get conferences for user
        /// </summary>
        /// <returns>List of conferences, if any</returns>
        [HttpGet("vhofficer")]
        [ProducesResponseType(typeof(List<ConferenceForVhOfficerResponse>), (int)HttpStatusCode.OK)]
        [ProducesResponseType((int)HttpStatusCode.Unauthorized)]
        [SwaggerOperation(OperationId = "GetConferencesForVhOfficer")]
        public async Task<ActionResult<List<ConferenceForVhOfficerResponse>>> GetConferencesForVhOfficerAsync()
        {
            // INFO
            //     Gets the list for the conference onInit for the Vho-Hearings component Every 30 Seconds
            _logger.LogDebug("GetConferencesForVhOfficer");
            
            //INFO
            //    cache the profile response as the Graph Api is called with 2 calls in UserApi (GET user,groups)
            //     Should be either local Memory or Redis, with sliding Experation while the VHO uses the page
            //     Extract this try/catch into a method
            try
            {
                var username = User.Identity.Name.ToLower().Trim();
                var profile = await _userApiClient.GetUserByAdUserNameAsync(username);
                var profileResponse = UserProfileResponseMapper.MapToResponseModel(profile);
                if (profileResponse.Role != Role.VideoHearingsOfficer)
                {
                    _logger.LogError($"Failed to get conferences for today: {username} is not a VH officer");
                    return Unauthorized("User must be a VH Officer");
                }
            }
            catch (UserApiException e)
            {
                return StatusCode(e.StatusCode, e.Response);
            }

            try
            {
                // INFO
                // Having 1000 hearing on the VHO screen will mean that initial call will bring back 1000 hearing,
                //    we need to filter them so as to not fetch 1000 hearings, i.e. have a default filter set, change call to get conferences to actually
                //    return filtered conferences from source (filtering currently done on client by hiding/showing)
                // Remove the ToList() below
                var conferences = await _videoApiClient.GetConferencesTodayForAdminAsync();
                conferences = conferences.Where(c => ConferenceHelper.HasNotPassed(c.Status, c.Closed_date_time)).ToList();
                conferences = conferences.OrderBy(x => x.Closed_date_time).ToList();
                var tasks = conferences.Select(MapConferenceForVhoAsync).ToArray();

                var response = await Task.WhenAll(tasks);

                return Ok(response.ToList());
            }
            catch (VideoApiException e)
            {
                return StatusCode(e.StatusCode, e.Response);
            }
        }

        private async Task<ConferenceForVhOfficerResponse> MapConferenceForVhoAsync(
            ConferenceForAdminResponse conference)
        {
            if (!IsInStateToChat(conference))
            {
                return ConferenceForVhOfficerResponseMapper.MapConferenceSummaryToResponseModel(conference, null);
            }

            // INFO
            // 1) May be faster to change the query in API to get just the InstantMessageHistory domain objects
            //     directly instead of getting the _context.Conferences.Include(x => x.InstantMessageHistory)
            // 2) the retrieveHearingsForVhOfficer() gets all the conferences, but below will call to get IM 1 by 1, 
            //    so maybe better to take the time hit to get IM's from the original GetConferencesTodayForAdminAsync() call to the API
            //    as doing multiple calls for will add to time.
            
            var messages = await _videoApiClient.GetInstantMessageHistoryAsync(conference.Id);

            return ConferenceForVhOfficerResponseMapper.MapConferenceSummaryToResponseModel(conference, messages);
        }

        private static bool IsInStateToChat(ConferenceForAdminResponse conference)
        {
            return conference.Status == ConferenceState.NotStarted ||
                   conference.Status == ConferenceState.Paused ||
                   conference.Status == ConferenceState.Suspended;
        }


        /// <summary>
        /// Get the details of a conference by id for VH officer
        /// </summary>
        /// <param name="conferenceId">The unique id of the conference</param>
        /// <returns>the details of a conference, if permitted</returns>
        [HttpGet("{conferenceId}/vhofficer")]
        [ProducesResponseType(typeof(ConferenceResponseVho), (int)HttpStatusCode.OK)]
        [ProducesResponseType((int)HttpStatusCode.BadRequest)]
        [ProducesResponseType((int)HttpStatusCode.NotFound)]
        [SwaggerOperation(OperationId = "GetConferenceByIdVHO")]
        public async Task<ActionResult<ConferenceResponseVho>> GetConferenceByIdVHOAsync(Guid conferenceId)
        {
            _logger.LogDebug("GetConferenceById");
            if (conferenceId == Guid.Empty)
            {
                _logger.LogError("Unable to get conference when id is not provided");
                ModelState.AddModelError(nameof(conferenceId), $"Please provide a valid {nameof(conferenceId)}");
                return BadRequest(ModelState);
            }

            var username = User.Identity.Name.ToLower().Trim();
            try
            {
                _logger.LogTrace("Checking to see if user is a VH Officer");
                // INFO 
                //    Using the claims that are stored from the JWT method, can save 500 ms
                var profile = await _userApiClient.GetUserByAdUserNameAsync(username);
                var profileResponse = UserProfileResponseMapper.MapToResponseModel(profile);

                if (profileResponse.Role != Role.VideoHearingsOfficer)
                {
                    _logger.LogError($"Failed to get conference: ${conferenceId}, {username} is not a VH officer");
                    return Unauthorized("User must be a VH Officer");
                }
            }
            catch (UserApiException e)
            {
                _logger.LogError(e, "Unable to retrieve user profile");
                return StatusCode(e.StatusCode, e.Response);
            }

            ConferenceDetailsResponse conference;
            try
            {
                _logger.LogTrace($"Retrieving conference details for conference: ${conferenceId}");
                // INFO
                //    get from cache ? 
                conference = await _videoApiClient.GetConferenceDetailsByIdAsync(conferenceId);
            }
            catch (VideoApiException e)
            {
                _logger.LogError(e, $"Unable to retrieve conference: ${conferenceId}");
                return StatusCode(e.StatusCode, e.Response);
            }

            var exceededTimeLimit = !ConferenceHelper.HasNotPassed(conference.Current_status, conference.Closed_date_time);
            if (exceededTimeLimit)
            {
                _logger.LogInformation(
                    $"Unauthorised to view conference details {conferenceId} because user is not " +
                    "Officer nor a participant of the conference, or the conference has been closed for over 30 minutes");
                return Unauthorized();
            }

            // INFO
            //    Why do a booking participants to Video participants check ? is it really necessary?
            var bookingParticipants = new List<BookingParticipant>();
            try
            {
                _logger.LogTrace($"Retrieving booking participants for hearing ${conference.Hearing_id}");
                bookingParticipants = await _bookingsApiClient.GetAllParticipantsInHearingAsync(conference.Hearing_id);
            }
            catch (BookingsApiException e)
            {
                _logger.LogError(e, $"Unable to retrieve booking participants for hearing ${conference.Hearing_id}");
            }
            catch (BrokenCircuitException e)
            {
                _logger.LogError(e, $"Unable to retrieve booking participants for hearing ${conference.Hearing_id}");
            }

            if (bookingParticipants.Any())
            {
                try
                {
                    ValidateConferenceAndBookingParticipantsMatch(conference.Participants, bookingParticipants);
                }
                catch (AggregateException e)
                {
                    return StatusCode((int)HttpStatusCode.ExpectationFailed, e);
                }
            }

            // these are roles that are filtered against when lists participants on the UI
            var displayRoles = new List<Role>
            {
                Role.Judge,
                Role.Individual,
                Role.Representative
            };
            conference.Participants = conference.Participants
                .Where(x => displayRoles.Contains((Role)x.User_role)).ToList();

            var response =
                ConferenceResponseVhoMapper.MapConferenceDetailsToResponseModel(conference, bookingParticipants);
            // INFO
            //    Conference added but not retrieved in this method GetConferenceByIdVHOAsync()
            await _conferenceCache.AddConferenceToCache(conference);

            return Ok(response);
        }

        /// <summary>
        /// Get the details of a conference by id
        /// </summary>
        /// <param name="conferenceId">The unique id of the conference</param>
        /// <returns>the details of a conference, if permitted</returns>
        [HttpGet("{conferenceId}")]
        [ProducesResponseType(typeof(ConferenceResponse), (int)HttpStatusCode.OK)]
        [ProducesResponseType((int)HttpStatusCode.BadRequest)]
        [ProducesResponseType((int)HttpStatusCode.NotFound)]
        [SwaggerOperation(OperationId = "GetConferenceById")]
        public async Task<ActionResult<ConferenceResponse>> GetConferenceByIdAsync(Guid conferenceId)
        {
            _logger.LogDebug("GetConferenceById");
            if (conferenceId == Guid.Empty)
            {
                _logger.LogError("Unable to get conference when id is not provided");
                ModelState.AddModelError(nameof(conferenceId), $"Please provide a valid {nameof(conferenceId)}");
                return BadRequest(ModelState);
            }

            var username = User.Identity.Name.ToLower().Trim();

            ConferenceDetailsResponse conference;
            try
            {
                _logger.LogTrace($"Retrieving conference details for conference: ${conferenceId}");
                // INFO
                //    get from cache ? 
                conference = await _videoApiClient.GetConferenceDetailsByIdAsync(conferenceId);
            }
            catch (VideoApiException e)
            {
                _logger.LogError(e, $"Unable to retrieve conference: ${conferenceId}");
                return StatusCode(e.StatusCode, e.Response);
            }

            var exceededTimeLimit = !ConferenceHelper.HasNotPassed(conference.Current_status, conference.Closed_date_time);
            if (conference.Participants.All(x => x.Username.ToLower().Trim() != username) || exceededTimeLimit)
            {
                _logger.LogInformation(
                    $"Unauthorised to view conference details {conferenceId} because user is neither a VH " +
                    "Officer nor a participant of the conference, or the conference has been closed for over 30 minutes");
                return Unauthorized();
            }

            // these are roles that are filtered against when lists participants on the UI
            var displayRoles = new List<Role>
            {
                Role.Judge,
                Role.Individual,
                Role.Representative
            };
            conference.Participants = conference.Participants
                .Where(x => displayRoles.Contains((Role)x.User_role)).ToList();

            var response = ConferenceResponseMapper.MapConferenceDetailsToResponseModel(conference);
            // INFO
            //    Conference added but not retrieved in this method GetConferenceByIdAsync()
            await _conferenceCache.AddConferenceToCache(conference);

            return Ok(response);
        }

        private static void ValidateConferenceAndBookingParticipantsMatch(
            IEnumerable<ParticipantDetailsResponse> participants,
            IReadOnlyCollection<BookingParticipant> bookingParticipants)
        {
            var missingBookingParticipantIds = new List<Exception>();
            foreach (var participant in participants)
            {
                if (bookingParticipants.SingleOrDefault(p => p.Id == participant.Ref_id) == null)
                {
                    missingBookingParticipantIds.Add(new ArgumentNullException(
                        $"Unable to find a participant in bookings api with id ${participant.Ref_id}"));
                }
            }

            if (missingBookingParticipantIds.Any())
            {
                throw new AggregateException(missingBookingParticipantIds);
            }
        }
    }
}
