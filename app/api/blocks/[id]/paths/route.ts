// app/api/blocks/[blockId]/paths/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma'; // Adjust the path as necessary

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const blockId = parseInt(params.id);
  console.log(blockId);
  // Validate blockId
  if (isNaN(blockId)) {
    return NextResponse.json({ error: 'Invalid blockId' }, { status: 400 });
  }

  try {
    // Fetch paths linked to the block
    const paths = await prisma.path.findMany({
      where: {
        path_block_id: blockId, // Adjust based on your schema
      },
      select: {
        id: true,
        name: true,
        // Add other fields as necessary
      },
    });
    console.log(paths);
    return NextResponse.json(paths);
  } catch (error) {
    console.error('Error fetching paths for block:', error);
    return NextResponse.json(
      { error: 'Failed to fetch paths' },
      { status: 500 }
    );
  }
}
