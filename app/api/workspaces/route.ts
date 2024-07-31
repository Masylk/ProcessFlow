// app/api/workspaces/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const workspaces = await prisma.workspace.findMany();
  return NextResponse.json(workspaces);
}

export async function POST(req: NextRequest) {
  const { name, teamId } = await req.json();
  const newWorkspace = await prisma.workspace.create({
    data: {
      name,
      teamId: Number(teamId),
    },
  });
  return NextResponse.json(newWorkspace, { status: 201 });
}
