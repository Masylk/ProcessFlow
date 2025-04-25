import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { Prisma } from '@prisma/client';

/**
 * API route to create a default workflow by duplicating an existing workflow
 * This will copy a template workflow (id: 257 from workspace: 52) to the specified workspace
 */
export async function POST(req: NextRequest) {
  try {
    const { workspaceId, userId } = await req.json();

    if (!workspaceId) {
      return NextResponse.json(
        { error: 'Workspace ID is required' },
        { status: 400 }
      );
    }

    // Source workflow details - the workflow we want to duplicate
    const SOURCE_WORKFLOW_ID = 257;
    const SOURCE_WORKSPACE_ID = 52;

    // Get the source workflow with all related components
    const sourceWorkflow = await prisma.workflow.findUnique({
      where: {
        id: SOURCE_WORKFLOW_ID,
        workspace_id: SOURCE_WORKSPACE_ID,
      },
      include: {
        paths: {
          include: {
            blocks: {
              include: {
                child_paths: true,
              },
              orderBy: {
                position: 'asc',
              },
            },
            parent_blocks: true,
          },
        },
        stroke_lines: true,
      },
    });

    if (!sourceWorkflow) {
      return NextResponse.json(
        { error: 'Source workflow not found' },
        { status: 404 }
      );
    }

    // Check if target workspace exists
    const targetWorkspace = await prisma.workspace.findUnique({
      where: { id: workspaceId },
    });

    if (!targetWorkspace) {
      return NextResponse.json(
        { error: 'Target workspace not found' },
        { status: 404 }
      );
    }

    // Generate a unique name for the new workflow
    let newWorkflowName = "Getting Started with ProcessFlow";
    let counter = 1;
    let nameIsUnique = false;

    while (!nameIsUnique) {
      const existingWorkflow = await prisma.workflow.findUnique({
        where: {
          name_workspace_id: {
            name: newWorkflowName,
            workspace_id: workspaceId,
          },
        },
      });

      if (!existingWorkflow) {
        nameIsUnique = true;
      } else {
        newWorkflowName = `Getting Started with ProcessFlow (${counter})`;
        counter++;
      }
    }

    // Create the workflow and all components without using a transaction for now
    // This avoids the transaction timeout issues that can occur with complex operations
    
    // 1. Create the new workflow in the target workspace
    const newWorkflow = await prisma.workflow.create({
      data: {
        name: newWorkflowName,
        description: sourceWorkflow.description,
        icon: sourceWorkflow.icon,
        is_public: sourceWorkflow.is_public,
        status: sourceWorkflow.status,
        team_tags: sourceWorkflow.team_tags,
        workspace: {
          connect: { id: workspaceId },
        },
        author: userId ? {
          connect: { id: userId },
        } : undefined,
      },
    });

    // 2. Map for tracking old path IDs to new path IDs
    const pathIdMap = new Map();
    
    // 3. Create paths
    for (const sourcePath of sourceWorkflow.paths) {
      const newPath = await prisma.path.create({
        data: {
          name: sourcePath.name,
          workflow: {
            connect: { id: newWorkflow.id },
          },
        },
      });
      
      pathIdMap.set(sourcePath.id, newPath.id);
    }

    // 4. Map for tracking old block IDs to new block IDs
    const blockIdMap = new Map();

    // 5. Create blocks for each path
    for (const sourcePath of sourceWorkflow.paths) {
      const newPathId = pathIdMap.get(sourcePath.id);
      
      for (const sourceBlock of sourcePath.blocks) {
        const newBlock = await prisma.block.create({
          data: {
            type: sourceBlock.type,
            position: sourceBlock.position,
            title: sourceBlock.title,
            icon: sourceBlock.icon,
            description: sourceBlock.description,
            image: sourceBlock.image,
            original_image: sourceBlock.original_image,
            image_description: sourceBlock.image_description,
            average_time: sourceBlock.average_time,
            task_type: sourceBlock.task_type,
            click_position: sourceBlock.click_position || undefined,
            delay_seconds: sourceBlock.delay_seconds,
            step_details: sourceBlock.step_details,
            delay_event: sourceBlock.delay_event,
            delay_type: sourceBlock.delay_type,
            workflow: {
              connect: { id: newWorkflow.id },
            },
            path: {
              connect: { id: newPathId },
            },
          },
        });
        
        blockIdMap.set(sourceBlock.id, newBlock.id);
      }
    }

    // 6. Create path_parent_block relationships
    for (const sourcePath of sourceWorkflow.paths) {
      const newPathId = pathIdMap.get(sourcePath.id);
      
      for (const parentBlock of sourcePath.parent_blocks) {
        const newBlockId = blockIdMap.get(parentBlock.block_id);
        
        if (newBlockId && newPathId) {
          await prisma.path_parent_block.create({
            data: {
              path_id: newPathId,
              block_id: newBlockId,
            },
          });
        }
      }
    }

    // 7. Create stroke lines
    for (const sourceStrokeLine of sourceWorkflow.stroke_lines) {
      const newSourceBlockId = blockIdMap.get(sourceStrokeLine.source_block_id);
      const newTargetBlockId = blockIdMap.get(sourceStrokeLine.target_block_id);
      
      if (newSourceBlockId && newTargetBlockId) {
        await prisma.stroke_line.create({
          data: {
            label: sourceStrokeLine.label,
            is_loop: sourceStrokeLine.is_loop,
            control_points: sourceStrokeLine.control_points || undefined,
            source_block: {
              connect: { id: newSourceBlockId },
            },
            target_block: {
              connect: { id: newTargetBlockId },
            },
            workflow: {
              connect: { id: newWorkflow.id },
            },
          },
        });
      }
    }

    return NextResponse.json({
      success: true,
      workflow: newWorkflow,
    });
  } catch (error) {
    console.error('Error creating default workflow:', error);
    return NextResponse.json(
      { 
        error: 'Failed to create default workflow',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
} 