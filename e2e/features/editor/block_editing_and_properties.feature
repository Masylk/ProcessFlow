Feature: Block Editing and Properties
  As a user
  I want to edit block properties and content
  So that I can provide detailed information for each step

  Background:
    Given I am in the workflow editor
    And I have a Step block on the canvas

  # Scenario: Opening block details sidebar
  #   When I click on a Step block
  #   Then the block details sidebar should open on the right
  #   And I should see the block's current title
  #   And I should see the block's icon
  #   And I should see fields for description, average time, and media
  #   And I should see a close button
  #   And when I click on the canvas, the sidebar should close

  # Scenario: Editing block title
  #   When I open the block details sidebar
  #   And I click on the block title
  #   Then the title should become editable
  #   When I change the title to "Review Application"
  #   Then the title should be updated
  #   And the sidebar should show the new title
  #   And the block on the canvas should show the new title

  # Scenario: Editing block description
  #   When I open the block details sidebar
  #   And I click in the description area
  #   Then the description field should become editable
  #   When I enter "Review the submitted application for completeness and accuracy"
  #   And I click outside the description field
  #   Then the description should be saved
  #   And the description should be visible in the sidebar

  # Scenario: Changing block icon
  #   When I open the block details sidebar
  #   And I click on the block icon
  #   Then I should see the icon selection modal
  #   And I should see tabs for "Icons", "Apps", and "Upload"
  #   When I select an icon from the Icons tab
  #   Then the icon should be applied to the block
  #   And the modal should close
  #   And the block should display the new icon

  # Scenario: Adding block media
  #   When I open the block details sidebar
  #   And I click in the media section
  #   Then I should see a file upload area
  #   When I drag and drop an image file
  #   Then the image should be uploaded
  #   And the image should be displayed in the media section
  #   And I should see options to edit or remove the image

  # Scenario: Editing block media
  #   Given I have a block with an uploaded image
  #   When I open the block details sidebar
  #   And I click the edit button on the image
  #   Then I should see the image editor modal
  #   When I make edits to the image
  #   And I click "Save"
  #   Then the edited image should be saved
  #   And the original image should be preserved for reset option 