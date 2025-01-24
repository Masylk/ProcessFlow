// app/api/team/[id]/workspaces/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const team_id = parseInt(params.id);
  const workspaces = await prisma.workspace.findMany({
    where: {
      team_id,
    },
  });
  return NextResponse.json(workspaces);
}
