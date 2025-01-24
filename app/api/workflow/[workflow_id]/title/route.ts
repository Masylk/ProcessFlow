import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma'; // Adjust the path to where you initialize Prisma in your project

export async function GET(
  req: Request,
  { params }: { params: { workflow_id: string } }
) {
  const workflow_id = parseInt(params.workflow_id);

  if (isNaN(workflow_id)) {
    return NextResponse.json({ error: 'Invalid workflow ID' }, { status: 400 });
  }

  try {
    const workflow = await prisma.workflow.findUnique({
      where: {
        id: workflow_id,
      },
      select: {
        name: true,
      },
    });

    if (!workflow) {
      return NextResponse.json(
        { error: 'Workflow not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ title: workflow.name });
  } catch (error) {
    console.error('Error fetching workflow title:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: Request,
  { params }: { params: { workflow_id: string } }
) {
  const workflow_id = parseInt(params.workflow_id);

  if (isNaN(workflow_id)) {
    return NextResponse.json({ error: 'Invalid workflow ID' }, { status: 400 });
  }

  try {
    const { title } = await req.json();

    const updatedWorkflow = await prisma.workflow.update({
      where: {
        id: workflow_id,
      },
      data: {
        name: title,
      },
    });

    return NextResponse.json({ title: updatedWorkflow.name });
  } catch (error) {
    console.error('Error updating workflow title:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
