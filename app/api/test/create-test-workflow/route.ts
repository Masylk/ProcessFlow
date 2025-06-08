import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { PrismaClient } from '@prisma/client';
import { isVercel } from '@/app/api/utils/isVercel';
import { generatePublicAccessId } from '@/app/api/workflow/utils';

interface CreateTestWorkflowRequest {
  workspaceId: number;
  workflowName?: string;
  authorId?: number;
}

export async function POST(req: NextRequest) {
  const prisma_client = isVercel() ? new PrismaClient() : prisma;
  if (!prisma_client) {
    throw new Error('Prisma client not initialized');
  }

  try {
    const { 
      workspaceId, 
      workflowName = 'Test Workflow', 
      authorId 
    }: CreateTestWorkflowRequest = await req.json();

    if (!workspaceId) {
      return NextResponse.json({ error: 'workspaceId is required' }, { status: 400 });
    }

    // Check if workspace exists
    const workspace = await prisma_client.workspace.findUnique({
      where: { id: workspaceId }
    });

    if (!workspace) {
      return NextResponse.json({ error: 'Workspace not found' }, { status: 404 });
    }

    // Create unique workflow name
    let uniqueName = workflowName;
    let counter = 1;
    
    while (true) {
      const existingWorkflow = await prisma_client.workflow.findUnique({
        where: {
          name_workspace_id: {
            name: uniqueName,
            workspace_id: workspaceId
          }
        }
      });
      
      if (!existingWorkflow) break;
      
      uniqueName = `${workflowName} (${counter})`;
      counter++;
    }

    // Create the workflow
    const workflow = await prisma_client.workflow.create({
      data: {
        name: uniqueName,
        description: 'Test workflow for Cucumber tests',
        icon: '🔧',
        workspace_id: workspaceId,
        author_id: authorId,
        is_public: true,
        status: 'ACTIVE',
        public_access_id: await generatePublicAccessId(uniqueName, 0, workspaceId)
      }
    });

    // Create default path
    const defaultPath = await prisma_client.path.create({
      data: {
        name: 'Main Path',
        workflow_id: workflow.id
      }
    });

    // Create BEGIN block
    const beginBlock = await prisma_client.block.create({
      data: {
        type: 'BEGIN',
        position: 0,
        title: 'Start',
        description: 'Beginning of the workflow',
        workflow_id: workflow.id,
        path_id: defaultPath.id
      }
    });

    // Create END block
    const endBlock = await prisma_client.block.create({
      data: {
        type: 'END',
        position: 1,
        title: 'End',
        description: 'End of the workflow',
        workflow_id: workflow.id,
        path_id: defaultPath.id
      }
    });

    return NextResponse.json({
      success: true,
      workflow: {
        id: workflow.id,
        name: workflow.name,
        public_access_id: workflow.public_access_id,
        workspace_id: workflow.workspace_id
      },
      blocks: {
        begin: beginBlock.id,
        end: endBlock.id
      },
      path: {
        id: defaultPath.id,
        name: defaultPath.name
      }
    });

  } catch (error) {
    console.error('Error creating test workflow:', error);
    return NextResponse.json(
      { error: 'Failed to create test workflow' },
      { status: 500 }
    );
  } finally {
    if (isVercel()) {
      await prisma_client.$disconnect();
    }
  }
}