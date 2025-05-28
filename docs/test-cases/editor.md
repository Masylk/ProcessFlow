<!-- AUTO-GENERATED START -->

# ProcessFlow Editor BDD Tests



# Editor Access and Layout


As a logged-in user

I want to access and navigate the workflow editor

So that I can create and modify my workflows



Background:

**Given** I am a logged-in user

**And** I am on the editor page of a workflow



## Scenario: Editor loads successfully


**When** I access the workflow editor

**Then** I should see the workflow header with the workflow name

**And** I should see the main canvas area

**And** I should see the sidebar on the left

**And** I should see zoom controls

**And** I should see a "Begin" block on the canvas

**And** I should see navigation breadcrumbs



## Scenario: Editor header functionality


**When** I am in the editor

**Then** I should see the workflow title in the header

**And** I should see a "Read Mode" button

**When** I click the workflow title

**Then** I should be able to edit the workflow title inline

**When** I click "Read Mode"

**Then** I should be redirected to the read view of the workflow



## Scenario: Sidebar navigation


**When** I am in the editor

**Then** I should see the sidebar with workflow navigation

**And** I should see a list of all blocks in the workflow

**And** I should see block hierarchy with proper indentation

**When** I click on a block in the sidebar

**Then** the canvas should center on that block

**And** the block should be highlighted



## Scenario: Canvas interaction


**When** I am in the editor

**Then** I should be able to pan the canvas by dragging

**And** I should be able to zoom in and out using mouse wheel

**And** I should be able to zoom using the zoom controls

**When** I double-click on an empty area

**Then** the canvas should fit all blocks in view



# Block Creation and Management


As a user

I want to create and manage different types of blocks

So that I can build comprehensive workflows



Background:

**Given** I am in the workflow editor

**And** I can see the canvas with a "Begin" block



## Scenario: Adding a Step block


**When** I click the "+" button after the Begin block

**Then** I should see the add block dropdown menu

**And** I should at least see the "Step" block option

**When** I select "Step"

**Then** a new Step block should be added to the workflow

**And** the block should have a default title like "Untitled Block"

**And** the block should have a default icon

**And** the dropdown menu should close



## Scenario: Adding a Condition block


**When** I click the "+" button after the Begin block

**And** I select "Condition"

**Then** I should see the "Create a new condition" modal

**When** I enter condition name "Approval Decision"

**And** I enter condition description "Determine if the request is approved or rejected"

**And** I add path names "Approved" and "Rejected"

**And** I click "Create Paths"

**Then** the modal should close

**And** a Condition block should be created

**And** two parallel paths should be created with the specified names

**And** each path should have its own branch on the canvas



## Scenario: Adding a Delay block


**When** I click the "+" button after a Step block

**And** I select "Delay"

**Then** I should see the delay type selection modal

**When** I select "Fixed Duration"

**Then** I should see the fixed delay configuration modal

**When** I set the delay to 2 hours and 30 minutes

**And** I click "Create Delay"

**Then** a Fixed Delay block should be added

**And** the block should display "2h 30m" as the delay time



## Scenario: Adding an Event Delay block


**When** I click the "+" button after a Step block

**And** I select "Delay"

**And** I select "Wait For Event"

**Then** I should see the event delay configuration modal

**When** I enter event name "Client Response"

**And** I set maximum wait time to 3 days

**And** I click "Create Delay"

**Then** an Event Delay block should be added

**And** the block should display "Wait for Client Response (max 3 days)"



## Scenario: Adding an End block


**Given** I have a workflow with multiple blocks

**When** I click the "+" button after the last block in a path

**Then** I should see the add block dropdown menu

**And** I should see an "End Block" option

**When** I select "End Block"

**Then** an End block should be added





# Block Editing and Properties


As a user

I want to edit block properties and content

So that I can provide detailed information for each step



Background:

**Given** I am in the workflow editor

**And** I have a Step block on the canvas



## Scenario: Opening block details sidebar


**When** I click on a Step block

**Then** the block details sidebar should open on the right

**And** I should see the block's current title

**And** I should see the block's icon

**And** I should see fields for description, average time, and media

**And** I should see a close button

**And** when I click on the canvas, the sidebar should close



## Scenario: Editing block title


**When** I open the block details sidebar

**And** I click on the block title

**Then** the title should become editable

**When** I change the title to "Review Application"

**Then** the title should be updated

**And** the sidebar should show the new title

**And** the block on the canvas should show the new title



## Scenario: Editing block description


**When** I open the block details sidebar

**And** I click in the description area

**Then** the description field should become editable

**When** I enter "Review the submitted application for completeness and accuracy"

**And** I click outside the description field

**Then** the description should be saved

**And** the description should be visible in the sidebar



## Scenario: Changing block icon


**When** I open the block details sidebar

**And** I click on the block icon

**Then** I should see the icon selection modal

**And** I should see tabs for "Icons", "Apps", and "Upload"

**When** I select an icon from the Icons tab

**Then** the icon should be applied to the block

**And** the modal should close

**And** the block should display the new icon



## Scenario: Adding block media


**When** I open the block details sidebar

**And** I click in the media section

**Then** I should see a file upload area

**When** I drag and drop an image file

**Then** the image should be uploaded

**And** the image should be displayed in the media section

**And** I should see options to edit or remove the image



## Scenario: Editing block media


**Given** I have a block with an uploaded image

**When** I open the block details sidebar

**And** I click the edit button on the image

**Then** I should see the image editor modal

**When** I make edits to the image

**And** I click "Save"

**Then** the edited image should be saved

**And** the original image should be preserved for reset option



# Block Actions and Context Menu


As a user

I want to perform various actions on blocks

So that I can efficiently manage my workflow



Background:

**Given** I am in the workflow editor

**And** I have multiple blocks in my workflow



## Scenario: Block context menu


**When** I click the three dots menu on a Step block

**Then** I should see a context menu with options

**And** I should see "Edit", "Copy", "Delete", "Connect Blocks", and "Copy Link" options



## Scenario: Copying a block


**When** I click the three dots menu on a Step block

**And** I select "Copy"

**Then** the block should be copied to the clipboard

**And** I should see a "Block copied" notification



## Scenario: Pasting a block


**Given** I have copied a block to the clipboard

**When** I click the "+" button at any position

**Then** I should see a "Paste Block" option in the dropdown

**When** I select "Paste Block"

**Then** a copy of the block should be created at that position

**And** the new block should have "(copy)" appended to its title



## Scenario: Deleting a block


**When** I click the three dots menu on a Step block

**And** I select "Delete"

**Then** I should see a confirmation modal

**When** I confirm the deletion

**Then** the block should be removed from the workflow

**And** subsequent blocks should move up to fill the gap



## Scenario: Connecting blocks with stroke lines


**When** I click the three dots menu on a Step block

**And** I select "Connect Blocks"

**Then** I'll see a modal with a search bar

**When** I search for a block

**Then** I should see the block in the search results

**When** I click on the block

**Then** I should see the connection modal

**When** I enter a connection label "If rejected"

**And** I click "Connect"

**Then** a stroke line should be created between the blocks

**And** the line should display the label



# Path Management and Conditions


As a user

I want to create and manage conditional paths

So that I can model complex decision-based workflows



Background:

**Given** I am in the workflow editor

**And** I have a workflow with at least one Condition block



## Scenario: Editing existing paths


**Given** I have a Condition block with 3 paths

**When** I click the three dots menu on the Condition block

**And** I select "Edit"

**Then** I should see the "Update Paths" modal

**And** I should see the current paths listed

**When** I modify a path name from "Approved" to "Fully Approved"

**And** I add a new path "Conditionally Approved"

**And** I remove the "Rejected" path

**And** I click "Update Paths"

**Then** the paths should be updated accordingly

**And** the workflow should reflect the changes



## Scenario: Merging paths


**Given** I have multiple parallel paths that need to converge

**When** I click the three dots menu on the last step block of a path

**And** I select "Merge Paths"

**Then** I should enter merge mode

**And** I should see path selection indicators

**When** I select the paths I want to merge

**And** I click "Merge Selected Paths"

**Then** the selected paths should converge into a single path



## Scenario: Path labels and editing


**Given** I have conditional paths

**When** I click on a path label

**Then** the label should become editable

**When** I change the label text

**And** I press Enter or I click outside the label

**Then** the label should be updated

**And** the change should be reflected in the workflow



# Stroke Lines and Connections


As a user

I want to create custom connections between blocks

So that I can model complex workflows with loops and non-linear flows



Background:

**Given** I am in the workflow editor

**And** I have multiple blocks in different paths



## Scenario: Creating a stroke line connection


**When** I click the three dots menu on a source block

**And** I select "Connect Blocks"

**Then** I should enter connection mode

**When** I click on a target block

**Then** I should see the connection modal

**And** I should see the source and target blocks highlighted

**When** I enter connection label "Return for revision"

**And** I click "Create Connection"

**Then** a stroke line should be drawn between the blocks

**And** the line should display the label



## Scenario: Deleting stroke lines


**Given** I have a stroke line connection

**When** I click on the stroke line

**And** I select "Delete"

**Then** I should see a confirmation modal

**When** I confirm the deletion

**Then** the stroke line should be removed

**And** the connection should no longer exist



## Scenario: Stroke line visibility toggle


**Given** I have multiple stroke lines in my workflow

**When** I click the stroke lines visibility toggle

**Then** all stroke lines should be hidden

**When** I click the toggle again

**Then** all stroke lines should be visible again



## Scenario: Editing stroke line control points


**Given** I have a stroke line with a curved path

**When** I hover over the stroke line

**Then** I should see control points for adjusting the curve

**When** I drag a control point

**Then** the stroke line path should adjust accordingly

**And** the new path should be saved



# Sidebar Navigation and Block Management


As a user

I want to navigate and manage blocks through the sidebar

So that I can efficiently work with large workflows



Background:

**Given** I am in the workflow editor

**And** I have a complex workflow with multiple paths and blocks



## Scenario: Sidebar block hierarchy


**When** I look at the sidebar

**Then** I should see all blocks organized hierarchically

**And** I should see proper indentation for nested paths

**And** I should see block icons and titles

**And** I should see block duration estimates



## Scenario: Sidebar search functionality


**When** I enter "approval" in the sidebar search box

**Then** only blocks containing "approval" should be visible

**And** other blocks should be filtered out

**When** I clear the search

**Then** all blocks should be visible again



## Scenario: Sidebar block navigation


**When** I click on a block in the sidebar

**Then** the canvas should center on that block

**And** the block should be highlighted

**And** I should see the block details sidebar open on the right



## Scenario: Sidebar path collapsing


**Given** I have paths with multiple nested blocks

**When** I click the collapse arrow next to a path

**Then** the path's child blocks should be hidden

**When** I click the expand arrow

**Then** the child blocks should be visible again



# Canvas Interaction and Navigation


As a user

I want to interact with the canvas effectively

So that I can navigate and work with large workflows



Background:

**Given** I am in the workflow editor

**And** I have a workflow with multiple blocks



## Scenario: Canvas panning and zooming


**When** I drag on an empty area of the canvas

**Then** the canvas should pan in the direction of the drag

**When** I use the mouse wheel

**Then** the canvas should zoom in or out

**When** I use the zoom controls

**Then** the canvas should zoom to the specified level



# Zoom and View Controls


As a user

I want to control the view and zoom level

So that I can work effectively with workflows of different sizes



Background:

**Given** I am in the workflow editor



## Scenario: Zoom controls functionality


**When** I click the zoom in button

**Then** the canvas should zoom in by a standard increment

**When** I click the zoom out button

**Then** the canvas should zoom out by a standard increment

**When** I click the zoom percentage

**Then** I should see a dropdown with preset zoom levels

**When** I select "50%" from the dropdown

**Then** the canvas should zoom to 50%



## Scenario: Zoom limits


**When** I zoom in to the maximum level

**Then** the zoom in button should be disabled

**When** I zoom out to the minimum level

**Then** the zoom out button should be disabled



## Scenario: Zoom to fit


**Given** I have a large workflow that extends beyond the visible area

**When** I click "Zoom to fit"

**Then** the entire workflow should be visible

**And** the zoom level should adjust automatically



# Documentation and Help


As a user

I want to access help and documentation

So that I can learn how to use the editor effectively



Background:

**Given** I am in the workflow editor



## Scenario: Accessing documentation


**When** I click the help or documentation button

**Then** I should see the documentation modal

**And** I should see tabs for different block types

**And** I should see "Step", "Delay", "Link", "Condition", "Merge", "Path Labels", and "End" tabs



## Scenario: Documentation content


**When** I open the documentation modal

**And** I click on the "Step" tab

**Then** I should see information about Step blocks

**And** I should see "When to use" guidance

**And** I should see "How to add" instructions

**When** I click on the "Delay" tab

**Then** I should see information about both Fixed Duration and Wait For Event delays



## Scenario: Documentation search


**When** I open the documentation modal

**And** I enter "condition" in the search box

**Then** I should see only documentation related to conditions

**And** irrelevant tabs should be filtered out



# Error Handling and Validation


As a user

I want the editor to handle errors gracefully

So that I can continue working even when issues occur



Background:

**Given** I am in the workflow editor



## Scenario: Network connectivity issues


**When** I lose network connectivity

**And** I try to create a new block

**Then** I should see an error message like "Something went wrong. Please try again."

**And** the action should not complete

**When** connectivity is restored

**Then** I should be able to retry the action



## Scenario: Path creation validation


**When** I try to create parallel paths with empty names

**Then** I should see validation errors

**And** the "Create Paths" button should be disabled

**When** I provide valid path names

**Then** the validation should clear

**And** I should be able to create the paths

<!-- AUTO-GENERATED END -->