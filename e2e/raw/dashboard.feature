# ProcessFlow Dashboard BDD Tests

Feature: Dashboard Access and Layout
  As a logged-in user
  I want to access and navigate the dashboard
  So that I can manage my workflows and workspace

  Background:
    Given I am a logged-in user
    And I have completed onboarding
    And I am on the dashboard page "/"

  Scenario: Dashboard loads successfully
    When I access the dashboard
    Then I should see the sidebar with workspace information on the left corner
    And I should see the main canvas area
    And I should see the "My Flows" header
    And I should see my user profile in the header bar on the right

  Scenario: Recently used workflows section
    Given I have workflows with recent activity
    When I view the dashboard
    Then I should see a "Recently Used" section
    And it should show up to 4 most recently used workflows
    And workflows should be ordered by last_opened timestamp

  Scenario: Empty state handling
    Given I have no workflows in my workspace
    When I view the dashboard
    Then I should see an appropriate empty state like 'No workflows found'
    And I should see options to create my first workflow

Feature: Workflow Management
  As a user
  I want to manage my workflows
  So that I can organize and maintain my processes

  Background:
    Given I am on the dashboard
    And I have access to workflow management features

  Scenario: Creating a new workflow
    When I click the "New Flow" button
    Then I should see the "Create a new Flow" modal
    When I enter flow name like "Employee Onboarding"
    And I enter flow description like "Process for onboarding new employees"
    And I click the "Create Flow" button
    Then the modal should close
    And I should immeditely go into the new workflow
    And I should see a success notification like "Flow created successfully"

  Scenario: Workflow name validation during creation
    When I open the create flow modal
    And I leave the flow name empty
    Then the "Create Flow" button should be disabled
    When I enter a flow name with 101 characters
    Then only the first 100 characters should be accepted
    Then I should see a validation error like "Flow name must be less than 100 characters"
    And the "Create Flow" button should be disabled
    When I enter flow name with special characters "<script>alert('xss')</script>"
    Then the input should be sanitized

  Scenario: Editing an existing workflow
    Given I have a workflow named "Test Workflow"
    When I click the workflow actions menu
    And I select "Edit"
    Then I should see the "Edit a Flow" modal
    And the form should be pre-filled with current workflow data
    When I change the name to "Updated Workflow"
    And I click "Save changes"
    Then the modal should close
    And the workflow should show the updated name

  Scenario: Workflow icon selection
    When I create or edit a workflow
    And I click the icon selector
    Then I should see the icon selection modal
    And I should see tabs for Icons, Apps, Upload
    When I select an icon from the Icons tab
    Then the icon should be applied to the workflow

  Scenario: Deleting a workflow
    Given I have a workflow named "Test Workflow"
    When I click the workflow actions menu
    And I select "Delete"
    Then I should see a confirmation modal
    And the modal should warn that the action cannot be undone
    When I click "Delete"
    Then the workflow should be removed from the workspace
    And I should see a success notification

  Scenario: Duplicating a workflow
    Given I have a workflow named "Original Workflow"
    When I click the workflow actions menu
    And I select "Duplicate"
    Then a copy of the workflow should be created
    And it should be named "Original Workflow (Copy)"
    And both workflows should be visible in the workspace

  Scenario: Moving a workflow to a folder
    Given I have a workflow and multiple folders
    When I click the workflow actions menu
    And I select "Move"
    Then I should see the "Move Flow" modal
    And I should see a folder tree structure
    When I select a target folder
    And I click "Move"
    Then the workflow should be moved to the selected folder
    And it should no longer appear in the current view if filtered
    And I should see a success notification like "Flow moved successfully"
    And My view should be updated to show the workflow in the new folder

  Scenario: Workflow status management
    Given I have a workflow
    When I click the workflow status indicator
    Then I should see status options (Draft, Active, Archived, In Review, Needs Update)
    When I select "Active"
    Then the workflow status should update
    And the status indicator should reflect the change

  Scenario: Copying workflow link
    Given I have a workflow
    When I click the workflow actions menu
    And I select "Copy link"
    Then the workflow URL should be copied to clipboard
    And I should see a "Link copied!" notification

  Scenario: Sharing a workflow
    Given I have a workflow
    When I click the workflow actions menu
    And I select "Share"
    Then I should see the share modal
    And I should see sharing options and link
    And I should be able to switch between sharing options like "Public" and "Private"
    And I should be able to switch between "Share" and "Embed" options
    And I should be able to copy the link to the clipboard
    And I should see a "Link copied!" notification

Feature: Folder Management
  As a user
  I want to organize my workflows in folders
  So that I can maintain a structured workspace

  Background:
    Given I am on the dashboard
    And I have folder management permissions

  Scenario: Creating a new folder
    When I click the "+" button next to folders
    Then I should see the "Create a folder" modal
    When I enter folder name "HR Processes"
    And I select an icon or emoji
    And I click "Create"
    Then the folder should appear in the sidebar
    And I should see a success notification

  Scenario: Folder name validation
    When I create a folder
    And I leave the folder name empty
    Then the "Create" button should be disabled
    When I enter a folder name with 101 characters
    Then only the first 100 characters should be accepted
    And an error message should be displayed like "Folder name must be less than 100 characters"
    And the "Create" button should be disabled

  Scenario: Creating a subfolder
    Given I have a folder named "HR Processes"
    When I right-click on the folder
    And I select "Create subfolder"
    Then I should see the "Create a Subfolder" modal
    And I should see the parent folder context
    When I enter subfolder name "Onboarding"
    And I click "Create"
    Then the subfolder should appear under the parent folder

  Scenario: Editing a folder
    Given I have a folder named "HR Processes"
    When I right-click on the folder
    And I select "Edit folder"
    Then I should see the "Edit a folder" modal
    And the form should be pre-filled with current folder data
    When I change the name to "Human Resources"
    And I click "Save changes"
    Then the folder should show the updated name

  Scenario: Deleting a folder
    Given I have a folder with no workflows
    When I right-click on the folder
    And I select "Delete folder"
    Then I should see a confirmation modal
    And it should warn that the action cannot be undone
    And it should mention that flows inside will not be deleted
    When I click "Delete"
    Then the folder should be removed
    And any workflows should remain in the workspace

  Scenario: Folder icon and emoji selection
    When I create or edit a folder
    And I click the icon selector
    Then I should see icon selection options
    When I select a company logo
    Then the logo should be applied to the folder
    When I select an emoji
    Then the emoji should be displayed as the folder icon

  Scenario: Folder expansion and collapse
    Given I have a folder with subfolders
    When I click the folder expand/collapse arrow
    Then the folder should expand to show subfolders
    When I click the arrow again
    Then the folder should collapse to hide subfolders

  Scenario: Navigating to folder contents
    Given I have a folder with workflows
    When I click on the folder name
    Then the main canvas should show only workflows in that folder
    And the header should show the folder name and icon
    And I should see a breadcrumb or back navigation option

Feature: Search and Filtering
  As a user
  I want to search and filter my workflows
  So that I can quickly find what I need

  Background:
    Given I am on the dashboard
    And I have multiple workflows and folders

  Scenario: Basic workflow search
    When I enter "onboarding" in the search bar
    Then I should see only workflows containing "onboarding" in the name
    And other workflows should be hidden
    When I clear the search
    Then all workflows should be visible again

  Scenario: Search with no results
    When I enter "nonexistent" in the search bar
    Then I should see a "no results" message
    And no workflows should be displayed

  Scenario: Search is case insensitive
    When I enter "ONBOARDING" in the search bar
    Then I should see workflows containing "onboarding" (lowercase)
    And the search should work regardless of case

  Scenario: Real-time search filtering
    When I start typing in the search bar
    Then the results should update in real-time
    And I should not need to press Enter to search

  Scenario: Search within specific folder
    Given I am viewing a specific folder
    When I enter a search term
    Then I should see only workflows from that folder matching the search
    And workflows from other folders should not appear

  Scenario: Folder filtering
    When I select a folder from the sidebar
    Then the main canvas should show only workflows in that folder
    And the header should indicate the current folder
    When I select "My Flows" (root level)
    Then I should see all workflows not in folders

Feature: User Profile Management
  As a user
  I want to manage my profile and account settings
  So that I can keep my information current and secure

  Background:
    Given I am logged in to the dashboard
    And I can access user settings

  Scenario: Accessing user settings
    When I click on my user profile in the header bar on the right
    Then I should see a user dropdown menu
    When I select "Account settings"
    Then I should see the user settings page

  Scenario: Updating profile information
    When I am in user settings
    And I change my first name to "John"
    And I change my last name to "Doe"
    And I click "Save changes"
    Then my profile should be updated
    And I should see a success notification
    And the changes should be reflected in the UI

  Scenario: Profile information validation
    When I am editing my profile
    And I enter a first name with 41 characters
    Then only the first 40 characters should be accepted
    When I enter special characters in my name
    Then the input should be sanitized appropriately

  Scenario: Changing email address
    When I am in user settings
    And I enter a new email address
    And I click "Change email"
    Then I should see a confirmation dialog
    When I confirm the change
    Then a verification email should be sent
    And I should see instructions to verify the new email

  Scenario: Email validation
    When I enter an invalid email format
    Then I should see an error message
    And the save button should be disabled
    When I enter a valid email format
    Then the error should clear
    And the save button should be enabled

  Scenario: Changing password
    When I am in user settings
    And I click "Change password"
    Then I should see a password change form
    When I enter my current password
    And I enter a new password
    And I confirm the new password
    And I click "Update password"
    Then I should see a confirmation dialog
    When I confirm the password change
    Then my password should be updated
    And I should be logged out of other devices

  Scenario: Password validation
    When I am changing my password
    And I enter a password shorter than 8 characters
    Then I should see a validation error
    When I enter a password without uppercase letters
    Then I should see a validation error
    When I enter a password without lowercase letters
    Then I should see a validation error
    When I enter a password without numbers
    Then I should see a validation error
    When I enter a password without special characters
    Then I should see a validation error
    When I enter mismatched password confirmations
    Then I should see a validation error
    When I enter a valid password "StrongPass123!"
    And I confirm the same password "StrongPass123!"
    Then the validation should clear
    And the save button should be enabled

  Scenario: Account deletion
    When I am in user settings
    And I click "Delete account"
    Then I should see a confirmation dialog
    And I should be required to enter my password
    When I enter my password and confirm deletion
    Then my account should be deleted
    And I should be redirected to the home page

Feature: Settings and Configuration
  As a user
  I want to configure my workspace and billing settings
  So that I can customize my experience and manage my subscription

  Background:
    Given I am on the dashboard
    And I have access to settings

  Scenario: Navigating settings tabs
    When I open settings
    Then I should see tabs for Plan, billing, workspace and appearance
    When I click on the workspace tab
    Then I should see workspace-specific settings
    When I click on the billing tab
    Then I should see billing and subscription information

  Scenario: Workspace settings management
    When I am in workspace settings
    Then I should see the current workspace name and logo
    When I change the workspace name
    And I click "Save changes"
    Then the workspace should be updated
    And the changes should be reflected throughout the UI

  Scenario: Workspace logo upload - valid file types
    When I upload a PNG file smaller than 5MB
    Then the logo should be accepted and displayed
    When I upload a JPEG file smaller than 5MB
    Then the logo should be accepted and displayed
    When I upload an SVG file smaller than 5MB
    Then the logo should be accepted and displayed
    When I upload a file with an invalid type
    Then I should see an error message like "Invalid file type. Please upload a PNG, JPG, GIF, or SVG image."
    When I upload a file with an invalid size
    Then I should see an error message like "File is too large. Maximum size is 5MB."
    And the file should not be accepted

  Scenario: Workspace name validation
    When I am in workspace settings
    And I leave the workspace name empty
    Then I should see a validation error like "Workspace name is required"
    And the "Save" button should be disabled
    When I enter a workspace name with 51 characters
    Then only the first 50 characters should be accepted
    And I should see a validation error like "Workspace name cannot be longer than 50 characters"
    When I enter workspace name with invalid characters "Invalid!Name@#$"
    Then the invalid characters should be removed automatically
    And only valid characters (letters, numbers, spaces, hyphens) should remain
    When I enter a valid workspace name "My Company-123"
    Then the validation should clear
    And the "Save" button should be enabled

  Scenario: Billing information display
    When I am in billing settings
    Then I should see my current subscription plan
    And I should see billing address information
    And I should see payment method details if configured
    When I click "Edit Billing Details"
    Then I should be redirected to the Stripe customer portal

  Scenario: Subscription plan management
    Given I have a subscription
    When I am in billing settings
    Then I should see options to change my plan
    And I should see billing period options (monthly/annual)
    When I select a different plan
    Then I should see pricing information
    And I should be able to confirm the change

  Scenario: Plan downgrade confirmation
    Given I have a paid subscription
    When I attempt to downgrade to a free plan
    Then I should see a confirmation dialog
    And I should see information about feature limitations
    When I confirm the downgrade
    Then my plan should be changed
    And I should see updated feature access

  Scenario: Workspace deletion
    When I am in workspace settings
    And I click "Delete workspace"
    Then I should see a confirmation dialog
    And I should be required to type the workspace name
    When I enter the correct workspace name and confirm
    Then the workspace should be deleted
    And I should be redirected appropriately

Feature: Help and Tutorial
  As a user
  I want to access help and tutorial features
  So that I can learn how to use the platform effectively

  Background:
    Given I am on the dashboard

  Scenario: Accessing help center
    When I click on my user profile
    And I select "Help center"
    Then I should see the help center modal
    And I should see options for different types of help

  Scenario: Help center options
    When I open the help center
    Then I should see "Reach out to us" option
    And I should see "Take a look at our roadmap" option
    And I should see "Join our Slack community" option
    When I click "Reach out to us"
    Then my email client should open with a pre-filled email
    When I click "Join our Slack community"
    Then I should be redirected to the Slack invitation link

  Scenario: Tutorial functionality
    When I access the tutorial option
    Then I should see the tutorial overlay
    And I should see step-by-step guidance
    When I click "Next" on tutorial steps
    Then I should progress through the tutorial
    And relevant UI elements should be highlighted

  Scenario: Tutorial navigation
    When I am in the tutorial
    Then I should see current step indicators
    And I should see options to skip or continue
    When I click "Skip"
    Then the tutorial should end
    And I should return to normal dashboard view

  Scenario: Tutorial completion
    When I complete all tutorial steps
    Then the tutorial should end automatically
    And my tutorial status should be marked as complete
    And I should not see tutorial prompts again

  Scenario: Restarting tutorial
    Given I have completed the tutorial previously
    When I access the help center
    And I select restart tutorial option
    Then the tutorial should start from the beginning
    And my tutorial status should be reset


Feature: Error Handling and Edge Cases
  As a user
  I want the system to handle errors gracefully
  So that I can continue working even when issues occur

  Background:
    Given I am on the dashboard

  Scenario: Network connectivity issues
    When I lose network connectivity
    And I try to perform an action
    Then I should see an appropriate error message like "Something went wrong. Please try again."
    And the action should not complete
    When connectivity is restored 
    Then I should be able to retry the action 

  Scenario: API failure handling
    When an API call fails during workflow creation
    Then I should see an error notification like "Failed to create workflow"
    And the modal should remain open
    And I should be able to retry the operation

  Scenario: File upload failures
    When a file upload fails due to network issues
    And I should be able to retry the upload
    When the upload succeeds on retry
    Then I should see a success confirmation

  Scenario: Validation error handling
    When I submit a form with invalid data
    Then I should see specific validation errors like "Name is required"
    And the form should not submit
    And invalid fields should be highlighted
    When I correct the errors
    Then the validation should clear
    And I should be able to submit successfully

  Scenario: Browser refresh handling
    When I refresh the page during an operation
    Then I should return to a consistent state
    And any unsaved changes should be handled appropriately
    And I should see appropriate notifications about lost changes like "Changes not saved"

  Scenario: Modal and overlay error handling
    When an error occurs while a modal is open
    Then the error should be displayed within the modal context like "An error occurred"
    And I should have options to retry or cancel
    When multiple modals are triggered simultaneously
    Then they should be handled in a logical order
    And the UI should remain stable 