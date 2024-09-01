import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// Handle PUT requests to add a related block
export async function PUT(
  req: NextRequest,
  { params }: { params: { pathOptionId: string } }
) {
  try {
    const { pathOptionId } = params;
    const { blockId } = await req.json();

    console.log('Received data:', { pathOptionId, blockId });

    // Validate input
    if (!pathOptionId || !blockId) {
      return NextResponse.json(
        { error: 'PathOptionId and BlockId are required' },
        { status: 400 }
      );
    }

    // Check if the PathOption exists
    const pathOption = await prisma.pathOption.findUnique({
      where: { id: Number(pathOptionId) },
    });

    if (!pathOption) {
      return NextResponse.json(
        { error: 'PathOption not found' },
        { status: 404 }
      );
    }

    // Check if the Block exists
    const block = await prisma.block.findUnique({
      where: { id: Number(blockId) },
    });

    if (!block) {
      return NextResponse.json({ error: 'Block not found' }, { status: 404 });
    }

    // Create or update PathOptionBlock manually
    // First, check if the PathOptionBlock already exists

    // Otherwise, create a new PathOptionBlock
    await prisma.pathOptionBlock.create({
      data: {
        pathOptionId: Number(pathOptionId),
        blockId: Number(blockId),
      },
    });

    return NextResponse.json({ message: 'Related block added successfully' });
  } catch (error) {
    console.error('Error updating PathOption with related block:', error);
    return NextResponse.json(
      { error: 'Failed to update PathOption' },
      { status: 500 }
    );
  }
}

// Handle GET requests to fetch related blocks
export async function GET(
  req: NextRequest,
  { params }: { params: { pathOptionId: string } }
) {
  try {
    const { pathOptionId } = params;

    console.log('Fetching related blocks for PathOptionId:', pathOptionId);

    // Validate input
    if (!pathOptionId) {
      return NextResponse.json(
        { error: 'PathOptionId is required' },
        { status: 400 }
      );
    }

    // Fetch related blocks
    const relatedBlocks = await prisma.pathOptionBlock.findMany({
      where: { pathOptionId: Number(pathOptionId) },
      include: {
        block: true, // Assuming you have a `block` relation
      },
    });

    return NextResponse.json(relatedBlocks);
  } catch (error) {
    console.error('Error fetching related blocks:', error);
    return NextResponse.json(
      { error: 'Failed to fetch related blocks' },
      { status: 500 }
    );
  }
}
