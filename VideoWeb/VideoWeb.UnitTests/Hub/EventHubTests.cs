﻿using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.Logging;
using Moq;
using NUnit.Framework;
using System;
using System.Threading.Tasks;
using VideoWeb.EventHub.Hub;

namespace VideoWeb.UnitTests.Hub
{
    public class EventHubTests
    {
        private Mock<IUserProfileService> _userProfileServiceMock;
        private Mock<ILogger<EventHub.Hub.EventHub>> _loggerMock;
        private Mock<Hub<IEventHubClient>> _eventHubClientMock;

        [SetUp]
        public void Setup()
        {
            _userProfileServiceMock = new Mock<IUserProfileService>();
            _loggerMock = new Mock<ILogger<EventHub.Hub.EventHub>>();
            _eventHubClientMock = new Mock<Hub<IEventHubClient>>();
        }

        [Test]
        public async Task should_log_a_message_on_connected()
        {
            var _clients = new Mock<IHubCallerClients<IEventHubClient>>();
            var _principal = new Mock<System.Security.Claims.ClaimsPrincipal>();
            var _context = new Mock<HubCallerContext>();
            _context.Setup(x => x.User).Returns(_principal.Object);
            _context.Setup(x => x.ConnectionId).Returns(Guid.NewGuid().ToString());
            _context.Setup(x => x.UserIdentifier).Returns("test.name@email.com");
            var _identity = new Mock<System.Security.Principal.IIdentity>();
            _identity.Setup(x => x.Name).Returns("FirstName LastName");
            _principal.Setup(x => x.Identity).Returns(_identity.Object);
            var _group = new Mock<IGroupManager>();
            var eventHubClient = new EventHub.Hub.EventHub(_userProfileServiceMock.Object, _loggerMock.Object);
            eventHubClient.Context = _context.Object;
            eventHubClient.Groups = _group.Object;
            eventHubClient.Clients = _clients.Object;
            await eventHubClient.OnConnectedAsync();
            _group.Verify(x => x.AddToGroupAsync(_context.Object.ConnectionId, _context.Object.UserIdentifier, System.Threading.CancellationToken.None), Times.Once());
        }

        [Test]
        public async Task should_log_a_message_on_disconnected()
        {
            var _clients = new Mock<IHubCallerClients<IEventHubClient>>();
            var _principal = new Mock<System.Security.Claims.ClaimsPrincipal>();
            var _context = new Mock<HubCallerContext>();
            _context.Setup(x => x.User).Returns(_principal.Object);
            _context.Setup(x => x.ConnectionId).Returns(Guid.NewGuid().ToString());
            _context.Setup(x => x.UserIdentifier).Returns("test.name@email.com");
            var _identity = new Mock<System.Security.Principal.IIdentity>();
            _identity.Setup(x => x.Name).Returns("FirstName LastName");
            _principal.Setup(x => x.Identity).Returns(_identity.Object);
            var _group = new Mock<IGroupManager>();
            var eventHubClient = new EventHub.Hub.EventHub(_userProfileServiceMock.Object, _loggerMock.Object);
            eventHubClient.Context = _context.Object;
            eventHubClient.Groups = _group.Object;
            eventHubClient.Clients = _clients.Object;
            var exception = new Exception();
            await eventHubClient.OnDisconnectedAsync(exception);
            _group.Verify(x => x.RemoveFromGroupAsync(_context.Object.ConnectionId, _context.Object.UserIdentifier, System.Threading.CancellationToken.None), Times.Once());
        }
    }


}
