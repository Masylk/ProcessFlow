Feature: Search and Filtering
  As a user
  I want to search and filter my workflows
  So that I can quickly find what I need

  Background:
    Given I am on the dashboard
    And I have multiple workflows and folders

  # Scenario: Basic workflow search
  #   When I enter "onboarding" in the search bar
  #   Then I should see only workflows containing "onboarding" in the name
  #   And other workflows should be hidden
  #   When I clear the search
  #   Then all workflows should be visible again

  # Scenario: Search with no results
  #   When I enter "nonexistent" in the search bar
  #   Then I should see a "no results" message
  #   And no workflows should be displayed

  # Scenario: Search is case insensitive
  #   When I enter "ONBOARDING" in the search bar
  #   Then I should see workflows containing "onboarding" (lowercase)
  #   And the search should work regardless of case

  # Scenario: Real-time search filtering
  #   When I start typing in the search bar
  #   Then the results should update in real-time
  #   And I should not need to press Enter to search

  # Scenario: Search within specific folder
  #   Given I am viewing a specific folder
  #   When I enter a search term
  #   Then I should see only workflows from that folder matching the search
  #   And workflows from other folders should not appear

  # Scenario: Folder filtering
  #   When I select a folder from the sidebar
  #   Then the main canvas should show only workflows in that folder
  #   And the header should indicate the current folder
  #   When I select "My Flows" (root level)
  #   Then I should see all workflows not in folders 