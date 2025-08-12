Feature: Step Navigation and Progression
  As a user
  I want to navigate through workflow steps
  So that I can follow the process systematically

  Background:
    Given I am in read mode
    And I have a workflow with multiple steps

  # Scenario: Linear step progression in carousel mode
  #   Given I am in carousel mode
  #   And I am on the first step
  #   When I click "Next step"
  #   Then I should proceed to the second step
  #   And the second step should be displayed
  #   And I should see a "Previous step" button
  #   When I click "Previous step"
  #   Then I should return to the first step

  # Scenario: Step navigation in vertical mode
  #   Given I am in vertical mode
  #   When I got a conditionnal step
  #   Then I should see the conditionnal step content
  #   And I should see the path options
  #   When I select a path option
  #   Then I should proceed to the first step of the selected path
  #   And subsequent steps should follow the selected path 