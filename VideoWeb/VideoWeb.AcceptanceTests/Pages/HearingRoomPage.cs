using OpenQA.Selenium;

namespace VideoWeb.AcceptanceTests.Pages
{
    public static class HearingRoomPage
    {
        public static By PauseButton = By.Id("pauseButton");
        public static By CloseButton = By.Id("closeButton");
        public static By ConfirmClosePopup = By.Id("confirmationDialog");
        public static By ConfirmCloseButton = By.Id("btnConfirmClose");
        public static By ToggleSelfView = By.Id("outgoingFeedButton");
        public static By JudgeIncomingVideo = By.Id("incomingFeedJudge");
        public static By ParticipantIncomingVideo = By.Id("incomingFeed");
        public static By SelfView = By.Id("outgoingFeedVideo");
    }
}
