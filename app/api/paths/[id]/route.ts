import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const { id } = await req.json(); // Extracting path ID from the request body
    const pathId = parseInt(id, 10);

    if (isNaN(pathId)) {
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
