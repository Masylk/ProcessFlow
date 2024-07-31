// app/api/workspace/[id]/blocks/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const url = new URL(req.url);
  const workflowId = url.searchParams.get('workflowId');
  const workspaceId = parseInt(params.id);

  if (!workflowId) {
    return NextResponse.json(
      { error: 'workflowId is required' },
      { status: 400 }
    );
  }

  const blocks = await prisma.block.findMany({
    where: {
      workflowId: parseInt(workflowId),
    },
    orderBy: {
      position: 'asc',
    },
  });

  return NextResponse.json(blocks);
}
