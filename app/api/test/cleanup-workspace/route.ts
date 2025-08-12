import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { isVercel } from '@/app/api/utils/isVercel';

export async function POST(req: NextRequest) {
  const prisma = isVercel() ? new PrismaClient() : require('@/lib/prisma').default;
  const { name, user_id } = await req.json();
  if (!name || !user_id) {
    return NextResponse.json({ error: 'Workspace name and user_id are required' }, { status: 400 });
  }
  try {
    const workspace = await prisma.workspace.findFirst({
      where: {
        name,
        user_workspaces: { some: { user_id, role: 'ADMIN' } }
      }
    });
    if (workspace) {
      await prisma.user_workspace.deleteMany({ where: { workspace_id: workspace.id } });
      await prisma.workspace.delete({ where: { id: workspace.id } });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message || 'Internal server error' }, { status: 500 });
  } finally {
    if (isVercel()) await prisma.$disconnect();
  }
}
