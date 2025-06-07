Feature: Sidebar Navigation and Block Management
  As a user
  I want to navigate and manage blocks through the sidebar
  So that I can efficiently work with large workflows

  Background:
    Given I am in the workflow editor
    And I have a complex workflow with multiple paths and blocks

  # Scenario: Sidebar block hierarchy
  #   When I look at the sidebar
  #   Then I should see all blocks organized hierarchically
  #   And I should see proper indentation for nested paths
  #   And I should see block icons and titles
  #   And I should see block duration estimates

  # Scenario: Sidebar search functionality
  #   When I enter "approval" in the sidebar search box
  #   Then only blocks containing "approval" should be visible
  #   And other blocks should be filtered out
  #   When I clear the search
  #   Then all blocks should be visible again

  # Scenario: Sidebar block navigation
  #   When I click on a block in the sidebar
  #   Then the canvas should center on that block
  #   And the block should be highlighted
  #   And I should see the block details sidebar open on the right

  # Scenario: Sidebar path collapsing
  #   Given I have paths with multiple nested blocks
  #   When I click the collapse arrow next to a path
  #   Then the path's child blocks should be hidden
  #   When I click the expand arrow
  #   Then the child blocks should be visible again 