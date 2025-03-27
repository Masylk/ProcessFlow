import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { NextRequest } from 'next/server';

export async function GET(
  req: NextRequest,
  props: { params: Promise<{ workflow_id: string }> }
) {
  try {
    const params = await props.params;
    const workflowId = parseInt(params.workflow_id);

    const workflow = await prisma.workflow.findUnique({
      where: { id: workflowId },
      select: {
        id: true,
        name: true,
        description: true,
        workspace_id: true,
        workspace: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!workflow) {
      return new NextResponse(null, { status: 404 });
    }

    return NextResponse.json(workflow);
  } catch (error) {
    console.error('Error fetching workflow:', error);
    return new NextResponse(null, { status: 500 });
  }
}
