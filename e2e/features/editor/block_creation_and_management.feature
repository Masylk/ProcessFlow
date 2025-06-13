Feature: Block Creation and Management
  As a user
  I want to create and manage different types of blocks
  So that I can build comprehensive workflows

  Background:
    Given I am in the workflow editor
    And I can see the canvas with a "Begin" block

  # Scenario: Adding a Step block
  #   When I click the "+" button after the Begin block
  #   Then I should see the add block dropdown menu
  #   And I should at least see the "Step" block option
  #   When I select "Step"
  #   Then a new Step block should be added to the workflow
  #   And the block should have a default title like "Untitled Block"
  #   And the block should have a default icon
  #   And the dropdown menu should close

  # Scenario: Adding a Condition block
  #   When I click the "+" button after the Begin block
  #   And I select "Condition"
  #   Then I should see the "Create a new condition" modal
  #   When I enter condition name "Approval Decision"
  #   And I enter condition description "Determine if the request is approved or rejected"
  #   And I add path names "Approved" and "Rejected"
  #   And I click "Create Paths"
  #   Then the modal should close
  #   And a Condition block should be created
  #   And two parallel paths should be created with the specified names
  #   And each path should have its own branch on the canvas

  # Scenario: Adding a Delay block
  #   When I click the "+" button after a Step block
  #   And I select "Delay"
  #   Then I should see the delay type selection modal
  #   When I select "Fixed Duration"
  #   Then I should see the fixed delay configuration modal
  #   When I set the delay to 2 hours and 30 minutes
  #   And I click "Create Delay"
  #   Then a Fixed Delay block should be added
  #   And the block should display "2h 30m" as the delay time

  # Scenario: Adding an Event Delay block
  #   When I click the "+" button after a Step block
  #   And I select "Delay"
  #   And I select "Wait For Event"
  #   Then I should see the event delay configuration modal
  #   When I enter event name "Client Response"
  #   And I set maximum wait time to 3 days
  #   And I click "Create Delay"
  #   Then an Event Delay block should be added
  #   And the block should display "Wait for Client Response (max 3 days)"

  # Scenario: Adding an End block
  #   Given I have a workflow with multiple blocks
  #   When I click the "+" button after the last block in a path
  #   Then I should see the add block dropdown menu
  #   And I should see an "End Block" option
  #   When I select "End Block"
  #   Then an End block should be added 