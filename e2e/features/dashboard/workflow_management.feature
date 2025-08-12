Feature: Workflow Management
  As a user
  I want to manage my workflows
  So that I can organize and maintain my processes

  Background:
    Given I am on the dashboard
    And I have access to workflow management features

  # Scenario: Creating a new workflow
  #   When I click the "New Flow" button
  #   Then I should see the "Create a new Flow" modal
  #   When I enter flow name like "Employee Onboarding"
  #   And I enter flow description like "Process for onboarding new employees"
  #   And I click the "Create Flow" button
  #   Then the modal should close
  #   And I should immeditely go into the new workflow
  #   And I should see a success notification like "Flow created successfully"

  # Scenario: Workflow name validation during creation
  #   When I open the create flow modal
  #   And I leave the flow name empty
  #   Then the "Create Flow" button should be disabled
  #   When I enter a flow name with 101 characters
  #   Then only the first 100 characters should be accepted
  #   Then I should see a validation error like "Flow name must be less than 100 characters"
  #   And the "Create Flow" button should be disabled
  #   When I enter flow name with special characters "<script>alert('xss')</script>"
  #   Then the input should be sanitized

  # Scenario: Editing an existing workflow
  #   Given I have a workflow named "Test Workflow"
  #   When I click the workflow actions menu
  #   And I select "Edit"
  #   Then I should see the "Edit a Flow" modal
  #   And the form should be pre-filled with current workflow data
  #   When I change the name to "Updated Workflow"
  #   And I click "Save changes"
  #   Then the modal should close
  #   And the workflow should show the updated name

  # Scenario: Workflow icon selection
  #   When I create or edit a workflow
  #   And I click the icon selector
  #   Then I should see the icon selection modal
  #   And I should see tabs for Icons, Apps, Upload
  #   When I select an icon from the Icons tab
  #   Then the icon should be applied to the workflow

  # Scenario: Deleting a workflow
  #   Given I have a workflow named "Test Workflow"
  #   When I click the workflow actions menu
  #   And I select "Delete"
  #   Then I should see a confirmation modal
  #   And the modal should warn that the action cannot be undone
  #   When I click "Delete"
  #   Then the workflow should be removed from the workspace
  #   And I should see a success notification

  # Scenario: Duplicating a workflow
  #   Given I have a workflow named "Original Workflow"
  #   When I click the workflow actions menu
  #   And I select "Duplicate"
  #   Then a copy of the workflow should be created
  #   And it should be named "Original Workflow (Copy)"
  #   And both workflows should be visible in the workspace

  # Scenario: Moving a workflow to a folder
  #   Given I have a workflow and multiple folders
  #   When I click the workflow actions menu
  #   And I select "Move"
  #   Then I should see the "Move Flow" modal
  #   And I should see a folder tree structure
  #   When I select a target folder
  #   And I click "Move"
  #   Then the workflow should be moved to the selected folder
  #   And it should no longer appear in the current view if filtered
  #   And I should see a success notification like "Flow moved successfully"
  #   And My view should be updated to show the workflow in the new folder

  # Scenario: Workflow status management
  #   Given I have a workflow
  #   When I click the workflow status indicator
  #   Then I should see status options (Draft, Active, Archived, In Review, Needs Update)
  #   When I select "Active"
  #   Then the workflow status should update
  #   And the status indicator should reflect the change

  # Scenario: Copying workflow link
  #   Given I have a workflow
  #   When I click the workflow actions menu
  #   And I select "Copy link"
  #   Then the workflow URL should be copied to clipboard
  #   And I should see a "Link copied!" notification

  # Scenario: Sharing a workflow
  #   Given I have a workflow
  #   When I click the workflow actions menu
  #   And I select "Share"
  #   Then I should see the share modal
  #   And I should see sharing options and link
  #   And I should be able to switch between sharing options like "Public" and "Private"
  #   And I should be able to switch between "Share" and "Embed" options
  #   And I should be able to copy the link to the clipboard
  #   And I should see a "Link copied!" notification 