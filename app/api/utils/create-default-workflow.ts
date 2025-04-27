import prisma from '@/lib/prisma';

export interface CreateDefaultWorkflowOptions {
  workspaceId: number;
  userId?: number;
}

export async function createDefaultWorkflow({ workspaceId, userId }: CreateDefaultWorkflowOptions) {
  // Source workflow details - the workflow we want to duplicate
  const SOURCE_WORKFLOW_ID = 257;
  const SOURCE_WORKSPACE_ID = 110;

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
    throw new Error(
      `Source workflow not found: ID ${SOURCE_WORKFLOW_ID} in workspace ${SOURCE_WORKSPACE_ID}`
    );
  }

  // Check if target workspace exists
  const targetWorkspace = await prisma.workspace.findUnique({
    where: { id: workspaceId },
  });

  if (!targetWorkspace) {
    throw new Error(`Target workspace not found: ID ${workspaceId}`);
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

  // Track progress and errors that don't prevent completion
  const progressSteps = {
    workflow: false,
    paths: false,
    blocks: false,
    parentBlocks: false,
    strokeLines: false
  };

  const nonFatalErrors = [];
  let newWorkflow;

  // 1. Create the new workflow in the target workspace
  newWorkflow = await prisma.workflow.create({
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
  progressSteps.workflow = true;

  // 2. Map for tracking old path IDs to new path IDs
  const pathIdMap = new Map();

  // 3. Create paths
  try {
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
    progressSteps.paths = true;
  } catch (error) {
    nonFatalErrors.push({
      step: 'paths',
      error: error instanceof Error ? error.message : 'Unknown error creating paths'
    });
  }

  // 4. Map for tracking old block IDs to new block IDs
  const blockIdMap = new Map();

  // 5. Create blocks for each path
  try {
    for (const sourcePath of sourceWorkflow.paths) {
      const newPathId = pathIdMap.get(sourcePath.id);

      if (!newPathId) {
        nonFatalErrors.push({
          step: 'blocks',
          error: `Path ID ${sourcePath.id} not found in map`
        });
        continue;
      }

      for (const sourceBlock of sourcePath.blocks) {
        try {
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
        } catch (blockError) {
          nonFatalErrors.push({
            step: 'block',
            error: `Error creating block ${sourceBlock.id}: ${blockError instanceof Error ? blockError.message : 'Unknown error'}`
          });
        }
      }
    }
    progressSteps.blocks = true;
  } catch (error) {
    nonFatalErrors.push({
      step: 'blocks',
      error: error instanceof Error ? error.message : 'Unknown error creating blocks'
    });
  }

  // 6. Create path_parent_block relationships
  try {
    for (const sourcePath of sourceWorkflow.paths) {
      const newPathId = pathIdMap.get(sourcePath.id);

      if (!newPathId) continue;

      for (const parentBlock of sourcePath.parent_blocks) {
        const newBlockId = blockIdMap.get(parentBlock.block_id);

        if (newBlockId && newPathId) {
          try {
            await prisma.path_parent_block.create({
              data: {
                path_id: newPathId,
                block_id: newBlockId,
              },
            });
          } catch (parentBlockError) {
            nonFatalErrors.push({
              step: 'parentBlock',
              error: `Error creating parent block relationship: ${parentBlockError instanceof Error ? parentBlockError.message : 'Unknown error'}`
            });
          }
        }
      }
    }
    progressSteps.parentBlocks = true;
  } catch (error) {
    nonFatalErrors.push({
      step: 'parentBlocks',
      error: error instanceof Error ? error.message : 'Unknown error creating parent blocks'
    });
  }

  // 7. Create stroke lines
  try {
    for (const sourceStrokeLine of sourceWorkflow.stroke_lines) {
      const newSourceBlockId = blockIdMap.get(sourceStrokeLine.source_block_id);
      const newTargetBlockId = blockIdMap.get(sourceStrokeLine.target_block_id);

      if (newSourceBlockId && newTargetBlockId) {
        try {
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
        } catch (strokeLineError) {
          nonFatalErrors.push({
            step: 'strokeLine',
            error: `Error creating stroke line: ${strokeLineError instanceof Error ? strokeLineError.message : 'Unknown error'}`
          });
        }
      }
    }
    progressSteps.strokeLines = true;
  } catch (error) {
    nonFatalErrors.push({
      step: 'strokeLines',
      error: error instanceof Error ? error.message : 'Unknown error creating stroke lines'
    });
  }

  return {
    success: true,
    workflow: newWorkflow,
    progress: progressSteps,
    warnings: nonFatalErrors.length > 0 ? nonFatalErrors : undefined,
  };
} 