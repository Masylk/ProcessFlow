Feature: Delay Block Handling
  As a user
  I want to understand delay blocks in workflows
  So that I know when to wait and what to expect

  Background:
    Given I am in read mode
    And I have a workflow with delay blocks

  # Scenario: Fixed duration delay display
  #   Given I reach a fixed duration delay block
  #   Then I should see a delay icon (clock/stopwatch)
  #   And I should see "Fixed Duration" as the delay type
  #   And I should see the delay time formatted (e.g., "2h 30m")
  #   And I should see a message like "Flow paused for 2 hours and 30 minutes"
  #   And I should see an info box explaining the delay

  # Scenario: Event-based delay display
  #   Given I reach an event-based delay block
  #   Then I should see a delay icon (calendar/clock)
  #   And I should see "Event-Based Delay" as the delay type
  #   And I should see the event name being waited for
  #   And I should see "Waiting for: [Event Name]"
  #   If the delay has an expiration time
  #   Then I should see "Expires after [time]" with an hourglass icon
  #   And I should see appropriate pause messaging 