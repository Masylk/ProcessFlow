Feature: Completion Step and Workspace Creation
  As a new user
  I want to see my workspace being created
  So that I know the onboarding is completing successfully

  Background:
    Given I have completed all onboarding steps
    And I am on the completion step

  # Scenario: Successful workspace and workflow creation
  #   When I reach the completion step
  #   Then I should see "Setting up your workspace" message
  #   And I should see a loading spinner
  #   And the workspace creation should start automatically
  #   And default workflows should be created
  #   When the workspace creation completes successfully
  #   Then I should see "Your workspace is ready!" message
  #   And I should see a success checkmark
  #   And I should see the introduction video
  #   And the "Continue to Dashboard" button should be enabled

  # Scenario: Default workflow creation warnings
  #   When the workspace is created successfully
  #   But default workflow creation has warnings
  #   Then I should see the workspace as ready
  #   And warnings should be logged but not shown to user
  #   And I should be able to continue to dashboard

  # Scenario: Email scheduling during completion
  #   When the workspace creation completes
  #   Then a welcome email should be scheduled immediately
  #   And a follow-up email should be scheduled for 4 days later
  #   And a feedback request email should be scheduled for 7 days later
  #   And a feature update email should be scheduled for 4 days later
  #   When email scheduling fails
  #   Then the onboarding should still complete successfully
  #   And warnings should be logged

  # Scenario: Continue to dashboard
  #   When the workspace creation is complete
  #   And I click "Continue to Dashboard"
  #   Then all onboarding data should be cleared from localStorage
  #   And my onboarding should be marked as complete on the server
  #   And I should be redirected to the dashboard "/"
  #   And I should not be able to access "/onboarding" anymore

  # Scenario: Browser back button prevention
  #   Given workspace creation has started
  #   When I try to use the browser back button
  #   Then I should remain on the completion step
  #   And navigation should be prevented

  # Scenario: Force completion fallback
  #   Given the server shows onboarding as incomplete
  #   Then the button "Continue to Dashboard" is disabled 