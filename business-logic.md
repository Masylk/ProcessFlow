# Business Logic ProcessFlow

# 0. Glossary

- **Flow**: A flow corresponds to a process.
- **Block**: A block is an element in which the user can describe what action to take in their process. It can include an image, title, or description. There is a hierarchical logic with parent blocks and child blocks.
- **Path**: A path is the route where the block is located. Paths can have names.
- **SOP (Standard Operating Procedure)**: A document within a company that compiles the standard procedures used within the company.
- **Step**: A step corresponds to a stage; each stage contains a block.
- **PF**: ProcessFlow.

# 1. Introduction

This document aims to catalog all the business logic of Flows.

ProcessFlow include and edit mode and a read mode :

- **Edit mode** : The user can create a full process using paths we saw on “2. Blocks and Paths Types”. The user is restricted by rules detailed below.
- **Read mode** : The user can switch to this mode to visualize his process in a “one way document” which mean user will select which path he would like to use in order to follow the processus. The user can share the link of this view or share an embed link in order to set this up to a documentation.

There are no technical limitations on workflow complexity, including number of condition paths or total workflow size.

# 2. Blocks and Paths Types

- **Step :** Create a unique path with a block at the end. This block can contain:
    - A title
    - A description
    - An image
        
- **Conditional Path :** The user can choose how many paths they wish to create, and they can also choose whether to name them or not. Paths are created with the desired number, with a block at the end of each path.

- **Stroke Line** : You can create a stroke line to clearly identify a connection to an upper or same level block.


- **Merge Functionality** : The user can choose to merge two paths or more in one path.

- **Delay :** The user can choose a predetermined duration or a custom duration. Then create a line that connects to a block with a slightly different design from other blocks.
    - Delay block has 2 modes:
        - “Fixed Duration” → Just select a duration. It’s a rigid duration obligated to respect.
                        
        - “Wait For Event” → Must also precise an event, it can be more flexible and have this utility : “Wait for the client respond in max 7 days”. So if the even happen before you can proceed.

- **Start Block** : The start block is the block that is added by default to each new Flow. It cannot be deleted or modified, and there can only be one per Flow.

- **End Block:** The user can create this end block. It is purely visual and serves to close a path.

# 3. Business Logic

# Start Block:

1. Definition: A Start Block marks the beginning of a workflow process and serves as the entry point.
2. Uniqueness: Each workflow must have exactly one Start Block, created automatically when the workflow is initiated.
3. Deletion Protection: Start Blocks cannot be deleted through the user interface. This is enforced through application logic.
4. Modification Restrictions: Users can’t changes the label of the Start Block and the label is always “This is where your process starts”
5. Connection Direction: Start Blocks can only have outgoing connections in normal workflows.
6. Read Mode : The Start Block does not appear on the Read Mode

# End Block:

- Purpose: Represent a true process terminus with no further actions
- Visual: Displayed with no possibilities to create anything after to indicate finality
- Connections: Can only have incoming connections
- Quantity: Multiple End blocks can exist in a single workflow
- Read Mode: End block are not rendered in the Read Mode
- Deletion: End Blocks can be deleted

# Last Block:

### Definition and Purpose

- A LAST block represents the termination point of a workflow path that can be extended.
- Unlike END blocks which represent true process termini, LAST blocks serve as interactive endpoints where users can continue building the workflow.
- LAST blocks are automatically positioned at the end of every path that doesn't already terminate in another end-type block (END or MERGE).
- They provide a visual indication that the path can be extended, offering users an intuitive way to add new blocks.

### Interaction Behavior

- Clicking on the "+" button associated with a LAST block opens the block creation interface.
- Users can select the type of block they wish to add (STEP, DELAY, PATH) to continue building the workflow.
- When a new block is added through the LAST block interface, the LAST block automatically repositions itself after the newly added block.
- This creates a continuous building experience where the LAST block is always available for further workflow extension.

### System Rules

- LAST blocks cannot be manually deleted - they are system-managed elements.
- When a path is merged with another path, its LAST block is automatically removed.
- If all blocks in a path are deleted except the BEGIN block, a LAST block is automatically regenerated.
- LAST blocks do not appear in Read Mode, as they are strictly editing interface elements.
- Like other end-type blocks, LAST blocks can only have incoming connections in the workflow hierarchy.

# Path Direction Rules:

1. Vertical Layout:
    - Workflows automatically follow a hierarchical progression from top to bottom for improved readability
    - The layout engine automatically positions blocks to maintain this vertical flow using Elksjs Tree in ReactFlow
    - Users cannot arbitrarily position blocks outside this hierarchical structure
2. Connection Constraints:
    - Regular blocks can only connect to blocks further down in the workflow hierarchy
    - Blocks cannot connect directly to themselves through regular connections
    - Self-connections are only possible using stroke lines

# Conditional Paths Rules:

1. Definition and Purpose:
    - Conditional paths create branching workflows where users can follow different paths based on specific conditions
    - Each conditional path represents a decision point in the process
2. Path Requirements:
    - Each conditional path must have at least two outgoing paths (branches)
    - The minimum of two paths is enforced by the UI and cannot be reduced
    - Path names are displayed to users to help them understand the branching options
3. User Navigation:
    - In read mode, users select which path to follow based on their specific scenario. The label of the path will be displayed in the condition, if the user select a path, the next display will be the first block on this path.
    - The system presents path options as clickable choices
    - Users can navigate back to the decision point to explore alternative paths

# Merge Functionality:

1. Definition and Purpose:
    - Merge functionality allows combining multiple workflow paths into a single path
    - Merges create a visual indication of path convergence in the workflow
    - After merging, the workflow continues as a single path
    - Merge paths don’t have any label
2. Merge Requirements:
    - Only paths of the same hierarchical level and same parent branch can be merged
    - "Same hierarchical level" means paths that branched from the same parent conditional path
    - At least two paths must be merged together (minimum of two incoming connections)
3. Post-Merge Behavior:
    - After merging, the workflow continues as a single path
    - This merged path can contain additional blocks of any type
4. Technical Implementation:
    - Merge operations create path_parent_block relationships between the parent paths' end blocks and the new merged path
    - These relationships enable the visual representation of convergence
    - The parent paths remain in the workflow but visually connect to the merged path

# Stroke Line Rules:

1. Definition and Purpose:
    - Stroke lines are special connections that allow linking blocks outside the normal workflow hierarchy
    - They appear as pink dashed lines with directional arrows
2. Connection Constraints:
    - Stroke lines cannot connect to Start Blocks, as this would create invalid workflow entry points
    - There is no limit to the number of stroke lines in a workflow
3. Loop and Cycle Creation:
    - Stroke lines can create cycles or loops in the workflow
    - Self-loops (connecting a block to itself) are supported with special curved rendering
    - Multi-block loops (connecting through several blocks back to an earlier point) are also supported
    - Loops should be used judiciously to avoid confusing workflows
4. Visual Representation:
    - Stroke lines appear as pink dashed lines with arrow indicators showing direction
    - They follow orthogonal routing (right-angled paths) rather than diagonal lines
    - When selected, stroke lines show control points that can be manipulated
    - Stroke lines MUST have text labels to describe their purpose or condition
5. Path Customization:
    - Users can customize stroke line paths using control points
    - Control points can be dragged to adjust the exact routing of the line
    - The system maintains orthogonal paths (right angles) even when customized
    - Paths automatically adjust when blocks are moved
6. Labeling:
    - Each stroke line MUST have a text label explaining its purpose
    - Labels appear when hovering over the stroke line
    - Labels should be concise and descriptive (e.g., "Return to review", "Skip if urgent")
7. Read Mode:
    - In the Read Mode, the Stroke line looks like a condition and on the choice, the label of the stroke line can be selected

# Delay Block Rules:

1. Delay Types:
    - Delays come in two distinct types:
    a) Fixed Duration: Simulate a pause in the workflow for a specified time period
    b) Wait for Event: Simulate a pause in the workflow until a specific event occurs, with optional timeout
    - Fixed Duration delays always require a time specification (minutes, hours, days)
    - Wait for Event delays require an event name and optionally include an expiration time
2. Delay Configuration:
    - Time can be specified in minutes, hours, and days in any combination
    - Wait for Event delays require a descriptive event name (e.g., "Customer approves quote")
    - Expiration times for Wait for Event delays are optional but recommended
3. Placement Rules:
    - Delays can be placed at any point in a workflow path
    - Delays can serve as final elements in a path (e.g., for waiting periods after task completion)

# 6. Documentation in app

Here’s the current documentation in app to help users with the features of ProcessFlow.

### **Delay Block :**

The **Delay Block** allows you to introduce waiting periods into your Flow. This is essential for modeling real-world scenarios where tasks may require waiting for specific durations or external events before proceeding. There is 2 type of delay block :
**Fixed Duration Delay**

A strict waiting period that must be fully completed before the process can continue.

When to use:

- Mandatory waiting periods (e.g., "Wait 24 hours for the solution to set")
- Regulatory holding periods (e.g., "Wait 7 days before processing the refund")

**Wait For Event**

A flexible waiting period that concludes when either an external event occurs or a maximum time limit is reached.

When to use:

- Client responses (e.g., "Wait for client feedback for up to 3 days")
- Approval workflows (e.g., "Wait for manager approval within 48 hours")
- Conditional actions (e.g., "Wait for payment confirmation for up to 7 days")

How to add :

1. Click on the “+” to add a new step to your flow
2. Select the delay block
3. Setup your delay block

### **End Block :**

The **End Block** represents the final point of a process path. Unlike the Start block (which is automatically added to every workflow and cannot be deleted), End blocks are optional visual elements that help users clearly identify where specific paths terminate.

When to use:

- At the conclusion of every meaningful path in your workflow
- To mark different possible outcomes of a process (e.g., "Application Approved," "Application Rejected")
- When documenting process termination points for compliance or training purposes
- To make complex workflows with multiple branches easier to understand

How to add :

1. Click on the “+” to add a new step to your flow
2. Select the End block, which will only be visible if there are no steps below the current one.

### **Link :**

The Link allows you to create connections between blocks that don't follow the standard top-to-bottom flow. This is essential for representing complex processes that include cycles, loops, decision points with returns to previous steps, or any non-linear flow.

When to use :

- To create loops (e.g., "If document needs revision, return to Step 2")
- To represent conditional returns to earlier steps (e.g., "If application is incomplete, return to data collection")
- When a process requires jumping between different sections based on specific conditions
- To simplify complex workflows by avoiding redundant steps

How to add :

- Click on the three dot on a step block, it will open a menu.
- Select “connect blocks”
- Click on the source block (where the link starts)
- Click on the target block (where the link ends)
- Add an optional label to describe the purpose of the connection

### **Merge Paths :**

The Merge Paths allows you to unify multiple paths back into a single path, making it essential for workflows where different conditions or parallel processes eventually converge to a common next step. This creates cleaner, more maintainable processes by avoiding redundant blocks after decision points.

When to use:

- After conditional paths that eventually lead to the same next steps
- When multiple approval or review paths converge to a common outcome
- To simplify workflow visualization by reducing redundant blocks

How to add :

- Click on the three dot on a step block, it will open a menu.
- Select “Merge paths”
- Choose the paths you want to merge (it can only be the paths on the same path and at the same level).
- Click on “Merge Paths” once you’ve choose your block to merge.

### Step Block :

The Step Block is the fundamental building block of any Flow. It represents a single action, task, or stage in your process and provides detailed information to help users understand exactly what needs to be done.

When to use:

- To break down complex processes into understandable segments
- When users need clear guidance with visual support
- As the primary building blocks of straightforward, linear processes

How to add :

- Click on the “+” to add a new step to your flow
- Select the “Step”

### **Conditional Paths :**

The Conditional Path functionality enables you to create multiple alternative paths in your workflow based on different scenarios, decisions, or conditions. This powerful feature allows your processes to adapt to varying circumstances, making them more flexible and realistic.

When to use :

- When a process can take different routes based on specific criteria
- For approval workflows with "approved" and "rejected" outcomes
- When representing decision trees with multiple possible answers
- When documenting exception handling in standard procedures
- For compliance documentation that covers multiple scenarios

How to add :

- Click on the “+” to add a new step to your flow
- Select the “Condition”

### Path Labels :

Path Labels are descriptive text elements that identify the different options at decision points in your workflow. They appear on Conditional Paths and Link Lines, providing clear guidance to users when they need to make selections in Read Mode.

When to use :

- On all conditional paths to clearly distinguish between options
- When creating interactive processes where users select their own path
- When documenting decision trees with multiple options
- For any workflow where users need to make choices based on specific criteria

How to add :

- Label are automatically added on path when needed
- You can always modify the text on it