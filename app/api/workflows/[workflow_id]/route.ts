import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { NextRequest } from 'next/server';
import { generatePublicAccessId } from '../utils';

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

    // Generate public_access_id if it doesn't exist
    if (!workflow.public_access_id) {
      const publicId = await generatePublicAccessId(
        workflow.name,
        workflow.id,
        workflow.workspace_id
      );

      // Update the workflow with the new public_access_id
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
