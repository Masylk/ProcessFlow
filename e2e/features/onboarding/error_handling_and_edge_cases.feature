Feature: Error Handling and Edge Cases
  As a user going through onboarding
  I want graceful error handling
  So that I can complete onboarding even when issues occur

  # Scenario: API failure resilience
  #   When an API call fails during step submission
  #   Then I should be blocked from proceeding to the next step
  #   And the UI should provide an error message "Something went wrong. Please try again."

  # Scenario: Network connectivity issues
  #   When I lose network connectivity during onboarding
  #   Then my form data should be preserved locally
  #   And I should be able to continue when connectivity returns
  #   And slug availability checks should handle timeouts gracefully

  # Scenario: Workspace creation timeout handling
  #   When workspace creation takes longer than expected
  #   Then I should see appropriate loading messages
  #   And the process should not timeout prematurely
  #   And I should have options to retry or continue

  # Scenario: Duplicate workspace name handling
  #   When I enter a workspace name that already exists
  #   Then the system should automatically suggest alternatives
  #   And I should be able to proceed with the modified name
  #   And the slug conflict should be resolved automatically

  # Scenario: File upload error recovery
  #   When logo upload fails due to network issues
  #   Then I should see the error message "Something went wrong. Please try again."
  #   And I should be able to retry the upload
  #   And I should be able to continue without a logo

  # Scenario: Concurrent user scenarios
  #   When multiple users try to create workspaces simultaneously
  #   Then each should get unique slugs
  #   And no conflicts should occur
  #   And all users should complete successfully 