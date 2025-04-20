import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const public_access_id = searchParams.get('public_access_id');
    const name = searchParams.get('name');

        if (!public_access_id || !name) {
      return NextResponse.json(
        { error: 'Public access ID and workflow name are required' },
        { status: 400 }
      );
    }

    const workflow = await prisma.workflow.findFirst({
      where: {
        public_access_id,
        is_public: true,
        name,
      },
      include: {
        workspace: {
          select: {
            id: true,
            name: true,
          },
        },
        folder: {
          select: {
            id: true,
            name: true,
            parent: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        author: {
          select: {
            full_name: true,
            avatar_url: true,
          },
        },
      },
    });

    if (!workflow) {
        return NextResponse.json(
        { error: 'Workflow not found or not public' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(workflow);
  } catch (error) {
    console.error('Error fetching public workflow:', error);
    return NextResponse.json(
      { error: 'Failed to fetch workflow' },
      { status: 500 }
    );
  }
} 