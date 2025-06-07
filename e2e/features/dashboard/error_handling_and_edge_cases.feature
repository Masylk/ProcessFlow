Feature: Error Handling and Edge Cases
  As a user
  I want the system to handle errors gracefully
  So that I can continue working even when issues occur

  Background:
    Given I am on the dashboard

  # Scenario: Network connectivity issues
  #   When I lose network connectivity
  #   And I try to perform an action
  #   Then I should see an appropriate error message like "Something went wrong. Please try again."
  #   And the action should not complete
  #   When connectivity is restored 
  #   Then I should be able to retry the action 

  # Scenario: API failure handling
  #   When an API call fails during workflow creation
  #   Then I should see an error notification like "Failed to create workflow"
  #   And the modal should remain open
  #   And I should be able to retry the operation

  # Scenario: File upload failures
  #   When a file upload fails due to network issues
  #   And I should be able to retry the upload
  #   When the upload succeeds on retry
  #   Then I should see a success confirmation

  # Scenario: Validation error handling
  #   When I submit a form with invalid data
  #   Then I should see specific validation errors like "Name is required"
  #   And the form should not submit
  #   And invalid fields should be highlighted
  #   When I correct the errors
  #   Then the validation should clear
  #   And I should be able to submit successfully

  # Scenario: Browser refresh handling
  #   When I refresh the page during an operation
  #   Then I should return to a consistent state
  #   And any unsaved changes should be handled appropriately
  #   And I should see appropriate notifications about lost changes like "Changes not saved"

  # Scenario: Modal and overlay error handling
  #   When an error occurs while a modal is open
  #   Then the error should be displayed within the modal context like "An error occurred"
  #   And I should have options to retry or cancel
  #   When multiple modals are triggered simultaneously
  #   Then they should be handled in a logical order
  #   And the UI should remain stable 