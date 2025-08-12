Feature: Process Completion and Restart
  As a user
  I want to complete workflows and restart them
  So that I can finish processes and repeat them as needed

  Background:
    Given I am in read mode in carousel mode
    And I have progressed through a workflow

  # Scenario: Reaching workflow completion
  #   Given I am on the last step of the workflow
  #   When I click "Complete" or reach the end
  #   Then I should see the completion screen
  #   And I should see a success icon (checkmark)
  #   And I should see a congratulations message
  #   And I should see "You've completed the process" text
  #   And I should see sharing encouragement message

  # Scenario: Completion screen actions
  #   When I am on the completion screen
  #   Then I should see a "Copy link" button
  #   And I should see a "Restart process" button
  #   When I click "Copy link"
  #   Then the workflow share link should be copied
  #   And I should see a "Link copied!" notification
  #   When I click "Restart process"
  #   Then I should return to the initial state
  #   And all step progress should be reset
  #   And all path selections should be cleared

  # Scenario: Completion with conditional paths
  #   Given I completed a workflow with multiple path choices
  #   When I restart the process
  #   Then all my previous path selections should be cleared
  #   And I should be able to make different choices
  #   And follow different paths through the workflow 