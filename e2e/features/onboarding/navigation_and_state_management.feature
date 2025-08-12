Feature: Navigation and State Management
  As a user going through onboarding
  I want smooth navigation between steps
  So that I can complete the process efficiently

  # Scenario: Progress indicator accuracy
  #   Given I am on the personal information step
  #   Then step 1 should be highlighted as active
  #   And steps 2 and 3 should be inactive
  #   Given I am on the professional information step
  #   Then step 1 should show as completed
  #   And step 2 should be highlighted as active
  #   And step 3 should be inactive
  #   Given I am on the workspace setup step
  #   Then steps 1 and 2 should show as completed
  #   And step 3 should be highlighted as active

  # Scenario: Data persistence across page refreshes
  #   Given I have partially completed onboarding
  #   When I refresh the page at any step
  #   Then I should return to the correct step
  #   And my previously entered data should be restored
  #   And the progress indicator should show the correct state

  # Scenario: Server state synchronization
  #   Given I am going through onboarding
  #   When each step is completed
  #   Then the server should be updated with my progress
  #   And the onboarding status should be synchronized
  #   When I reload the page
  #   Then the server state should determine my current step

  # Scenario: Onboarding completion detection
  #   Given I have completed onboarding previously
  #   When I try to access "/onboarding"
  #   Then I should be redirected to the dashboard "/"
  #   And I should not see the onboarding flow

  # Scenario: Authentication requirement
  #   Given I am not authenticated
  #   When I try to access "/onboarding"
  #   Then I should be redirected to the login page
  #   When I am authenticated but onboarding is complete
  #   Then I should be redirected to the dashboard

  # Scenario: Light theme enforcement
  #   When I am on any onboarding step
  #   Then the interface should use light theme
  #   And dark mode should be disabled
  #   And the theme should be forced regardless of system preference 