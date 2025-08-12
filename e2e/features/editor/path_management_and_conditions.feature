Feature: Path Management and Conditions
  As a user
  I want to create and manage conditional paths
  So that I can model complex decision-based workflows

  Background:
    Given I am in the workflow editor
    And I have a workflow with at least one Condition block

  # Scenario: Editing existing paths
  #   Given I have a Condition block with 3 paths
  #   When I click the three dots menu on the Condition block
  #   And I select "Edit"
  #   Then I should see the "Update Paths" modal
  #   And I should see the current paths listed
  #   When I modify a path name from "Approved" to "Fully Approved"
  #   And I add a new path "Conditionally Approved"
  #   And I remove the "Rejected" path
  #   And I click "Update Paths"
  #   Then the paths should be updated accordingly
  #   And the workflow should reflect the changes

  # Scenario: Merging paths
  #   Given I have multiple parallel paths that need to converge
  #   When I click the three dots menu on the last step block of a path
  #   And I select "Merge Paths"
  #   Then I should enter merge mode
  #   And I should see path selection indicators
  #   When I select the paths I want to merge
  #   And I click "Merge Selected Paths"
  #   Then the selected paths should converge into a single path

  # Scenario: Path labels and editing
  #   Given I have conditional paths
  #   When I click on a path label
  #   Then the label should become editable
  #   When I change the label text
  #   And I press Enter or I click outside the label
  #   Then the label should be updated
  #   And the change should be reflected in the workflow 