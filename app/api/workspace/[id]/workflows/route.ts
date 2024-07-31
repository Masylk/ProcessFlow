// app/api/workspace/[id]/workflows/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const workspaceId = parseInt(params.id);
  const workflows = await prisma.workflow.findMany({
    where: {
      workspaceId,
    },
  });
  return NextResponse.json(workflows);
}
