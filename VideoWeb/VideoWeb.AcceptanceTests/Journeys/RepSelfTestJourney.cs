﻿using System.Collections.Generic;
using FluentAssertions;
using VideoWeb.AcceptanceTests.Pages;

namespace VideoWeb.AcceptanceTests.Journeys
{

    public class RepSelfTestJourney : IJourney
    {
        public List<Page> Journey()
        {
            return new List<Page>()
            {
                Page.Login,
                Page.HearingList,
                Page.EquipmentCheck,
                Page.SwitchOnCamAndMic,
                Page.PracticeVideoHearing
            };
        }

        public void VerifyUserIsApplicableToJourney(string currentUserRole)
        {
            currentUserRole.ToLower().Should().BeOneOf("representative");
        }

        public void VerifyDestinationIsInThatJourney(Page destinationPage)
        {
            Journey().Should().Contain(destinationPage);
        }
    }
}
