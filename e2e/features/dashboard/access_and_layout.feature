Feature: Dashboard Access and Layout
  As a logged-in user
  I want to access and navigate the dashboard
  So that I can manage my workflows and workspace

  Background:
    Given I am a logged-in user
    And I have completed onboarding
    And I am on the dashboard page "/"

  # Scenario: Dashboard loads successfully
  #   When I access the dashboard
  #   Then I should see the sidebar with workspace information on the left corner
  #   And I should see the main canvas area
  #   And I should see the "My Flows" header
  #   And I should see my user profile in the header bar on the right

  # Scenario: Recently used workflows section
  #   Given I have workflows with recent activity
  #   When I view the dashboard
  #   Then I should see a "Recently Used" section
  #   And it should show up to 4 most recently used workflows
  #   And workflows should be ordered by last_opened timestamp

  # Scenario: Empty state handling
  #   Given I have no workflows in my workspace
  #   When I view the dashboard
  #   Then I should see an appropriate empty state like 'No workflows found'
  #   And I should see options to create my first workflow 