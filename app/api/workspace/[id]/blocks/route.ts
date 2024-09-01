// app/api/workspace/[id]/blocks/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const url = new URL(req.url);
  const workflowId = url.searchParams.get('workflowId');
  const workspaceId = parseInt(params.id);

  if (!workflowId) {
    return NextResponse.json(
      { error: 'workflowId is required' },
      { status: 400 }
    );
  }

  try {
    // Use a transaction to safely check and create if necessary
    const blocks = await prisma.$transaction(async (prisma) => {
      // Fetch blocks for the given workflowId
      const existingBlocks = await prisma.block.findMany({
        where: {
          workflowId: parseInt(workflowId),
        },
        orderBy: {
          position: 'asc',
        },
        include: {
          pathBlock: {
            include: {
              pathOptions: true,
            },
          },
          stepBlock: true,
          delayBlock: true,
        },
      });

      // If no blocks are found, create a new PathBlock
      if (existingBlocks.length === 0) {
        // Create a new Block of type PATH
        const newPathBlock = await prisma.block.create({
          data: {
            type: 'PATH', // Assuming PATH is the enum value for PathBlock
            position: 1, // Set the first position
            workflowId: parseInt(workflowId),
            pathBlock: {
              create: {
                // Create a corresponding pathBlock relation
                pathOptions: {
                  create: [
                    {
                      pathOption: 'Option 1',
                    },
                  ],
                },
              },
            },
          },
          include: {
            pathBlock: {
              include: {
                pathOptions: true,
              },
            },
          },
        });

        // Return the newly created PathBlock
        return [newPathBlock];
      }

      // If blocks exist, return the existing blocks
      return existingBlocks;
    });

    return NextResponse.json(blocks);
  } catch (error) {
    console.error('Error fetching or creating blocks:', error);
    return NextResponse.json(
      { error: 'Failed to fetch or create blocks' },
      { status: 500 }
    );
  }
}
