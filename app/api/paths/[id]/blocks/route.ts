import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const { id, type } = await req.json(); // Extracting parameters from the request body

    const pathId = parseInt(id, 10);

    // Validate input
    if (!type) {
      return NextResponse.json(
        { error: 'Missing type parameter' },
        { status: 400 }
      );
    }

    if (isNaN(pathId)) {
      return NextResponse.json(
        { error: 'Invalid path ID' },
        { status: 400 }
      );
    }

    // Fetch block from the database
    const block = await prisma.block.findFirst({
      where: {
        path_id: pathId,
        type,
      },
    });

    if (!block) {
      return NextResponse.json(
        { error: `No block of type "${type}" found in path ${pathId}` },
        { status: 404 }
      );
    }

    return NextResponse.json(block);
  } catch (error) {
    console.error('Error fetching block:', error);
    return NextResponse.json(
      { error: 'Failed to fetch block' },
      { status: 500 }
    );
  }
}
