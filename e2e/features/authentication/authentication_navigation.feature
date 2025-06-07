Feature: Navigation Control
  As the application
  I want to control user navigation based on authentication state
  So that users see appropriate content

  Scenario: Authenticated user accessing auth routes
    Given I am logged in
    When I try to access "/login"
    Then I should be redirected to dashboard "/"
    When I try to access "/signup"
    Then I should be redirected to dashboard "/"
    When I try to access "/reset-password"
    Then I should be redirected to dashboard "/"

  # Scenario: Unauthenticated user accessing protected routes
  #   Given I am not authenticated
  #   When I try to access "/dashboard"
  #   Then I should be redirected to "/login"
  #   And the redirect parameter should include original path
  #   When I try to access "/workspace/123"
  #   Then I should be redirected to "/login"

  # Scenario: Onboarding flow for new users
  #   Given I am a newly registered user
  #   And my onboarding is not complete
  #   When I log in successfully
  #   Then I should be redirected to "/onboarding"
  #   Given my onboarding is complete
  #   When I try to access "/onboarding"
  #   Then I should be redirected to dashboard "/"

  # Scenario: Complete onboarding flow for new user
  #   Given I am a newly registered user
  #   And my onboarding is not complete
  #   When I log in successfully
  #   Then I should be redirected to "/onboarding"
  #   And I should see the onboarding progress indicator
  #   When I complete the personal information step
  #   Then I should proceed to the professional information step
  #   When I complete the professional information step
  #   Then I should proceed to the workspace setup step
  #   When I complete the workspace setup step
  #   Then I should proceed to the completion step
  #   And the system should create my workspace
  #   And the system should create default workflows
  #   When I click "Continue to Dashboard"
  #   Then I should be redirected to dashboard "/"
  #   And An email should be sent to the user with the subject "Welcome to ProcessFlow"
  #   And my onboarding should be marked as complete
  #   And I should not be able to access "/onboarding" anymore

  # Scenario: URL sanitization
  #   Given I access a URL with encoded spaces "/workspace%20name/flow"
  #   Then I should be redirected to "/workspace-name/flow"
  #   And the URL should be properly formatted

  # Scenario: Embed route protection
  #   Given I access an embed route "/shared/flow/123/embed"
  #   Then the response should include headers:
  #     | X-Frame-Options         | ALLOWALL          |
  #     | Content-Security-Policy | frame-ancestors * | 