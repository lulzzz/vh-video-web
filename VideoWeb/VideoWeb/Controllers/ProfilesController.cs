using System.Net;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Swashbuckle.AspNetCore.Annotations;
using VideoWeb.Contract.Responses;
using VideoWeb.Mappings;
using VideoWeb.Services.User;

namespace VideoWeb.Controllers
{
    [Produces("application/json")]
    [ApiController]
    [Route("profile")]
    public class ProfilesController : Controller
    {
        private readonly IUserApiClient _userApiClient;
        private readonly ILogger<ProfilesController> _logger;

        public ProfilesController(IUserApiClient userApiClient, ILogger<ProfilesController> logger)
        {
            _userApiClient = userApiClient;
            _logger = logger;
        }

        /// <summary>
        /// Get profile for logged in user
        /// </summary>
        /// <returns></returns>
        [HttpGet]
        [SwaggerOperation(OperationId = "GetUserProfile")]
        [ProducesResponseType(typeof(UserProfileResponse), (int)HttpStatusCode.OK)]
        public async Task<IActionResult> GetUserProfileAsync()
        {
            // INFO
            //    We can map the (UserProfileResponse) properties to user claims and cache it by JWT token
            //    i.e every time user logs on, we cache in Redis the UserProfileResponse, which is mapped to the user claims
            //    This means as the user logins in for that specifed 1 hour timeframe, 
            //    all pages views that require the profile will call this BFF endpoint, and the profile is retrieved by
            //    the JWT token provided. (User.Claims)
            //    This will be implemented in the startup.cs on the AddJwtBearer -> options.Events => OnTokenValidated,
            //    and refreshing the profile is a matter of just logging out and in again as they will have a new jwt token
            
            var username = User.Identity.Name.ToLower().Trim();
            try
            {
                var profile = await _userApiClient.GetUserByAdUserNameAsync(username);
                var response = UserProfileResponseMapper.MapToResponseModel(profile);
                return Ok(response);
            }
            catch (UserApiException e)
            {
                _logger.LogError(e, "Unable to get user profile");
                return StatusCode(e.StatusCode, e.Response);
            }
        }

        /// <summary>
        /// Get profile for username
        /// </summary>
        /// <param name="username"></param>
        /// <returns></returns>
        [HttpGet("query")]
        [SwaggerOperation(OperationId = "GetProfileByUsername")]
        [ProducesResponseType(typeof(UserProfileResponse), (int)HttpStatusCode.OK)]
        public async Task<IActionResult> GetProfileByUsernameAsync([FromQuery]string username)
        {
            var usernameClean = username.ToLower().Trim();
            try
            {
                var profile = await _userApiClient.GetUserByAdUserNameAsync(usernameClean);
                var response = UserProfileResponseMapper.MapToResponseModel(profile);
                return Ok(response);
            }
            catch (UserApiException e)
            {
                _logger.LogError(e, "Unable to get user profile");
                return StatusCode(e.StatusCode, e.Response);
            }
        }
    }
}
