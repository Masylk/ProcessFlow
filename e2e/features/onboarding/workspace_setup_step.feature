Feature: Workspace Setup Step
  As a new user
  I want to set up my workspace
  So that I can start organizing my workflows

  Background:
    Given I am on the workspace setup step
    And I see the progress indicator showing step 3 of 3 active

  # Scenario: Successful workspace setup with auto-generated URL
  #   When I enter workspace name "My Company"
  #   And the workspace URL is auto-generated as "my-company"
  #   And the slug availability check shows "Available"
  #   Then the "Continue" button should be enabled
  #   When I click the "Continue" button
  #   Then I should proceed to the completion step
  #   And my workspace should be created with the generated slug

  # Scenario: Workspace name validation - required field
  #   When I leave the workspace name field empty
  #   Then the "Continue" button should be disabled
  #   And A tooltip must indicate that the field workspace name is required
  #   When I enter workspace name "My Company"
  #   Then the "Continue" button should be enabled

  # Scenario: Workspace name validation - character limits
  #   When I enter a workspace name with 51 characters
  #   Then only the first 50 characters should be accepted
  #   And the input should be automatically truncated

  # Scenario: Workspace name validation - allowed characters
  #   When I enter workspace name "Valid Name-123"
  #   Then the name should be accepted
  #   When I enter workspace name "Invalid!Name@#$"
  #   Then special characters should be removed automatically
  #   And only "InvalidName" should remain

  # Scenario: Workspace URL slug generation and validation
  #   When I enter workspace name "My Awesome Company"
  #   Then the workspace URL should be auto-generated as "my-awesome-company"
  #   When I enter workspace name "Company!@# 123"
  #   Then the workspace URL should be auto-generated as "company-123"

  # Scenario: Workspace URL availability checking
  #   When I enter a workspace name
  #   Then a slug availability check should be performed after 500ms delay
  #   And I should see "Checking availability..." message
  #   When the slug is available
  #   Then I should see "Available" message in green
  #   When the slug is already taken
  #   Then I should see "This URL is already taken" message in red
  #   And the "Continue" button should be disabled

  # Scenario: Workspace URL manual editing (disabled)
  #   When I try to manually edit the workspace URL field
  #   Then the field should be disabled
  #   And I should not be able to modify it directly

  # Scenario: Workspace logo upload - valid file types
  #   When I upload a PNG file smaller than 5MB
  #   Then the logo should be accepted and displayed
  #   When I upload a JPEG file smaller than 5MB
  #   Then the logo should be accepted and displayed
  #   When I upload an SVG file smaller than 5MB
  #   Then the logo should be accepted and displayed
  #   When I upload a GIF file smaller than 5MB
  #   Then the logo should be accepted and displayed
  #   When I upload an AVIF file smaller than 5MB
  #   Then the logo should be accepted and displayed

  # Scenario: Workspace logo upload - invalid file types
  #   When I upload a PDF file
  #   Then I should see error "Invalid file type. Please upload a PNG, JPG, GIF, or SVG image."
  #   When I upload a TXT file
  #   Then I should see error "Invalid file type. Please upload a PNG, JPG, GIF, or SVG image."

  # Scenario: Workspace logo upload - file size validation
  #   When I upload an image file larger than 5MB
  #   Then I should see error "File is too large. Maximum size is 5MB."
  #   And the file should not be accepted

  # Scenario: Workspace logo upload - drag and drop
  #   When I drag a valid image file over the upload area
  #   Then the upload area should show visual feedback
  #   When I drop a valid image file on the upload area
  #   Then the logo should be uploaded and displayed
  #   When I drop an invalid file on the upload area
  #   Then I should see appropriate error message

  # Scenario: Navigation back to professional information
  #   When I click the "Back" button
  #   Then I should return to the professional information step
  #   And my workspace setup data should be preserved

  # Scenario: Form validation before submission
  #   When I have a valid workspace name
  #   And the slug is available
  #   Then the "Continue" button should be enabled
  #   When I have an invalid workspace name
  #   Then the "Continue" button should be disabled
  #   When the slug is not available
  #   Then the "Continue" button should be disabled
  #   When the slug availability is still being checked
  #   Then the "Continue" button should be disabled

  # Scenario: Workspace setup persistence
  #   Given I have entered workspace information
  #   When I navigate away and return to this step
  #   Then my workspace setup data should be restored from localStorage
  #   And the logo preview should be displayed if uploaded 