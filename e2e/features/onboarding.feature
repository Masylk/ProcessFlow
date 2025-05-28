# ProcessFlow Onboarding BDD Test

## Feature: User Onboarding Flow

Feature: User Onboarding Flow
              As a new user
              I want to complete the onboarding process
  So that I can set up my workspace and start using ProcessFlow

        Background:
            Given I am a newly registered user
              And I am logged in
              And my onboarding is not complete
              And I am on the onboarding page "/onboarding"

## Feature: Personal Information Step

```gherkin
Feature: Personal Information Step
              As a new user
              I want to provide my personal information
  So that I can proceed with the onboarding

        Background:
            Given I am on the personal information step
              And I see the progress indicator showing step 1 of 3 active

        Scenario: Successful personal information submission
             When I enter first name "Steve"
              And I enter last name "Jobs"
              And I click the "Continue" button
             Then I should proceed to the professional information step
              And the progress indicator should show step 1 completed
              And the progress indicator should show step 2 active
              And my personal information should be saved to localStorage
              And an API call should be made to save personal info

        Scenario: Personal information validation - empty fields
             When I leave the first name field empty
              And I enter last name "Jobs"
             Then the "Continue" button should be disabled
             When I enter first name "Steve"
              And I leave the last name field empty
             Then the "Continue" button should be disabled

        Scenario: Personal information validation - character limits
             When I enter a first name with 41 characters
             Then only the first 40 characters should be accepted
             When I enter a last name with 41 characters
             Then only the first 40 characters should be accepted

        Scenario: Personal information validation - character sanitization
             When I enter first name "Steve<script>alert('xss')</script>"
             Then HTML tags should be removed and only "Stevealert('xss')" should remain
             When I enter first name "Steve123!@#"
             Then special characters should be removed and only "Steve" should remain
             When I enter first name "Steve-O'Connor"
             Then hyphens and apostrophes should be allowed

        Scenario: Personal information persistence
            Given I have entered first name "Steve"
              And I have entered last name "Jobs"
             When I refresh the page
             Then my entered information should be restored from localStorage
              And the form should be pre-filled with my data

        Scenario: Loading state during submission
             When I enter valid personal information
              And I click the "Continue" button
             Then the button should show "Loading..." text
              And the button should be disabled during submission
              And I should proceed to the next step even if API call fails
```

## Feature: Professional Information Step

```gherkin
Feature: Professional Information Step
              As a new user
              I want to provide my professional information
  So that ProcessFlow can be customized to my needs

        Background:
            Given I am on the professional information step
              And I see the progress indicator showing step 2 of 3 active

        Scenario: Successful professional information submission
             When I select industry "IT"
              And I select role "Founder"
              And I select company size "10-49"
              And I select source "ProductHunt"
              And I click the "Continue" button
             Then I should proceed to the workspace setup step
              And the progress indicator should show step 2 completed
              And the progress indicator should show step 3 active
              And my professional information should be saved to localStorage

        Scenario: Professional information validation - all fields required
             When I select industry "IT"
              And I select role "Founder"
              And I select company size "10-49"
              And I leave source unselected
              And I click the "Continue" button
             Then I should see error "Please fill in all fields"
              And I should remain on the professional information step

        Scenario: Professional information dropdown options validation
             When I view the industry dropdown
             Then I should see options: "IT", "Healthcare", "Finance", "Education", "Retail", "Other"
             When I view the role dropdown
             Then I should see options: "Founder", "Manager", "Product Manager", "Analyst", "Designer", "Sales", "Marketing", "HR", "Customer Success", "Freelancer", "Other"
             When I view the company size dropdown
             Then I should see options: "1", "2-9", "10-49", "50-199", "200-499", "500+"
             When I view the source dropdown
             Then I should see options: "ProductHunt", "LinkedIn", "Google", "Friend", "Other"

        Scenario: Navigation back to personal information
             When I click the "Back" button
             Then I should return to the personal information step
              And the progress indicator should show step 1 active
              And my previously entered personal information should be preserved

        Scenario: Professional information persistence
            Given I have selected all professional information fields
             When I navigate to the next step and then back
             Then my professional information should be restored from localStorage
              And all dropdowns should show my previous selections

        Scenario: Loading state during submission
             When I enter valid professional information
              And I click the "Continue" button
             Then the button should show "Loading..." text
              And the button should be disabled during submission
              And I should proceed to the next step even if API call fails
```

## Feature: Workspace Setup Step

```gherkin
Feature: Workspace Setup Step
              As a new user
              I want to set up my workspace
  So that I can start organizing my workflows

        Background:
            Given I am on the workspace setup step
              And I see the progress indicator showing step 3 of 3 active

        Scenario: Successful workspace setup with auto-generated URL
             When I enter workspace name "My Company"
              And the workspace URL is auto-generated as "my-company"
              And the slug availability check shows "Available"
             Then the "Continue" button should be enabled
             When I click the "Continue" button
             Then I should proceed to the completion step
              And my workspace should be created with the generated slug

        Scenario: Workspace name validation - required field
             When I leave the workspace name field empty
             Then the "Continue" button should be disabled
             And A tooltip must indicate that the field workspace name is required
             When I enter workspace name "My Company"
             Then the "Continue" button should be enabled

        Scenario: Workspace name validation - character limits
             When I enter a workspace name with 51 characters
             Then only the first 50 characters should be accepted
              And the input should be automatically truncated

        Scenario: Workspace name validation - allowed characters
             When I enter workspace name "Valid Name-123"
             Then the name should be accepted
             When I enter workspace name "Invalid!Name@#$"
             Then special characters should be removed automatically
              And only "InvalidName" should remain

        Scenario: Workspace URL slug generation and validation
             When I enter workspace name "My Awesome Company"
             Then the workspace URL should be auto-generated as "my-awesome-company"
             When I enter workspace name "Company!@# 123"
             Then the workspace URL should be auto-generated as "company-123"

        Scenario: Workspace URL availability checking
             When I enter a workspace name
             Then a slug availability check should be performed after 500ms delay
              And I should see "Checking availability..." message
             When the slug is available
             Then I should see "Available" message in green
             When the slug is already taken
             Then I should see "This URL is already taken" message in red
              And the "Continue" button should be disabled

        Scenario: Workspace URL manual editing (disabled)
             When I try to manually edit the workspace URL field
             Then the field should be disabled
              And I should not be able to modify it directly

        Scenario: Workspace logo upload - valid file types
             When I upload a PNG file smaller than 5MB
             Then the logo should be accepted and displayed
             When I upload a JPEG file smaller than 5MB
             Then the logo should be accepted and displayed
             When I upload an SVG file smaller than 5MB
             Then the logo should be accepted and displayed
             When I upload a GIF file smaller than 5MB
             Then the logo should be accepted and displayed
             When I upload an AVIF file smaller than 5MB
             Then the logo should be accepted and displayed

        Scenario: Workspace logo upload - invalid file types
             When I upload a PDF file
             Then I should see error "Invalid file type. Please upload a PNG, JPG, GIF, or SVG image."
             When I upload a TXT file
             Then I should see error "Invalid file type. Please upload a PNG, JPG, GIF, or SVG image."

        Scenario: Workspace logo upload - file size validation
             When I upload an image file larger than 5MB
             Then I should see error "File is too large. Maximum size is 5MB."
              And the file should not be accepted

        Scenario: Workspace logo upload - drag and drop
             When I drag a valid image file over the upload area
             Then the upload area should show visual feedback
             When I drop a valid image file on the upload area
             Then the logo should be uploaded and displayed
             When I drop an invalid file on the upload area
             Then I should see appropriate error message

        Scenario: Navigation back to professional information
             When I click the "Back" button
             Then I should return to the professional information step
              And my workspace setup data should be preserved

        Scenario: Form validation before submission
             When I have a valid workspace name
              And the slug is available
             Then the "Continue" button should be enabled
             When I have an invalid workspace name
             Then the "Continue" button should be disabled
             When the slug is not available
             Then the "Continue" button should be disabled
             When the slug availability is still being checked
             Then the "Continue" button should be disabled

        Scenario: Workspace setup persistence
            Given I have entered workspace information
             When I navigate away and return to this step
             Then my workspace setup data should be restored from localStorage
              And the logo preview should be displayed if uploaded
```

## Feature: Completion Step and Workspace Creation

```gherkin
Feature: Completion Step and Workspace Creation
              As a new user
              I want to see my workspace being created
  So that I know the onboarding is completing successfully

        Background:
            Given I have completed all onboarding steps
              And I am on the completion step

        Scenario: Successful workspace and workflow creation
             When I reach the completion step
             Then I should see "Setting up your workspace" message
              And I should see a loading spinner
              And the workspace creation should start automatically
              And default workflows should be created
             When the workspace creation completes successfully
             Then I should see "Your workspace is ready!" message
              And I should see a success checkmark
              And I should see the introduction video
              And the "Continue to Dashboard" button should be enabled

        Scenario: Default workflow creation warnings
             When the workspace is created successfully
              But default workflow creation has warnings
             Then I should see the workspace as ready
              And warnings should be logged but not shown to user
              And I should be able to continue to dashboard

        Scenario: Email scheduling during completion
             When the workspace creation completes
             Then a welcome email should be scheduled immediately
              And a follow-up email should be scheduled for 4 days later
              And a feedback request email should be scheduled for 7 days later
              And a feature update email should be scheduled for 4 days later
             When email scheduling fails
             Then the onboarding should still complete successfully
              And warnings should be logged

        Scenario: Continue to dashboard
             When the workspace creation is complete
              And I click "Continue to Dashboard"
             Then all onboarding data should be cleared from localStorage
              And my onboarding should be marked as complete on the server
              And I should be redirected to the dashboard "/"
              And I should not be able to access "/onboarding" anymore

        Scenario: Browser back button prevention
            Given workspace creation has started
             When I try to use the browser back button
             Then I should remain on the completion step
              And navigation should be prevented

        Scenario: Force completion fallback
            Given the server shows onboarding as incomplete
             Then the button "Continue to Dashboard" is disabled
             ```

## Feature: Navigation and State Management

```gherkin
Feature: Navigation and State Management
              As a user going through onboarding
              I want smooth navigation between steps
  So that I can complete the process efficiently

        Scenario: Progress indicator accuracy
            Given I am on the personal information step
             Then step 1 should be highlighted as active
              And steps 2 and 3 should be inactive
            Given I am on the professional information step
             Then step 1 should show as completed
              And step 2 should be highlighted as active
              And step 3 should be inactive
            Given I am on the workspace setup step
             Then steps 1 and 2 should show as completed
              And step 3 should be highlighted as active

        Scenario: Data persistence across page refreshes
            Given I have partially completed onboarding
             When I refresh the page at any step
             Then I should return to the correct step
              And my previously entered data should be restored
              And the progress indicator should show the correct state

        Scenario: Server state synchronization
            Given I am going through onboarding
             When each step is completed
             Then the server should be updated with my progress
              And the onboarding status should be synchronized
             When I reload the page
             Then the server state should determine my current step

        Scenario: Onboarding completion detection
            Given I have completed onboarding previously
             When I try to access "/onboarding"
             Then I should be redirected to the dashboard "/"
              And I should not see the onboarding flow

        Scenario: Authentication requirement
            Given I am not authenticated
             When I try to access "/onboarding"
             Then I should be redirected to the login page
             When I am authenticated but onboarding is complete
             Then I should be redirected to the dashboard

        Scenario: Light theme enforcement
             When I am on any onboarding step
             Then the interface should use light theme
              And dark mode should be disabled
              And the theme should be forced regardless of system preference
```

## Feature: Error Handling and Edge Cases

```gherkin
Feature: Error Handling and Edge Cases
              As a user going through onboarding
              I want graceful error handling
  So that I can complete onboarding even when issues occur

        Scenario: API failure resilience
             When an API call fails during step submission
             Then I should be blocked from proceeding to the next step
              And the UI should provide an error message "Something went wrong. Please try again."

        Scenario: Network connectivity issues
             When I lose network connectivity during onboarding
             Then my form data should be preserved locally
              And I should be able to continue when connectivity returns
              And slug availability checks should handle timeouts gracefully

        Scenario: Workspace creation timeout handling
             When workspace creation takes longer than expected
             Then I should see appropriate loading messages
              And the process should not timeout prematurely
              And I should have options to retry or continue

        Scenario: Duplicate workspace name handling
             When I enter a workspace name that already exists
             Then the system should automatically suggest alternatives
              And I should be able to proceed with the modified name
              And the slug conflict should be resolved automatically

        Scenario: File upload error recovery
             When logo upload fails due to network issues
             Then I should see the error message "Something went wrong. Please try again."
              And I should be able to retry the upload
              And I should be able to continue without a logo

        Scenario: Concurrent user scenarios
             When multiple users try to create workspaces simultaneously
             Then each should get unique slugs
              And no conflicts should occur
              And all users should complete successfully
```     