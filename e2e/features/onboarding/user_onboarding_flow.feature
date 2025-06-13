Feature: User Onboarding Flow
  As a new user
  I want to complete the onboarding process
  So that I can set up my workspace and start using ProcessFlow

  Background:
    Given I am a newly registered user
    And I am logged in
    And my onboarding is not complete
    And I am on the onboarding page "/onboarding" 