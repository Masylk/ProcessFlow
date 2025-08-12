Feature: Error Handling and Edge Cases
  As a user
  I want the system to handle errors gracefully
  So that I can continue using the workflow even when issues occur

  Background:
    Given I am in read mode

  # Scenario: Network connectivity issues
  #   When I lose network connectivity
  #   And I try to navigate to a new step
  #   Then I should see an appropriate error message
  #   And the interface should remain functional for local actions
  #   When connectivity is restored
  #   Then I should be able to continue normally

  # Scenario: Missing or broken media
  #   Given I have a step with an image that fails to load
  #   When I view that step
  #   Then I should see a placeholder or error state
  #   And the step should still be functional
  #   And other content should display normally

  # Scenario: Invalid workflow access
  #   When I try to access a workflow that doesn't exist
  #   Then I should see a 404 error page
  #   When I try to access a private workflow without permission
  #   Then I should be redirected to login 