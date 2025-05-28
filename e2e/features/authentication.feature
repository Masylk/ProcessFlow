# ProcessFlow Authentication BDD Test

## Feature: User Registration

Feature: User Registration
              As a new user
              I want to create an account
  So that I can access ProcessFlow

        Background:
            Given I am on the signup page
              And I am not authenticated

        Scenario: Successful email/password registration
             When I enter a valid email "user@example.com"
              And I enter a strong password "StrongPass123!"
              And I click the "Sign up" button
             Then I should see a success message
              And I should be redirected to login page with pre-filled email
              And a confirmation email should be sent to "user@example.com"

        Scenario: Registration with weak password
             When I enter a valid email "user@example.com"
              And I enter a weak password "123"
              And I click the "Sign up" button
             Then I should see error "Password must be at least 8 characters and include uppercase, lowercase, number, and special character."
              And the signup should not proceed

        Scenario: Registration with invalid email
             When I enter an invalid email "invalid-email"
              And I enter a strong password "StrongPass123!"
              And I click the "Sign up" button
             Then I should see error "Please enter a valid email address."
              And the signup should not proceed

        Scenario: Registration with existing email
            Given a user already exists with email "existing@example.com"
             When I enter email "existing@example.com"
             Then the system should perform an immediate email availability check
              And no visual feedback should be shown about email existence
             When I enter a strong password "StrongPass123!"
              And I click the "Sign up" button
             Then the system should perform a final email existence check
              And I should see message "If your signup was successful, check your email."
              And no new account should be created
              And no confirmation email should be sent
              And I should be redirected to login page with pre-filled email

        Scenario: Google OAuth registration
             When I click "Sign up with Google"
             Then I should be redirected to Google OAuth
              And after successful Google authentication
             Then I should be redirected to "/auth/callback"
              And a new user account should be created
              And I should be redirected to the onboarding page

## Feature: User Authentication

```gherkin
Feature: User Authentication
              As a registered user
              I want to log into my account
  So that I can access ProcessFlow

        Background:
            Given I am on the login page
              And I am not authenticated

        Scenario: Successful login with confirmed email (new user)
            Given a new user exists with email "newuser@example.com" and confirmed email
              And the user has not completed onboarding
             When I enter email "newuser@example.com"
              And I enter the correct password
              And I click the "Log in" button
             Then I should be logged in successfully
              And I should be redirected to "/onboarding"
              And a session cookie should be set

        Scenario: Successful login with confirmed email (existing user)
            Given an existing user with email "user@example.com" and confirmed email
              And the user has completed onboarding
             When I enter email "user@example.com"
              And I enter the correct password
              And I click the "Log in" button
             Then I should be logged in successfully
              And I should be redirected to the dashboard "/"
              And a session cookie should be set

        Scenario: Login attempt with unconfirmed email
            Given a user exists with email "unconfirmed@example.com" and unconfirmed email
             When I enter email "unconfirmed@example.com"
              And I enter the correct password
              And I click the "Log in" button
             Then I should see message "Please confirm your email before logging in"
              And I should not be logged in

        Scenario: Login with invalid credentials
             When I enter email "user@example.com"
              And I enter an incorrect password
              And I click the "Log in" button
             Then I should see error "Login Failed"
              And I should not be logged in
              And the failed attempt should be tracked

        Scenario: Login with invalid email format
             When I enter an invalid email "invalid-email"
              And I enter any password
              And I click the "Log in" button
             Then I should see error "Invalid Email"
              And the login should not proceed

        Scenario: Google OAuth login (new user)
             When I click "Log in with Google"
             Then I should be redirected to Google OAuth
              And after successful Google authentication
             Then I should be redirected to "/auth/callback"
              And I should be logged in automatically
              And I should be redirected to "/onboarding"

        Scenario: Google OAuth login (existing user)
            Given an existing user with Google account
              And the user has completed onboarding
             When I click "Log in with Google"
             Then I should be redirected to Google OAuth
              And after successful Google authentication
             Then I should be redirected to "/auth/callback"
              And I should be logged in automatically
              And I should be redirected to the dashboard
```

## Feature: Authentication Security

```gherkin
Feature: Authentication Security
              As a security-conscious system
              I want to protect against authentication attacks
  So that user accounts remain secure

        Scenario: Rate limiting on failed login attempts
            Given I am on the login page
             When I make 30 failed login attempts within 10 minutes
             Then I should be blocked from further attempts
              And I should see message "Too many failed attempts"
              And I should be blocked for 10 minutes
              And the block timer should count down

        Scenario: Rate limiting on auth routes
            Given I am accessing authentication routes
             When I make more than 20 requests per minute
             Then I should receive a "429 Too many requests" response
              And further requests should be blocked

        Scenario: Password strength validation
            Given I am on the signup page
             When I enter a password without uppercase letters
             Then I should see password strength error
             When I enter a password without lowercase letters
             Then I should see password strength error
             When I enter a password without numbers
             Then I should see password strength error
             When I enter a password without special characters
             Then I should see password strength error
             When I enter a password shorter than 8 characters
             Then I should see password strength error

        Scenario: Session management
            Given I am logged in
             When my session is valid
             Then I should have access to protected routes
             When my session expires
             Then I should be redirected to login page
             When I log out
             Then my session should be invalidated
              And I should be redirected to login page
```

## Feature: Navigation Control

```gherkin
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

        Scenario: Unauthenticated user accessing protected routes
            Given I am not authenticated
             When I try to access "/dashboard"
             Then I should be redirected to "/login"
              And the redirect parameter should include original path
             When I try to access "/workspace/123"
             Then I should be redirected to "/login"

        Scenario: Onboarding flow for new users
            Given I am a newly registered user
              And my onboarding is not complete
             When I log in successfully
             Then I should be redirected to "/onboarding"
            Given my onboarding is complete
             When I try to access "/onboarding"
             Then I should be redirected to dashboard "/"

        Scenario: Complete onboarding flow for new user
            Given I am a newly registered user
              And my onboarding is not complete
             When I log in successfully
             Then I should be redirected to "/onboarding"
              And I should see the onboarding progress indicator
             When I complete the personal information step
             Then I should proceed to the professional information step
             When I complete the professional information step
             Then I should proceed to the workspace setup step
             When I complete the workspace setup step
             Then I should proceed to the completion step
              And the system should create my workspace
              And the system should create default workflows
             When I click "Continue to Dashboard"
             Then I should be redirected to dashboard "/"
              And An email should be sent to the user with the subject "Welcome to ProcessFlow"
              And my onboarding should be marked as complete
              And I should not be able to access "/onboarding" anymore

        Scenario: URL sanitization
            Given I access a URL with encoded spaces "/workspace%20name/flow"
             Then I should be redirected to "/workspace-name/flow"
              And the URL should be properly formatted

        Scenario: Embed route protection
            Given I access an embed route "/shared/flow/123/embed"
             Then the response should include headers:
                  | X-Frame-Options         | ALLOWALL          |
                  | Content-Security-Policy | frame-ancestors * |
```

## Feature: Email Confirmation Flow

```gherkin
Feature: Email Confirmation Flow
              As a new user
              I want to confirm my email address
  So that I can complete my registration

        Scenario: Email confirmation success
            Given I have registered with email "user@example.com"
              And I received a confirmation email
             When I click the confirmation link in the email
             Then I should be redirected to "/auth/confirm"
              And my email should be marked as confirmed
              And I should be automatically logged in
              And I should be redirected to "/onboarding"

        Scenario: Email confirmation with invalid token
             When I access "/auth/confirm" with an invalid token
             Then I should see an error message
              And my email should remain unconfirmed

        Scenario: Resending confirmation email
            Given I have registered but not confirmed my email
             When I try to log in
             Then I should see option to resend confirmation email
             When I click "resend confirmation"
             Then a new confirmation email should be sent
```