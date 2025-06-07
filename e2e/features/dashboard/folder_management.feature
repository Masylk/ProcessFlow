Feature: Folder Management
  As a user
  I want to organize my workflows in folders
  So that I can maintain a structured workspace

  Background:
    Given I am on the dashboard
    And I have folder management permissions

  # Scenario: Creating a new folder
  #   When I click the "+" button next to folders
  #   Then I should see the "Create a folder" modal
  #   When I enter folder name "HR Processes"
  #   And I select an icon or emoji
  #   And I click "Create"
  #   Then the folder should appear in the sidebar
  #   And I should see a success notification

  # Scenario: Folder name validation
  #   When I create a folder
  #   And I leave the folder name empty
  #   Then the "Create" button should be disabled
  #   When I enter a folder name with 101 characters
  #   Then only the first 100 characters should be accepted
  #   And an error message should be displayed like "Folder name must be less than 100 characters"
  #   And the "Create" button should be disabled

  # Scenario: Creating a subfolder
  #   Given I have a folder named "HR Processes"
  #   When I right-click on the folder
  #   And I select "Create subfolder"
  #   Then I should see the "Create a Subfolder" modal
  #   And I should see the parent folder context
  #   When I enter subfolder name "Onboarding"
  #   And I click "Create"
  #   Then the subfolder should appear under the parent folder

  # Scenario: Editing a folder
  #   Given I have a folder named "HR Processes"
  #   When I right-click on the folder
  #   And I select "Edit folder"
  #   Then I should see the "Edit a folder" modal
  #   And the form should be pre-filled with current folder data
  #   When I change the name to "Human Resources"
  #   And I click "Save changes"
  #   Then the folder should show the updated name

  # Scenario: Deleting a folder
  #   Given I have a folder with no workflows
  #   When I right-click on the folder
  #   And I select "Delete folder"
  #   Then I should see a confirmation modal
  #   And it should warn that the action cannot be undone
  #   And it should mention that flows inside will not be deleted
  #   When I click "Delete"
  #   Then the folder should be removed
  #   And any workflows should remain in the workspace

  # Scenario: Folder icon and emoji selection
  #   When I create or edit a folder
  #   And I click the icon selector
  #   Then I should see icon selection options
  #   When I select a company logo
  #   Then the logo should be applied to the folder
  #   When I select an emoji
  #   Then the emoji should be displayed as the folder icon

  # Scenario: Folder expansion and collapse
  #   Given I have a folder with subfolders
  #   When I click the folder expand/collapse arrow
  #   Then the folder should expand to show subfolders
  #   When I click the arrow again
  #   Then the folder should collapse to hide subfolders

  # Scenario: Navigating to folder contents
  #   Given I have a folder with workflows
  #   When I click on the folder name
  #   Then the main canvas should show only workflows in that folder
  #   And the header should show the folder name and icon
  #   And I should see a breadcrumb or back navigation option 