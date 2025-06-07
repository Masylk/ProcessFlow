Feature: Read Mode Access and Layout
  As a user
  I want to access and view workflows in read mode
  So that I can follow processes and understand workflow steps

  Background:
    Given I am a logged-in user
    And I have access to a workflow in read mode
    And I am on the read page of a workflow

  # Scenario: Read mode loads successfully
  #   When I access a workflow in read mode
  #   Then I should see the workflow header with navigation controls
  #   And I should see the main content area
  #   And I should see the sidebar on the left with workspace information
  #   And I should see the view mode switch controls
  #   And I should see the process card with workflow information
  #   And I should see breadcrumb navigation

  # Scenario: Read mode header functionality
  #   When I am in read mode
  #   Then I should see the workflow title in the breadcrumbs
  #   And I should see an "Edit" button
  #   And I should see a "Share" button
  #   And I should see my user profile dropdown
  #   When I click the "Edit" button
  #   Then I should be redirected to the edit mode of the workflow
  #   When I click the back button
  #   Then I should navigate to the previous page

  # Scenario: Process card display
  #   When I view the process card
  #   Then I should see the workflow icon
  #   And I should see the workflow name and description
  #   And I should see integration badges for connected apps
  #   And I should see author information if available
  #   And I should see the last update timestamp
  #   When there are more than 5 integrations
  #   Then I should see a "+X" badge for additional integrations
  #   When I hover over the "+X" badge
  #   Then I should see a popover with the additional integrations

  # Scenario: Sidebar workspace navigation
  #   When I look at the sidebar
  #   Then I should see the workspace name and icon
  #   And I should see a hierarchical list of workflow steps
  #   When I click on the workspace name
  #   Then I should be redirected to the workspace dashboard 