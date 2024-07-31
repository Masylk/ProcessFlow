// app/api/team/[id]/workspaces/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma'

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const teamId = parseInt(params.id);
  const workspaces = await prisma.workspace.findMany({
    where: {
      teamId,
    },
  });
  return NextResponse.json(workspaces);
}
