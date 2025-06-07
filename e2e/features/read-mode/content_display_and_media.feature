Feature: Content Display and Media
  As a user
  I want to view rich content and media in workflow steps
  So that I can understand the instructions clearly

  Background:
    Given I am in read mode
    And I have steps with various content types

  # Scenario: Basic step content display
  #   When I view a step
  #   Then I should see the step icon
  #   And I should see the step title
  #   And I should see the step description if available
  #   And I should see any estimated time duration
  #   And text content should be properly formatted

  # Scenario: Fullscreen image viewing
  #   Given I have opened an image in fullscreen
  #   Then I should see the image at full size
  #   And I should see close button
  #   And I should see zoom controls
  #   When I press the Escape key
  #   Then the fullscreen view should close
  #   When I click outside the image
  #   Then the fullscreen view should close

  # Scenario: Rich text content with links
  #   Given I have a step with text containing URLs
  #   When I view the step description
  #   Then URLs should be automatically converted to clickable links
  #   And links should open in a new tab when clicked
  #   And links should be visually distinguished from regular text

  # Scenario: App integration icons
  #   Given I have steps with app integrations
  #   When I view these steps
  #   Then I should see the appropriate app icons
  #   And icons should load from the correct sources
  #   When an app icon fails to load
  #   Then I should see a default fallback icon 