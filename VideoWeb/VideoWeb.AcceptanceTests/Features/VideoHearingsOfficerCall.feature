﻿Feature: Video Hearings Officer Call
	In order for a participant to talk to a VHO
	As a VHO
	I want to be able to call a participant

@VIH-4611 @VIH-4613 @VIH-4730 @Video @Chrome
Scenario: Video Hearings Officer Call
	Given the Individual01 user has progressed to the Waiting Room page with a hearing in 30 minutes time
	And the Video Hearings Officer user has progressed to the VHO Hearing List page for the existing hearing
	When the Video Hearings Officer starts a call with Individual01
	And Individual01 accepts the VHO call
	Then the Video Hearings Officer can see and hear the other user
	And the admin self view can be open and closed
	Then the Individual01 can see and hear the other user
	When the Video Hearings Officer ends the call
	Then the user is on the Hearing List page

@VIH-4613
Scenario: No Answer on a Video Hearings Officer Call
	Given the Individual01 user has progressed to the Waiting Room page with a hearing in 30 minutes time
	And the Video Hearings Officer user has progressed to the VHO Hearing List page for the existing hearing
	When the Video Hearings Officer starts a call with Individual01
	And the user does not answer after 2 minutes
	Then the Individual01 user can no longer see the alert