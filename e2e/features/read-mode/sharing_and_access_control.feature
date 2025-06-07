Feature: Sharing and Access Control
  As a user
  I want to share workflows and control access
  So that I can collaborate with others effectively

  Background:
    Given I am in read mode
    And I have sharing permissions for the workflow

  # Scenario: Opening share modal
  #   When I click the "Share" button
  #   Then I should see the share modal
  #   And I should see the workflow name in the modal
  #   And I should see the current sharing status (Public/Private)
  #   And I should see the share URL
  #   And I should see copy link button

  # Scenario: Toggling workflow access
  #   Given the workflow is currently public
  #   When I toggle back to private
  #   Then I should see "Workflow is now private" notification
  #   When I toggle back to public
  #   Then I should see "Workflow is now public" notification

  # Scenario: Copying share link
  #   When I click "Copy link" in the share modal
  #   Then the workflow URL should be copied to clipboard
  #   And I should see a "Link copied!" notification
  #   And the copied link should be the correct share URL

  # Scenario: Share modal with workspace branding
  #   Given my workspace has a custom logo
  #   When I open the share modal
  #   Then I should see the workspace logo in the modal
  #   And the modal should reflect the workspace branding

  # Scenario: Public workflow access
  #   Given I have a public workflow link
  #   When I access the workflow without being logged in
  #   Then I should be able to view the workflow
  #   And I should see limited functionality (no edit access)
  #   And I should not see user-specific controls 