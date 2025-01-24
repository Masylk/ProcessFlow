import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(req: NextRequest) {
  const { name, workspaceId } = await req.json();

  // Create a new workflow
  const newWorkflow = await prisma.workflow.create({
    data: {
      name,
      workspace: {
        connect: { id: workspaceId }, // Use the `connect` syntax to link the workspace
      },
    },
  });

  return NextResponse.json(newWorkflow);
}
