Feature: Email Confirmation Flow
  As a new user
  I want to confirm my email address
  So that I can complete my registration

  # Scenario: Email confirmation success
  #   Given I have registered with email "user@example.com"
  #   And I received a confirmation email
  #   When I click the confirmation link in the email
  #   Then I should be redirected to "/auth/confirm"
  #   And my email should be marked as confirmed
  #   And I should be automatically logged in
  #   And I should be redirected to "/onboarding"

  # Scenario: Email confirmation with invalid token
  #   When I access "/auth/confirm" with an invalid token
  #   Then I should see an error message
  #   And my email should remain unconfirmed

  # Scenario: Resending confirmation email
  #   Given I have registered but not confirmed my email
  #   When I try to log in
  #   Then I should see option to resend confirmation email
  #   When I click "resend confirmation"
  #   Then a new confirmation email should be sent 