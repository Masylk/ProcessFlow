Feature: User Profile Management
  As a user
  I want to manage my profile and account settings
  So that I can keep my information current and secure

  Background:
    Given I am logged in to the dashboard
    And I can access user settings

  # Scenario: Accessing user settings
  #   When I click on my user profile in the header bar on the right
  #   Then I should see a user dropdown menu
  #   When I select "Account settings"
  #   Then I should see the user settings page

  # Scenario: Updating profile information
  #   When I am in user settings
  #   And I change my first name to "John"
  #   And I change my last name to "Doe"
  #   And I click "Save changes"
  #   Then my profile should be updated
  #   And I should see a success notification
  #   And the changes should be reflected in the UI

  # Scenario: Profile information validation
  #   When I am editing my profile
  #   And I enter a first name with 41 characters
  #   Then only the first 40 characters should be accepted
  #   When I enter special characters in my name
  #   Then the input should be sanitized appropriately

  # Scenario: Changing email address
  #   When I am in user settings
  #   And I enter a new email address
  #   And I click "Change email"
  #   Then I should see a confirmation dialog
  #   When I confirm the change
  #   Then a verification email should be sent
  #   And I should see instructions to verify the new email

  # Scenario: Email validation
  #   When I enter an invalid email format
  #   Then I should see an error message
  #   And the save button should be disabled
  #   When I enter a valid email format
  #   Then the error should clear
  #   And the save button should be enabled

  # Scenario: Changing password
  #   When I am in user settings
  #   And I click "Change password"
  #   Then I should see a password change form
  #   When I enter my current password
  #   And I enter a new password
  #   And I confirm the new password
  #   And I click "Update password"
  #   Then I should see a confirmation dialog
  #   When I confirm the password change
  #   Then my password should be updated
  #   And I should be logged out of other devices

  # Scenario: Password validation
  #   When I am changing my password
  #   And I enter a password shorter than 8 characters
  #   Then I should see a validation error
  #   When I enter a password without uppercase letters
  #   Then I should see a validation error
  #   When I enter a password without lowercase letters
  #   Then I should see a validation error
  #   When I enter a password without numbers
  #   Then I should see a validation error
  #   When I enter a password without special characters
  #   Then I should see a validation error
  #   When I enter mismatched password confirmations
  #   Then I should see a validation error
  #   When I enter a valid password "StrongPass123!"
  #   And I confirm the same password "StrongPass123!"
  #   Then the validation should clear
  #   And the save button should be enabled

  # Scenario: Account deletion
  #   When I am in user settings
  #   And I click "Delete account"
  #   Then I should see a confirmation dialog
  #   And I should be required to enter my password
  #   When I enter my password and confirm deletion
  #   Then my account should be deleted
  #   And I should be redirected to the home page 