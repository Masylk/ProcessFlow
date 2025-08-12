Feature: Stroke Lines and Connections
  As a user
  I want to create custom connections between blocks
  So that I can model complex workflows with loops and non-linear flows

  Background:
    Given I am in the workflow editor
    And I have multiple blocks in different paths

  # Scenario: Creating a stroke line connection
  #   When I click the three dots menu on a source block
  #   And I select "Connect Blocks"
  #   Then I should enter connection mode
  #   When I click on a target block
  #   Then I should see the connection modal
  #   And I should see the source and target blocks highlighted
  #   When I enter connection label "Return for revision"
  #   And I click "Create Connection"
  #   Then a stroke line should be drawn between the blocks
  #   And the line should display the label

  # Scenario: Deleting stroke lines
  #   Given I have a stroke line connection
  #   When I click on the stroke line
  #   And I select "Delete"
  #   Then I should see a confirmation modal
  #   When I confirm the deletion
  #   Then the stroke line should be removed
  #   And the connection should no longer exist

  # Scenario: Stroke line visibility toggle
  #   Given I have multiple stroke lines in my workflow
  #   When I click the stroke lines visibility toggle
  #   Then all stroke lines should be hidden
  #   When I click the toggle again
  #   Then all stroke lines should be visible again

  # Scenario: Editing stroke line control points
  #   Given I have a stroke line with a curved path
  #   When I hover over the stroke line
  #   Then I should see control points for adjusting the curve
  #   When I drag a control point
  #   Then the stroke line path should adjust accordingly
  #   And the new path should be saved 