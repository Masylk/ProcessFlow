Feature: User Authentication
  As a registered user
  I want to log into my account
  So that I can access ProcessFlow

  Background:
    Given I am on the login page
    And I am not authenticated

  # Scenario: Successful login with confirmed email (new user)
  #   Given a new user exists with email "newuser@example.com" and confirmed email
  #   And the user has not completed onboarding
  #   When I enter email "newuser@example.com"
  #   And I enter the correct password
  #   And I click the "Log in" button
  #   Then I should be logged in successfully
  #   And I should be redirected to "/onboarding"
  #   And a session cookie should be set

  # Scenario: Successful login with confirmed email (existing user)
  #   Given an existing user with email "user@example.com" and confirmed email
  #   And the user has completed onboarding
  #   When I enter email "user@example.com"
  #   And I enter the correct password
  #   And I click the "Log in" button
  #   Then I should be logged in successfully
  #   And I should be redirected to the dashboard "/"
  #   And a session cookie should be set

  # Scenario: Login attempt with unconfirmed email
  #   Given a user exists with email "unconfirmed@example.com" and unconfirmed email
  #   When I enter email "unconfirmed@example.com"
  #   And I enter the correct password
  #   And I click the "Log in" button
  #   Then I should see message "Please confirm your email before logging in"
  #   And I should not be logged in

  # Scenario: Login with invalid credentials
  #   When I enter email "user@example.com"
  #   And I enter an incorrect password
  #   And I click the "Log in" button
  #   Then I should see error "Login Failed"
  #   And I should not be logged in
  #   And the failed attempt should be tracked

  # Scenario: Login with invalid email format
  #   When I enter an invalid email "invalid-email"
  #   And I enter any password
  #   And I click the "Log in" button
  #   Then I should see error "Invalid Email"
  #   And the login should not proceed

  # Scenario: Google OAuth login (new user)
  #   When I click "Log in with Google"
  #   Then I should be redirected to Google OAuth
  #   And after successful Google authentication
  #   Then I should be redirected to "/auth/callback"
  #   And I should be logged in automatically
  #   And I should be redirected to "/onboarding"

  # Scenario: Google OAuth login (existing user)
  #   Given an existing user with Google account
  #   And the user has completed onboarding
  #   When I click "Log in with Google"
  #   Then I should be redirected to Google OAuth
  #   And after successful Google authentication
  #   Then I should be redirected to "/auth/callback"
  #   And I should be logged in automatically
  #   And I should be redirected to the dashboard 