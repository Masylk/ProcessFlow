Feature: Personal Information Step
  As a new user
  I want to provide my personal information
  So that I can proceed with the onboarding

  Background:
    Given I am on the personal information step
    And I see the progress indicator showing step 1 of 3 active

  # Scenario: Successful personal information submission
  #   When I enter first name "Steve"
  #   And I enter last name "Jobs"
  #   And I click the "Continue" button
  #   Then I should proceed to the professional information step
  #   And the progress indicator should show step 1 completed
  #   And the progress indicator should show step 2 active
  #   And my personal information should be saved to localStorage
  #   And an API call should be made to save personal info

  # Scenario: Personal information validation - empty fields
  #   When I leave the first name field empty
  #   And I enter last name "Jobs"
  #   Then the "Continue" button should be disabled
  #   When I enter first name "Steve"
  #   And I leave the last name field empty
  #   Then the "Continue" button should be disabled

  # Scenario: Personal information validation - character limits
  #   When I enter a first name with 41 characters
  #   Then only the first 40 characters should be accepted
  #   When I enter a last name with 41 characters
  #   Then only the first 40 characters should be accepted

  # Scenario: Personal information validation - character sanitization
  #   When I enter first name "Steve<script>alert('xss')</script>"
  #   Then HTML tags should be removed and only "Stevealert('xss')" should remain
  #   When I enter first name "Steve123!@#"
  #   Then special characters should be removed and only "Steve" should remain
  #   When I enter first name "Steve-O'Connor"
  #   Then hyphens and apostrophes should be allowed

  # Scenario: Personal information persistence
  #   Given I have entered first name "Steve"
  #   And I have entered last name "Jobs"
  #   When I refresh the page
  #   Then my entered information should be restored from localStorage
  #   And the form should be pre-filled with my data

  # Scenario: Loading state during submission
  #   When I enter valid personal information
  #   And I click the "Continue" button
  #   Then the button should show "Loading..." text
  #   And the button should be disabled during submission
  #   And I should proceed to the next step even if API call fails 