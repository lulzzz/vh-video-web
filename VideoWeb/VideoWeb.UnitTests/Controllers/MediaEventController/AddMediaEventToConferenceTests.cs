﻿using System;
using System.Net;
using System.Threading.Tasks;
using FizzWare.NBuilder;
using FluentAssertions;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Moq;
using NUnit.Framework;
using Testing.Common.Helpers;
using VideoWeb.Contract.Request;
using VideoWeb.Controllers;
using VideoWeb.Services.Video;

namespace VideoWeb.UnitTests.Controllers.MediaEventController
{
    public class AddMediaEventToConferenceTests
    {
        private VideoWeb.Controllers.MediaEventController _controller;
        private Mock<IVideoApiClient> _videoApiClientMock;

        [SetUp]
        public void Setup()
        {
            _videoApiClientMock = new Mock<IVideoApiClient>();
            var claimsPrincipal = new ClaimsPrincipalBuilder().Build();
            var context = new ControllerContext
            {
                HttpContext = new DefaultHttpContext
                {
                    User = claimsPrincipal
                }
            };

            _controller = new VideoWeb.Controllers.MediaEventController(_videoApiClientMock.Object)
            {
                ControllerContext = context
            };
        }

        [Test]
        public async Task should_return_no_content_when_event_is_sent()
        {
            _videoApiClientMock
                .Setup(x => x.PostEventsAsync(It.IsAny<ConferenceEventRequest>()))
                .Returns(Task.FromResult(default(object)));

            var result = await _controller.AddMediaEventToConference(Guid.NewGuid(), Builder<AddMediaEventRequest>.CreateNew().Build());
            var typedResult = (NoContentResult)result;
            typedResult.Should().NotBeNull();
        }

        [Test]
        public async Task should_return_bad_request()
        {
            var apiException = new VideoApiException<Microsoft.AspNetCore.Mvc.ProblemDetails>("Bad Request", (int)HttpStatusCode.BadRequest,
                "Please provide a valid conference Id", null, default(Microsoft.AspNetCore.Mvc.ProblemDetails), null);
            _videoApiClientMock
                .Setup(x => x.PostEventsAsync(It.IsAny<ConferenceEventRequest>()))
                .ThrowsAsync(apiException);

            var result = await _controller.AddMediaEventToConference(Guid.NewGuid(), Builder<AddMediaEventRequest>.CreateNew().Build());
            var typedResult = (ObjectResult)result;
            typedResult.StatusCode.Should().Be((int)HttpStatusCode.BadRequest);
        }

        [Test]
        public async Task should_return_exception()
        {
            var apiException = new VideoApiException<Microsoft.AspNetCore.Mvc.ProblemDetails>("Internal Server Error", (int)HttpStatusCode.InternalServerError,
                "Stacktrace goes here", null, default(Microsoft.AspNetCore.Mvc.ProblemDetails), null);
            _videoApiClientMock
                .Setup(x => x.PostEventsAsync(It.IsAny<ConferenceEventRequest>()))
                .ThrowsAsync(apiException);

            var result = await _controller.AddMediaEventToConference(Guid.NewGuid(), Builder<AddMediaEventRequest>.CreateNew().Build());
            var typedResult = (ObjectResult)result;
            typedResult.Should().NotBeNull();
        }
    }
}