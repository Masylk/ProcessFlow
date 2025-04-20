import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { generatePublicAccessId } from '../utils';

export async function PATCH(req: NextRequest) {
  try {
    const workflow_id = req.nextUrl.pathname.split('/').pop();
    if (!workflow_id) {
      return NextResponse.json({ error: 'Workflow ID is required' }, { status: 400 });
    }

    const data = await req.json();
    
    const updatedWorkflow = await prisma.workflow.update({
      where: { id: parseInt(workflow_id) },
      data: {
        ...data,
        updated_at: new Date()
      }
    });

    return NextResponse.json(updatedWorkflow);
  } catch (error) {
    console.error('Error updating workflow:', error);
    return NextResponse.json({ error: 'Failed to update workflow' }, { status: 500 });
  }
}

export async function GET(
  req: NextRequest,
  props: { params: Promise<{ workflow_id: string }> }
) {
  try {
    const params = await props.params;
    const workflowId = parseInt(params.workflow_id);

    let workflow = await prisma.workflow.findUnique({
      where: { id: workflowId },
      select: {
        id: true,
        name: true,
        icon: true,
        is_public: true,
        public_access_id: true,
        description: true,
        workspace_id: true,
        folder: {
          select: {
            id: true,
            name: true,
            parent: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        workspace: {
          select: {
            id: true,
            name: true,
          },
        },
        author: {
          select: {
            full_name: true,
            avatar_url: true,
          },
        },
      },
    });

    if (!workflow) {
      return new NextResponse(null, { status: 404 });
    }

    if (!workflow.public_access_id) {
      const publicId = await generatePublicAccessId(
        workflow.name,
        workflow.id,
        workflow.workspace_id
      );

      workflow = await prisma.workflow.update({
        where: { id: workflowId },
        data: { public_access_id: publicId },
        select: {
          id: true,
          name: true,
          icon: true,
          is_public: true,
          public_access_id: true,
          description: true,
          workspace_id: true,
          folder: {
            select: {
              id: true,
              name: true,
              parent: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
          workspace: {
            select: {
              id: true,
              name: true,
            },
          },
          author: {
            select: {
              full_name: true,
              avatar_url: true,
            },
          },
        },
      });
    }

    return NextResponse.json(workflow);
  } catch (error) {
    console.error('Error fetching workflow:', error);
    return new NextResponse(null, { status: 500 });
  }
} 