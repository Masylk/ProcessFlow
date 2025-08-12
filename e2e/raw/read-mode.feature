# ProcessFlow Read Mode BDD Tests

Feature: Read Mode Access and Layout
  As a user
  I want to access and view workflows in read mode
  So that I can follow processes and understand workflow steps

  Background:
    Given I am a logged-in user
    And I have access to a workflow in read mode
    And I am on the read page of a workflow

  Scenario: Read mode loads successfully
    When I access a workflow in read mode
    Then I should see the workflow header with navigation controls
    And I should see the main content area
    And I should see the sidebar on the left with workspace information
    And I should see the view mode switch controls
    And I should see the process card with workflow information
    And I should see breadcrumb navigation

  Scenario: Read mode header functionality
    When I am in read mode
    Then I should see the workflow title in the breadcrumbs
    And I should see an "Edit" button
    And I should see a "Share" button
    And I should see my user profile dropdown
    When I click the "Edit" button
    Then I should be redirected to the edit mode of the workflow
    When I click the back button
    Then I should navigate to the previous page

  Scenario: Process card display
    When I view the process card
    Then I should see the workflow icon
    And I should see the workflow name and description
    And I should see integration badges for connected apps
    And I should see author information if available
    And I should see the last update timestamp
    When there are more than 5 integrations
    Then I should see a "+X" badge for additional integrations
    When I hover over the "+X" badge
    Then I should see a popover with the additional integrations

  Scenario: Sidebar workspace navigation
    When I look at the sidebar
    Then I should see the workspace name and icon
    And I should see a hierarchical list of workflow steps
    When I click on the workspace name
    Then I should be redirected to the workspace dashboard

Feature: View Mode Management
  As a user
  I want to switch between different view modes
  So that I can choose the best way to follow the workflow

  Background:
    Given I am in read mode
    And I can see the view mode switch controls

  Scenario: Switching to vertical view mode
    When I click the vertical view mode button
    Then the interface should switch to vertical mode
    And I should see all steps displayed in a scrollable list
    And I should see the sidebar with step navigation
    And I should see step expansion controls
    And the view mode button should show as active

  Scenario: Switching to carousel view mode
    When I click the carousel view mode button
    Then the interface should switch to carousel mode
    And I should see one step displayed at a time
    And I should see navigation buttons (Previous/Next)
    And I should see a "Get Started" button initially
    And the sidebar should be hidden
    And the view mode button should show as active

Feature: Step Navigation and Progression
  As a user
  I want to navigate through workflow steps
  So that I can follow the process systematically

  Background:
    Given I am in read mode
    And I have a workflow with multiple steps

  Scenario: Linear step progression in carousel mode
    Given I am in carousel mode
    And I am on the first step
    When I click "Next step"
    Then I should proceed to the second step
    And the second step should be displayed
    And I should see a "Previous step" button
    When I click "Previous step"
    Then I should return to the first step

Scenario: Step navigation in vertical mode
    Given I am in vertical mode
    When I got a conditionnal step
    Then I should see the conditionnal step content
    And I should see the path options
    When I select a path option
    Then I should proceed to the first step of the selected path
    And subsequent steps should follow the selected path


Feature: Conditional Path Handling
  As a user
  I want to make choices at decision points
  So that I can follow the appropriate path for my situation

  Background:
    Given I am in read mode
    And I have a workflow with conditional paths

  Scenario: Displaying path options
    Given I reach a step with multiple path options
    Then I should see the step content
    And I should see a "Select an option" section
    And I should see radio buttons for each available path
    And each option should show the path name
    And the "Next step" button should be disabled until I make a selection

  Scenario: Selecting a path option
    Given I am on a step with path options
    When I select a path option
    Then the radio button should be marked as selected
    And the "Next step" button should become enabled
    When I click "Next step"
    Then I should proceed to the first step of the selected path
    And subsequent steps should follow the selected path

  Scenario: Path selection persistence
    Given I have selected a path option
    When I navigate back to the decision step
    Then my previous selection should still be marked
    When I change my selection to a different path
    And I proceed forward
    Then I should follow the newly selected path
    And any progress on the previous path should be reset

  Scenario: Multiple decision points
    Given I have a workflow with multiple decision points
    When I make selections at each decision point
    Then each selection should be remembered
    And I should be able to navigate back and see my choices
    When I change a selection at an earlier decision point
    Then all subsequent selections should be reset
    And I should need to make new selections for later decision points

Feature: Content Display and Media
  As a user
  I want to view rich content and media in workflow steps
  So that I can understand the instructions clearly

  Background:
    Given I am in read mode
    And I have steps with various content types

  Scenario: Basic step content display
    When I view a step
    Then I should see the step icon
    And I should see the step title
    And I should see the step description if available
    And I should see any estimated time duration
    And text content should be properly formatted

  Scenario: Fullscreen image viewing
    Given I have opened an image in fullscreen
    Then I should see the image at full size
    And I should see close button
    And I should see zoom controls
    When I press the Escape key
    Then the fullscreen view should close
    When I click outside the image
    Then the fullscreen view should close

  Scenario: Rich text content with links
    Given I have a step with text containing URLs
    When I view the step description
    Then URLs should be automatically converted to clickable links
    And links should open in a new tab when clicked
    And links should be visually distinguished from regular text

  Scenario: App integration icons
    Given I have steps with app integrations
    When I view these steps
    Then I should see the appropriate app icons
    And icons should load from the correct sources
    When an app icon fails to load
    Then I should see a default fallback icon

Feature: Sidebar Navigation and Step Management
  As a user
  I want to navigate efficiently through the workflow
  So that I can jump to specific steps and understand the structure

  Background:
    Given I am in vertical mode
    And I can see the sidebar

  Scenario: Sidebar step hierarchy display
    When I look at the sidebar
    Then I should see all workflow paths organized hierarchically
    And I should see proper indentation for nested paths
    And I should see step icons and titles
    And I should see expand/collapse arrows for paths with multiple steps

  Scenario: Sidebar step navigation
    When I click on a step in the sidebar
    Then the main content should scroll to that step
    And the step should be highlighted
    And if the step was collapsed, it should expand

  Scenario: Path collapsing and expanding
    Given I have paths with multiple steps
    When I click the collapse arrow next to a path
    Then the path's child steps should be hidden
    And the arrow should change to indicate collapsed state
    When I click the expand arrow
    Then the child steps should be visible again
    And the arrow should change to indicate expanded state

  Scenario: Active step highlighting
    Given I am progressing through the workflow
    When I am on a specific step
    Then that step should be highlighted in the sidebar
    And it should be visually distinct from other steps
    When I navigate to a different step
    Then the highlighting should move to the new step

  Scenario: Sidebar workspace navigation
    When I click on the workspace name in the sidebar
    Then I should be redirected to the workspace dashboard
    And I should see a hover effect on the workspace area
    And the workspace icon and name should be clearly visible

Feature: Delay Block Handling
  As a user
  I want to understand delay blocks in workflows
  So that I know when to wait and what to expect

  Background:
    Given I am in read mode
    And I have a workflow with delay blocks

  Scenario: Fixed duration delay display
    Given I reach a fixed duration delay block
    Then I should see a delay icon (clock/stopwatch)
    And I should see "Fixed Duration" as the delay type
    And I should see the delay time formatted (e.g., "2h 30m")
    And I should see a message like "Flow paused for 2 hours and 30 minutes"
    And I should see an info box explaining the delay

  Scenario: Event-based delay display
    Given I reach an event-based delay block
    Then I should see a delay icon (calendar/clock)
    And I should see "Event-Based Delay" as the delay type
    And I should see the event name being waited for
    And I should see "Waiting for: [Event Name]"
    If the delay has an expiration time
    Then I should see "Expires after [time]" with an hourglass icon
    And I should see appropriate pause messaging

Feature: Header Controls and Navigation
  As a user
  I want to access workflow controls and navigation
  So that I can manage my workflow viewing experience

  Background:
    Given I am in read mode
    And I can see the header controls

  Scenario: Breadcrumb navigation
    When I look at the header
    Then I should see breadcrumb navigation
    And I should see the workspace name (if applicable)
    And I should see folder names (if workflow is in a folder)
    And I should see the workflow name as the final breadcrumb
    When I click on a breadcrumb item with a link
    Then I should navigate to that location

  Scenario: Edit mode navigation
    When I click the "Edit" button in the header
    Then I should be redirected to the edit mode
    And the URL should change to the edit mode URL
    And I should see the workflow editor interface

  Scenario: User profile dropdown
    When I click on my user profile in the header
    Then I should see a dropdown menu
    And I should see "Account settings" option
    And I should see "Help center" option
    When I select "Account settings"
    Then I should see the user settings modal
    When I select "Help center"
    Then I should see the help center modal

Feature: Sharing and Access Control
  As a user
  I want to share workflows and control access
  So that I can collaborate with others effectively

  Background:
    Given I am in read mode
    And I have sharing permissions for the workflow

  Scenario: Opening share modal
    When I click the "Share" button
    Then I should see the share modal
    And I should see the workflow name in the modal
    And I should see the current sharing status (Public/Private)
    And I should see the share URL
    And I should see copy link button

  Scenario: Toggling workflow access
    Given the workflow is currently public
    When I toggle back to private
    Then I should see "Workflow is now private" notification
    When I toggle back to public
    Then I should see "Workflow is now public" notification

  Scenario: Copying share link
    When I click "Copy link" in the share modal
    Then the workflow URL should be copied to clipboard
    And I should see a "Link copied!" notification
    And the copied link should be the correct share URL

  Scenario: Share modal with workspace branding
    Given my workspace has a custom logo
    When I open the share modal
    Then I should see the workspace logo in the modal
    And the modal should reflect the workspace branding

  Scenario: Public workflow access
    Given I have a public workflow link
    When I access the workflow without being logged in
    Then I should be able to view the workflow
    And I should see limited functionality (no edit access)
    And I should not see user-specific controls

Feature: Process Completion and Restart
  As a user
  I want to complete workflows and restart them
  So that I can finish processes and repeat them as needed

  Background:
    Given I am in read mode in carousel mode
    And I have progressed through a workflow

  Scenario: Reaching workflow completion
    Given I am on the last step of the workflow
    When I click "Complete" or reach the end
    Then I should see the completion screen
    And I should see a success icon (checkmark)
    And I should see a congratulations message
    And I should see "You've completed the process" text
    And I should see sharing encouragement message

  Scenario: Completion screen actions
    When I am on the completion screen
    Then I should see a "Copy link" button
    And I should see a "Restart process" button
    When I click "Copy link"
    Then the workflow share link should be copied
    And I should see a "Link copied!" notification
    When I click "Restart process"
    Then I should return to the initial state
    And all step progress should be reset
    And all path selections should be cleared

  Scenario: Completion with conditional paths
    Given I completed a workflow with multiple path choices
    When I restart the process
    Then all my previous path selections should be cleared
    And I should be able to make different choices
    And follow different paths through the workflow

Feature: Error Handling and Edge Cases
  As a user
  I want the system to handle errors gracefully
  So that I can continue using the workflow even when issues occur

  Background:
    Given I am in read mode

  Scenario: Network connectivity issues
    When I lose network connectivity
    And I try to navigate to a new step
    Then I should see an appropriate error message
    And the interface should remain functional for local actions
    When connectivity is restored
    Then I should be able to continue normally

  Scenario: Missing or broken media
    Given I have a step with an image that fails to load
    When I view that step
    Then I should see a placeholder or error state
    And the step should still be functional
    And other content should display normally

  Scenario: Invalid workflow access
    When I try to access a workflow that doesn't exist
    Then I should see a 404 error page
    When I try to access a private workflow without permission
    Then I should be redirected to login