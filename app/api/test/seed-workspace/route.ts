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
    let workspace = await prisma.workspace.findFirst({
      where: {
        name,
        user_workspaces: { some: { user_id, role: 'ADMIN' } }
      }
    });
    if (!workspace) {
      // Generate a random slug
      let slug;
      let isUnique = false;
      while (!isUnique) {
        slug = Math.floor(Math.random() * 1e9).toString();
        const existing = await prisma.workspace.findUnique({ where: { slug } });
        if (!existing) isUnique = true;
      }
      const background_colours = ['#4299E1', '#F56565', '#48BB78'];
      const randomColour = background_colours[Math.floor(Math.random() * background_colours.length)];
      workspace = await prisma.workspace.create({
        data: {
          name,
          slug,
          background_colour: randomColour,
          user_workspaces: {
            create: {
              user_id,
              role: 'ADMIN',
            },
          },
        },
        include: {
          user_workspaces: true,
        },
      });
    }
    return NextResponse.json({ workspace });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message || 'Internal server error' }, { status: 500 });
  } finally {
    if (isVercel()) await prisma.$disconnect();
  }
}

