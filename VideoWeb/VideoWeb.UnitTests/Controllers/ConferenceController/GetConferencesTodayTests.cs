using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Threading.Tasks;
using FizzWare.NBuilder;
using FluentAssertions;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Moq;
using NUnit.Framework;
using Testing.Common.Helpers;
using VideoWeb.Contract.Responses;
using VideoWeb.Controllers;
using VideoWeb.Services.Bookings;
using VideoWeb.Services.User;
using VideoWeb.Services.Video;
using ProblemDetails = Microsoft.AspNetCore.Mvc.ProblemDetails;

namespace VideoWeb.UnitTests.Controllers.ConferenceController
{
    public class GetConferencesTodayTests
    {
        private ConferencesController _controller;
        private Mock<IVideoApiClient> _videoApiClientMock;
        private Mock<IUserApiClient> _userApiClientMock;
        private Mock<IBookingsApiClient> _bookingsApiClientMock;
        
        [SetUp]
        public void Setup()
        {
            _videoApiClientMock = new Mock<IVideoApiClient>();
            _userApiClientMock = new Mock<IUserApiClient>();
            _bookingsApiClientMock = new Mock<IBookingsApiClient>();
            var claimsPrincipal = new ClaimsPrincipalBuilder().Build();
            var context = new ControllerContext
            {
                HttpContext = new DefaultHttpContext
                {
                    User = claimsPrincipal
                }
            };

            _controller = new ConferencesController(_videoApiClientMock.Object, _userApiClientMock.Object,
                _bookingsApiClientMock.Object)
            {
                ControllerContext = context
            };
        }
        
        [Test]
        public async Task should_return_unauthorised_when_not_a_vh_officer()
        {
            var userProfile = new UserProfile {User_role = "Judge"};
            _userApiClientMock
                .Setup(x => x.GetUserByAdUserNameAsync(It.IsAny<string>()))
                .ReturnsAsync(userProfile);
            

            var result = await _controller.GetConferencesToday();
            
            var typedResult = (UnauthorizedObjectResult) result.Result;
            typedResult.Should().NotBeNull();
        }
        
        [Test]
        public async Task should_forward_error_when_user_api_returns_error()
        {
            var apiException = new UserApiException<ProblemDetails>("Internal Server Error", (int) HttpStatusCode.InternalServerError,
                "Stacktrace goes here", null, default(ProblemDetails), null);
            _userApiClientMock
                .Setup(x => x.GetUserByAdUserNameAsync(It.IsAny<string>()))
                .ThrowsAsync(apiException);

            var result = await _controller.GetConferencesToday();
            
            var typedResult = (ObjectResult)result.Result;
            typedResult.StatusCode.Should().Be((int) HttpStatusCode.InternalServerError);
        }
        
        [Test]
        public async Task should_forward_error_when_video_api_returns_error()
        {
            var userProfile = new UserProfile {User_role = "VhOfficer"};
            _userApiClientMock
                .Setup(x => x.GetUserByAdUserNameAsync(It.IsAny<string>()))
                .ReturnsAsync(userProfile);       

            var apiException = new VideoApiException<ProblemDetails>("Internal Server Error", (int) HttpStatusCode.InternalServerError,
                "Stacktrace goes here", null, default(ProblemDetails), null);
            _videoApiClientMock
                .Setup(x => x.GetConferencesTodayAsync())
                .ThrowsAsync(apiException);
            
            var result = await _controller.GetConferencesToday();
            
            var typedResult = (ObjectResult)result.Result;
            typedResult.StatusCode.Should().Be((int) HttpStatusCode.InternalServerError);
        }
        
        
        [Test]
        public async Task should_return_ok_with_list_of_conferences()
        {
            var userProfile = new UserProfile {User_role = "VhOfficer"};
            _userApiClientMock
                .Setup(x => x.GetUserByAdUserNameAsync(It.IsAny<string>()))
                .ReturnsAsync(userProfile);  
            
            var conferences = Builder<ConferenceSummaryResponse>.CreateListOfSize(4).Build().ToList();
            _videoApiClientMock
                .Setup(x => x.GetConferencesTodayAsync())
                .ReturnsAsync(conferences);

            var result = await _controller.GetConferencesToday();
            
            var typedResult = (OkObjectResult) result.Result;
            typedResult.Should().NotBeNull();
            
            var conferencesForUser = (List<ConferenceForUserResponse>)typedResult.Value;
            conferencesForUser.Should().NotBeNullOrEmpty();
        }

    }
}