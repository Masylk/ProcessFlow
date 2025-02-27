import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type');
    const pathId = parseInt(params.id);

    if (!type || isNaN(pathId)) {
      return NextResponse.json(
        { error: 'Missing type parameter or invalid path ID' },
        { status: 400 }
      );
    }

    const block = await prisma.block.findFirst({
      where: {
        path_id: pathId,
        type: type as any,
      },
    });

    if (!block) {
      return NextResponse.json(
        { error: `No block of type ${type} found in path ${pathId}` },
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