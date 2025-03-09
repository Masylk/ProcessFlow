import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const id = url.searchParams.get('id');
    const pathId = parseInt(id!, 10);

    if (!id || isNaN(pathId)) {
      return NextResponse.json(
        { error: 'Invalid path ID' },
        { status: 400 }
      );
    }

    const path = await prisma.path.findUnique({
      where: { id: pathId },
      include: {
        blocks: {
          orderBy: {
            position: 'asc',
          },
        },
        parent_blocks: true,
      },
    });

    if (!path) {
      return NextResponse.json(
        { error: 'Path not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(path);
  } catch (error) {
    console.error('Error fetching path:', error);
    return NextResponse.json(
      { error: 'Failed to fetch path' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  props: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const params = await props.params;
    const id = parseInt(params.id);
    const { name } = await req.json();

    if (!name) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      );
    }

    const updatedPath = await prisma.path.update({
      where: { id },
      data: { name },
      include: {
        blocks: {
          orderBy: { position: 'asc' },
          include: {
            child_paths: {
              include: {
                path: true
              }
            }
          }
        }
      }
    });

    return NextResponse.json(updatedPath);
  } catch (error) {
    console.error('Error updating path:', error);
    return NextResponse.json(
      { error: 'Failed to update path' },
      { status: 500 }
    );
  }
}
