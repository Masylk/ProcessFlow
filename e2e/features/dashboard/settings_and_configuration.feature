Feature: Settings and Configuration
  As a user
  I want to configure my workspace and billing settings
  So that I can customize my experience and manage my subscription

  Background:
    Given I am on the dashboard
    And I have access to settings

  # Scenario: Navigating settings tabs
  #   When I open settings
  #   Then I should see tabs for Plan, billing, workspace and appearance
  #   When I click on the workspace tab
  #   Then I should see workspace-specific settings
  #   When I click on the billing tab
  #   Then I should see billing and subscription information

  # Scenario: Workspace settings management
  #   When I am in workspace settings
  #   Then I should see the current workspace name and logo
  #   When I change the workspace name
  #   And I click "Save changes"
  #   Then the workspace should be updated
  #   And the changes should be reflected throughout the UI

  # Scenario: Workspace logo upload - valid file types
  #   When I upload a PNG file smaller than 5MB
  #   Then the logo should be accepted and displayed
  #   When I upload a JPEG file smaller than 5MB
  #   Then the logo should be accepted and displayed
  #   When I upload an SVG file smaller than 5MB
  #   Then the logo should be accepted and displayed
  #   When I upload a file with an invalid type
  #   Then I should see an error message like "Invalid file type. Please upload a PNG, JPG, GIF, or SVG image."
  #   When I upload a file with an invalid size
  #   Then I should see an error message like "File is too large. Maximum size is 5MB."
  #   And the file should not be accepted

  # Scenario: Workspace name validation
  #   When I am in workspace settings
  #   And I leave the workspace name empty
  #   Then I should see a validation error like "Workspace name is required"
  #   And the "Save" button should be disabled
  #   When I enter a workspace name with 51 characters
  #   Then only the first 50 characters should be accepted
  #   And I should see a validation error like "Workspace name cannot be longer than 50 characters"
  #   When I enter workspace name with invalid characters "Invalid!Name@#$"
  #   Then the invalid characters should be removed automatically
  #   And only valid characters (letters, numbers, spaces, hyphens) should remain
  #   When I enter a valid workspace name "My Company-123"
  #   Then the validation should clear
  #   And the "Save" button should be enabled

  # Scenario: Billing information display
  #   When I am in billing settings
  #   Then I should see my current subscription plan
  #   And I should see billing address information
  #   And I should see payment method details if configured
  #   When I click "Edit Billing Details"
  #   Then I should be redirected to the Stripe customer portal

  # Scenario: Subscription plan management
  #   Given I have a subscription
  #   When I am in billing settings
  #   Then I should see options to change my plan
  #   And I should see billing period options (monthly/annual)
  #   When I select a different plan
  #   Then I should see pricing information
  #   And I should be able to confirm the change

  # Scenario: Plan downgrade confirmation
  #   Given I have a paid subscription
  #   When I attempt to downgrade to a free plan
  #   Then I should see a confirmation dialog
  #   And I should see information about feature limitations
  #   When I confirm the downgrade
  #   Then my plan should be changed
  #   And I should see updated feature access

  # Scenario: Workspace deletion
  #   When I am in workspace settings
  #   And I click "Delete workspace"
  #   Then I should see a confirmation dialog
  #   And I should be required to type the workspace name
  #   When I enter the correct workspace name and confirm
  #   Then the workspace should be deleted
  #   And I should be redirected appropriately 