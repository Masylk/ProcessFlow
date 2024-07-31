// app/api/workflows/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(req: NextRequest) {
  const { name, workspaceId } = await req.json();
  const newWorkflow = await prisma.workflow.create({
    data: {
      name,
      workspaceId,
    },
  });
  return NextResponse.json(newWorkflow);
}
