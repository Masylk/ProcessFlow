import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma'; // Adjust the path to where you initialize Prisma in your project

export async function PATCH(req: NextRequest) {
  try {
    const { workflowId } = await req.json();

    if (!workflowId) {
      return NextResponse.json(
        { error: 'Missing workflowId' },
        { status: 400 }
      );
    }

    const updatedWorkflow = await prisma.workflow.update({
      where: { id: workflowId },
      data: { last_opened: new Date() },
    });

    return NextResponse.json({
      message: 'Last opened updated',
      workflow: updatedWorkflow,
    });
  } catch (error) {
    console.error('Error updating last_opened:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
