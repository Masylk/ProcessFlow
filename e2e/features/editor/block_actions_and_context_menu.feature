Feature: Block Actions and Context Menu
  As a user
  I want to perform various actions on blocks
  So that I can efficiently manage my workflow

  Background:
    Given I am in the workflow editor
    And I have multiple blocks in my workflow

  # Scenario: Block context menu
  #   When I click the three dots menu on a Step block
  #   Then I should see a context menu with options
  #   And I should see "Edit", "Copy", "Delete", "Connect Blocks", and "Copy Link" options

  # Scenario: Copying a block
  #   When I click the three dots menu on a Step block
  #   And I select "Copy"
  #   Then the block should be copied to the clipboard
  #   And I should see a "Block copied" notification

  # Scenario: Pasting a block
  #   Given I have copied a block to the clipboard
  #   When I click the "+" button at any position
  #   Then I should see a "Paste Block" option in the dropdown
  #   When I select "Paste Block"
  #   Then a copy of the block should be created at that position
  #   And the new block should have "(copy)" appended to its title

  # Scenario: Deleting a block
  #   When I click the three dots menu on a Step block
  #   And I select "Delete"
  #   Then I should see a confirmation modal
  #   When I confirm the deletion
  #   Then the block should be removed from the workflow
  #   And subsequent blocks should move up to fill the gap

  # Scenario: Connecting blocks with stroke lines
  #   When I click the three dots menu on a Step block
  #   And I select "Connect Blocks"
  #   Then I'll see a modal with a search bar
  #   When I search for a block
  #   Then I should see the block in the search results
  #   When I click on the block
  #   Then I should see the connection modal
  #   When I enter a connection label "If rejected"
  #   And I click "Connect"
  #   Then a stroke line should be created between the blocks
  #   And the line should display the label 