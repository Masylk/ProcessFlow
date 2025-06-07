Feature: User Registration
  As a new user
  I want to create an account
  So that I can access ProcessFlow

  Background:
    Given I am on the signup page
    And I am not authenticated

  # Scenario: Successful email/password registration
  #   When I enter a valid email "user@example.com"
  #   And I enter a strong password "StrongPass123!"
  #   And I click the "Sign up" button
  #   Then I should see a success message
  #   And I should be redirected to login page with pre-filled email
  #   And a confirmation email should be sent to "user@example.com"

  # Scenario: Registration with weak password
  #   When I enter a valid email "user@example.com"
  #   And I enter a weak password "123"
  #   And I click the "Sign up" button
  #   Then I should see error "Password must be at least 8 characters and include uppercase, lowercase, number, and special character."
  #   And the signup should not proceed

  # Scenario: Registration with invalid email
  #   When I enter an invalid email "invalid-email"
  #   And I enter a strong password "StrongPass123!"
  #   And I click the "Sign up" button
  #   Then I should see error "Please enter a valid email address."
  #   And the signup should not proceed

  # Scenario: Registration with existing email
  #   Given a user already exists with email "existing@example.com"
  #   When I enter email "existing@example.com"
  #   Then the system should perform an immediate email availability check
  #   And no visual feedback should be shown about email existence
  #   When I enter a strong password "StrongPass123!"
  #   And I click the "Sign up" button
  #   Then the system should perform a final email existence check
  #   And I should see message "If your signup was successful, check your email."
  #   And no new account should be created
  #   And no confirmation email should be sent
  #   And I should be redirected to login page with pre-filled email

  # Scenario: Google OAuth registration
  #   When I click "Sign up with Google"
  #   Then I should be redirected to Google OAuth
  #   And after successful Google authentication
  #   Then I should be redirected to "/auth/callback"
  #   And a new user account should be created
  #   And I should be redirected to the onboarding page 