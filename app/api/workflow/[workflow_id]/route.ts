import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

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