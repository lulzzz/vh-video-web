// ------------------------------------------------------------------------------
//  <auto-generated>
//      This code was generated by SpecFlow (http://www.specflow.org/).
//      SpecFlow Version:3.0.0.0
//      SpecFlow Generator Version:3.0.0.0
// 
//      Changes to this file may cause incorrect behavior and will be lost if
//      the code is regenerated.
//  </auto-generated>
// ------------------------------------------------------------------------------
#region Designer generated code
#pragma warning disable
namespace VideoWeb.AcceptanceTests.Features
{
    using TechTalk.SpecFlow;
    
    
    [System.CodeDom.Compiler.GeneratedCodeAttribute("TechTalk.SpecFlow", "3.0.0.0")]
    [System.Runtime.CompilerServices.CompilerGeneratedAttribute()]
    [NUnit.Framework.TestFixtureAttribute()]
    [NUnit.Framework.DescriptionAttribute("Waiting Room")]
    [NUnit.Framework.CategoryAttribute("VIH-4127")]
    [NUnit.Framework.CategoryAttribute("VIH-4131")]
    [NUnit.Framework.CategoryAttribute("VIH-4233")]
    public partial class WaitingRoomFeature
    {
        
        private TechTalk.SpecFlow.ITestRunner testRunner;
        
#line 1 "WaitingRoom.feature"
#line hidden
        
        [NUnit.Framework.OneTimeSetUpAttribute()]
        public virtual void FeatureSetup()
        {
            testRunner = TechTalk.SpecFlow.TestRunnerManager.GetTestRunner();
            TechTalk.SpecFlow.FeatureInfo featureInfo = new TechTalk.SpecFlow.FeatureInfo(new System.Globalization.CultureInfo("en-US"), "Waiting Room", "\tAs a registered video hearings user\r\n\tI need to access a waiting room prior to m" +
                    "y hearing\r\n\tSo that I am ready for the video hearing to begin", ProgrammingLanguage.CSharp, new string[] {
                        "VIH-4127",
                        "VIH-4131",
                        "VIH-4233"});
            testRunner.OnFeatureStart(featureInfo);
        }
        
        [NUnit.Framework.OneTimeTearDownAttribute()]
        public virtual void FeatureTearDown()
        {
            testRunner.OnFeatureEnd();
            testRunner = null;
        }
        
        [NUnit.Framework.SetUpAttribute()]
        public virtual void TestInitialize()
        {
        }
        
        [NUnit.Framework.TearDownAttribute()]
        public virtual void ScenarioTearDown()
        {
            testRunner.OnScenarioEnd();
        }
        
        public virtual void ScenarioInitialize(TechTalk.SpecFlow.ScenarioInfo scenarioInfo)
        {
            testRunner.OnScenarioInitialize(scenarioInfo);
            testRunner.ScenarioContext.ScenarioContainer.RegisterInstanceAs<NUnit.Framework.TestContext>(NUnit.Framework.TestContext.CurrentContext);
        }
        
        public virtual void ScenarioStart()
        {
            testRunner.OnScenarioStart();
        }
        
        public virtual void ScenarioCleanup()
        {
            testRunner.CollectScenarioErrors();
        }
        
        [NUnit.Framework.TestAttribute()]
        [NUnit.Framework.DescriptionAttribute("Individual waiting room")]
        [NUnit.Framework.CategoryAttribute("smoketest")]
        [NUnit.Framework.CategoryAttribute("VIH-4233")]
        public virtual void IndividualWaitingRoom()
        {
            TechTalk.SpecFlow.ScenarioInfo scenarioInfo = new TechTalk.SpecFlow.ScenarioInfo("Individual waiting room", null, new string[] {
                        "smoketest",
                        "VIH-4233"});
#line 8
this.ScenarioInitialize(scenarioInfo);
            this.ScenarioStart();
#line 9
 testRunner.Given("the Individual user has progressed to the Waiting Room page with a hearing in 7 m" +
                    "inutes time", ((string)(null)), ((TechTalk.SpecFlow.Table)(null)), "Given ");
#line 10
 testRunner.Then("the user is on the Waiting Room page", ((string)(null)), ((TechTalk.SpecFlow.Table)(null)), "Then ");
#line 11
 testRunner.And("the user can see information about their case", ((string)(null)), ((TechTalk.SpecFlow.Table)(null)), "And ");
#line 12
 testRunner.And("the user can see the hearing is about to begin title", ((string)(null)), ((TechTalk.SpecFlow.Table)(null)), "And ");
#line 13
 testRunner.And("the user can see a black box and an about to begin message", ((string)(null)), ((TechTalk.SpecFlow.Table)(null)), "And ");
#line hidden
            this.ScenarioCleanup();
        }
        
        [NUnit.Framework.TestAttribute()]
        [NUnit.Framework.DescriptionAttribute("Representative waiting room")]
        [NUnit.Framework.CategoryAttribute("VIH-4233")]
        public virtual void RepresentativeWaitingRoom()
        {
            TechTalk.SpecFlow.ScenarioInfo scenarioInfo = new TechTalk.SpecFlow.ScenarioInfo("Representative waiting room", null, new string[] {
                        "VIH-4233"});
#line 16
this.ScenarioInitialize(scenarioInfo);
            this.ScenarioStart();
#line 17
 testRunner.Given("the Representative user has progressed to the Waiting Room page", ((string)(null)), ((TechTalk.SpecFlow.Table)(null)), "Given ");
#line 18
 testRunner.Then("the user is on the Waiting Room page", ((string)(null)), ((TechTalk.SpecFlow.Table)(null)), "Then ");
#line 19
 testRunner.And("the user can see information about their case", ((string)(null)), ((TechTalk.SpecFlow.Table)(null)), "And ");
#line 20
 testRunner.And("the user can see the hearing is about to begin title", ((string)(null)), ((TechTalk.SpecFlow.Table)(null)), "And ");
#line 21
 testRunner.And("the user can see a black box and an about to begin message", ((string)(null)), ((TechTalk.SpecFlow.Table)(null)), "And ");
#line hidden
            this.ScenarioCleanup();
        }
        
        [NUnit.Framework.TestAttribute()]
        [NUnit.Framework.DescriptionAttribute("Judge waiting room")]
        [NUnit.Framework.CategoryAttribute("smoketest")]
        public virtual void JudgeWaitingRoom()
        {
            TechTalk.SpecFlow.ScenarioInfo scenarioInfo = new TechTalk.SpecFlow.ScenarioInfo("Judge waiting room", null, new string[] {
                        "smoketest"});
#line 24
this.ScenarioInitialize(scenarioInfo);
            this.ScenarioStart();
#line 25
 testRunner.Given("the Judge user has progressed to the Waiting Room page", ((string)(null)), ((TechTalk.SpecFlow.Table)(null)), "Given ");
#line 26
 testRunner.Then("the user is on the Waiting Room page", ((string)(null)), ((TechTalk.SpecFlow.Table)(null)), "Then ");
#line 27
 testRunner.And("the user can see information about their case", ((string)(null)), ((TechTalk.SpecFlow.Table)(null)), "And ");
#line 28
 testRunner.And("the user can see other participants status", ((string)(null)), ((TechTalk.SpecFlow.Table)(null)), "And ");
#line hidden
            this.ScenarioCleanup();
        }
        
        [NUnit.Framework.TestAttribute()]
        [NUnit.Framework.DescriptionAttribute("Individual hearing is delayed")]
        [NUnit.Framework.CategoryAttribute("VIH-4233")]
        public virtual void IndividualHearingIsDelayed()
        {
            TechTalk.SpecFlow.ScenarioInfo scenarioInfo = new TechTalk.SpecFlow.ScenarioInfo("Individual hearing is delayed", null, new string[] {
                        "VIH-4233"});
#line 31
this.ScenarioInitialize(scenarioInfo);
            this.ScenarioStart();
#line 32
 testRunner.Given("the Individual user has progressed to the Waiting Room page with a hearing in -10" +
                    " minutes time", ((string)(null)), ((TechTalk.SpecFlow.Table)(null)), "Given ");
#line 33
 testRunner.Then("the user is on the Waiting Room page", ((string)(null)), ((TechTalk.SpecFlow.Table)(null)), "Then ");
#line 34
 testRunner.And("the user can see the hearing is delayed title", ((string)(null)), ((TechTalk.SpecFlow.Table)(null)), "And ");
#line 35
 testRunner.And("the user can see a yellow box and a delayed message", ((string)(null)), ((TechTalk.SpecFlow.Table)(null)), "And ");
#line hidden
            this.ScenarioCleanup();
        }
        
        [NUnit.Framework.TestAttribute()]
        [NUnit.Framework.DescriptionAttribute("Individual is in the waiting room early")]
        [NUnit.Framework.CategoryAttribute("VIH-4233")]
        public virtual void IndividualIsInTheWaitingRoomEarly()
        {
            TechTalk.SpecFlow.ScenarioInfo scenarioInfo = new TechTalk.SpecFlow.ScenarioInfo("Individual is in the waiting room early", null, new string[] {
                        "VIH-4233"});
#line 38
this.ScenarioInitialize(scenarioInfo);
            this.ScenarioStart();
#line 39
 testRunner.Given("the Individual user has progressed to the Waiting Room page with a hearing in 10 " +
                    "minutes time", ((string)(null)), ((TechTalk.SpecFlow.Table)(null)), "Given ");
#line 40
 testRunner.Then("the user is on the Waiting Room page", ((string)(null)), ((TechTalk.SpecFlow.Table)(null)), "Then ");
#line 41
 testRunner.And("the user can see the hearing is scheduled title", ((string)(null)), ((TechTalk.SpecFlow.Table)(null)), "And ");
#line 42
 testRunner.And("the user can see a blue box and a scheduled message", ((string)(null)), ((TechTalk.SpecFlow.Table)(null)), "And ");
#line hidden
            this.ScenarioCleanup();
        }
        
        [NUnit.Framework.TestAttribute()]
        [NUnit.Framework.DescriptionAttribute("Representative hearing is delayed")]
        [NUnit.Framework.CategoryAttribute("VIH-4233")]
        public virtual void RepresentativeHearingIsDelayed()
        {
            TechTalk.SpecFlow.ScenarioInfo scenarioInfo = new TechTalk.SpecFlow.ScenarioInfo("Representative hearing is delayed", null, new string[] {
                        "VIH-4233"});
#line 45
this.ScenarioInitialize(scenarioInfo);
            this.ScenarioStart();
#line 46
 testRunner.Given("the Representative user has progressed to the Waiting Room page with a hearing in" +
                    " -10 minutes time", ((string)(null)), ((TechTalk.SpecFlow.Table)(null)), "Given ");
#line 47
 testRunner.Then("the user is on the Waiting Room page", ((string)(null)), ((TechTalk.SpecFlow.Table)(null)), "Then ");
#line 48
 testRunner.And("the user can see the hearing is delayed title", ((string)(null)), ((TechTalk.SpecFlow.Table)(null)), "And ");
#line 49
 testRunner.And("the user can see a yellow box and a delayed message", ((string)(null)), ((TechTalk.SpecFlow.Table)(null)), "And ");
#line hidden
            this.ScenarioCleanup();
        }
        
        [NUnit.Framework.TestAttribute()]
        [NUnit.Framework.DescriptionAttribute("Representative is in the waiting room early")]
        [NUnit.Framework.CategoryAttribute("VIH-4233")]
        public virtual void RepresentativeIsInTheWaitingRoomEarly()
        {
            TechTalk.SpecFlow.ScenarioInfo scenarioInfo = new TechTalk.SpecFlow.ScenarioInfo("Representative is in the waiting room early", null, new string[] {
                        "VIH-4233"});
#line 52
this.ScenarioInitialize(scenarioInfo);
            this.ScenarioStart();
#line 53
 testRunner.Given("the Representative user has progressed to the Waiting Room page with a hearing in" +
                    " 10 minutes time", ((string)(null)), ((TechTalk.SpecFlow.Table)(null)), "Given ");
#line 54
 testRunner.Then("the user is on the Waiting Room page", ((string)(null)), ((TechTalk.SpecFlow.Table)(null)), "Then ");
#line 55
 testRunner.And("the user can see the hearing is scheduled title", ((string)(null)), ((TechTalk.SpecFlow.Table)(null)), "And ");
#line 56
 testRunner.And("the user can see a blue box and a scheduled message", ((string)(null)), ((TechTalk.SpecFlow.Table)(null)), "And ");
#line hidden
            this.ScenarioCleanup();
        }
    }
}
#pragma warning restore
#endregion
