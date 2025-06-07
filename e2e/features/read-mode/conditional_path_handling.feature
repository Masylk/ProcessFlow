Feature: Conditional Path Handling
  As a user
  I want to make choices at decision points
  So that I can follow the appropriate path for my situation

  Background:
    Given I am in read mode
    And I have a workflow with conditional paths

  # Scenario: Displaying path options
  #   Given I reach a step with multiple path options
  #   Then I should see the step content
  #   And I should see a "Select an option" section
  #   And I should see radio buttons for each available path
  #   And each option should show the path name
  #   And the "Next step" button should be disabled until I make a selection

  # Scenario: Selecting a path option
  #   Given I am on a step with path options
  #   When I select a path option
  #   Then the radio button should be marked as selected
  #   And the "Next step" button should become enabled
  #   When I click "Next step"
  #   Then I should proceed to the first step of the selected path
  #   And subsequent steps should follow the selected path

  # Scenario: Path selection persistence
  #   Given I have selected a path option
  #   When I navigate back to the decision step
  #   Then my previous selection should still be marked
  #   When I change my selection to a different path
  #   And I proceed forward
  #   Then I should follow the newly selected path
  #   And any progress on the previous path should be reset

  # Scenario: Multiple decision points
  #   Given I have a workflow with multiple decision points
  #   When I make selections at each decision point
  #   Then each selection should be remembered
  #   And I should be able to navigate back and see my choices
  #   When I change a selection at an earlier decision point
  #   Then all subsequent selections should be reset
  #   And I should need to make new selections for later decision points 