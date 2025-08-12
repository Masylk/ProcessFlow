Feature: Professional Information Step
  As a new user
  I want to provide my professional information
  So that ProcessFlow can be customized to my needs

  Background:
    Given I am on the professional information step
    And I see the progress indicator showing step 2 of 3 active

  # Scenario: Successful professional information submission
  #   When I select industry "IT"
  #   And I select role "Founder"
  #   And I select company size "10-49"
  #   And I select source "ProductHunt"
  #   And I click the "Continue" button
  #   Then I should proceed to the workspace setup step
  #   And the progress indicator should show step 2 completed
  #   And the progress indicator should show step 3 active
  #   And my professional information should be saved to localStorage

  # Scenario: Professional information validation - all fields required
  #   When I select industry "IT"
  #   And I select role "Founder"
  #   And I select company size "10-49"
  #   And I leave source unselected
  #   And I click the "Continue" button
  #   Then I should see error "Please fill in all fields"
  #   And I should remain on the professional information step

  # Scenario: Professional information dropdown options validation
  #   When I view the industry dropdown
  #   Then I should see options: "IT", "Healthcare", "Finance", "Education", "Retail", "Other"
  #   When I view the role dropdown
  #   Then I should see options: "Founder", "Manager", "Product Manager", "Analyst", "Designer", "Sales", "Marketing", "HR", "Customer Success", "Freelancer", "Other"
  #   When I view the company size dropdown
  #   Then I should see options: "1", "2-9", "10-49", "50-199", "200-499", "500+"
  #   When I view the source dropdown
  #   Then I should see options: "ProductHunt", "LinkedIn", "Google", "Friend", "Other"

  # Scenario: Navigation back to personal information
  #   When I click the "Back" button
  #   Then I should return to the personal information step
  #   And the progress indicator should show step 1 active
  #   And my previously entered personal information should be preserved

  # Scenario: Professional information persistence
  #   Given I have selected all professional information fields
  #   When I navigate to the next step and then back
  #   Then my professional information should be restored from localStorage
  #   And all dropdowns should show my previous selections

  # Scenario: Loading state during submission
  #   When I enter valid professional information
  #   And I click the "Continue" button
  #   Then the button should show "Loading..." text
  #   And the button should be disabled during submission
  #   And I should proceed to the next step even if API call fails 