// app/api/workspace/[id]/workflows/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const workspace_id = parseInt(params.id);
  const workflows = await prisma.workflow.findMany({
    where: {
      workspace_id,
    },
  });
  return NextResponse.json(workflows);
}
