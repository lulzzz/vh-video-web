﻿using OpenQA.Selenium;

namespace VideoWeb.AcceptanceTests.Pages
{
    public class PracticeVideoHearingPage
    {
        private const string PopupHeaderText = "Choose your camera and microphone";
        public By IncomingVideo = By.Id("incomingStream");
        public By SelfVideo = By.Id("outgoingStream");
        public By SoundMeter = By.Id("meter");
        public By TestScore = By.XPath("//p[contains(text(),'Test Score:')]/strong");
        public By WarningMessage => CommonLocators.WarningMessageAfterRadioButton("No");
        public By ReplayButton => CommonLocators.ButtonWithLabel("Re-play the video message");
        public By ChangeMicPopup => CommonLocators.ElementContainingText(PopupHeaderText);
        public By MicsList = By.Id("available-mics-list");
        public By ChangeButton => CommonLocators.ButtonWithLabel("Change");
        public By PreferredCameraVideo = By.Id("preferredCameraStream");
    }
}
