Feature: Editor Access and Layout
  As a logged-in user
  I want to access and navigate the workflow editor
  So that I can create and modify my workflows

  # Temporary simplified test to verify our selectors work
  Scenario: Editor page accessibility (without login)
    When I navigate directly to an editor URL
    Then I should be able to access the page

  # Test authentication with seeded data
  Scenario: Editor login with seeded data
    Given I am a logged-in user
    And I am on the editor page of a workflow
    Then I should see the workflow header with the workflow name
    And I should see the main canvas area

  # Background:
  #   Given I am a logged-in user
  #   And I am on the editor page of a workflow
    
  # Scenario: Editor loads successfully
  #   When I access the workflow editor
  #   Then I should see the workflow header with the workflow name
  #   And I should see the main canvas area
  #   And I should see the sidebar on the left
  #   And I should see zoom controls
  #   And I should see a "Begin" block on the canvas
  #   And I should see navigation breadcrumbs

  # Scenario: Editor header functionality
  #   When I am in the editor
  #   Then I should see the workflow title in the header
  #   And I should see a "Read Mode" button
  #   When I click the workflow title
  #   Then I should be able to edit the workflow title inline
  #   When I click "Read Mode"
  #   Then I should be redirected to the read view of the workflow

  # Scenario: Sidebar navigation
  #   When I am in the editor
  #   Then I should see the sidebar with workflow navigation
  #   And I should see a list of all blocks in the workflow
  #   And I should see block hierarchy with proper indentation
  #   When I click on a block in the sidebar
  #   Then the canvas should center on that block
  #   And the block should be highlighted

  # Scenario: Canvas interaction
  #   When I am in the editor
  #   Then I should be able to pan the canvas by dragging
  #   And I should be able to zoom in and out using mouse wheel
  #   And I should be able to zoom using the zoom controls
  #   When I double-click on an empty area
  #   Then the canvas should fit all blocks in view 