// app/api/workspace/[id]/paths/route.ts
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
    const result = await prisma.$transaction(async (prisma) => {
      const parsedWorkflowId = parseInt(workflowId);

      // Fetch paths for the given workflowId
      const existingPaths = await prisma.path.findMany({
        where: {
          workflowId: parsedWorkflowId,
        },
        include: {
          blocks: {
            orderBy: {
              position: 'asc', // Order blocks within each path if necessary
            },
            include: {
              pathBlock: {
                include: {
                  paths: {
                    include: {
                      blocks: {
                        include: {
                          pathBlock: true, // Include nested pathBlock relations
                          stepBlock: true, // Include step block relations
                          delayBlock: true, // Include delay block relations
                        },
                      },
                    },
                  },
                },
              },
              stepBlock: true,
              delayBlock: true,
            },
          },
        },
      });

      // If no paths are found, create a new Path (without linking to a PathBlock since it's optional)
      if (existingPaths.length === 0) {
        const newPath = await prisma.path.create({
          data: {
            name: 'First Path', // Set a default or customizable name
            workflowId: parsedWorkflowId,
            pathBlockId: null, // Optional relationship with PathBlock
          },
          include: {
            blocks: {
              include: {
                pathBlock: {
                  include: {
                    paths: {
                      include: {
                        blocks: {
                          include: {
                            pathBlock: true,
                            stepBlock: true,
                            delayBlock: true,
                          },
                        },
                      },
                    },
                  },
                },
                stepBlock: true,
                delayBlock: true,
              },
            },
          },
        });
        console.log(newPath);
        return { paths: [newPath] };
      }
      console.log(existingPaths);
      // Return existing paths with their associated blocks if they exist
      return { paths: existingPaths };
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching or creating paths:', error);
    return NextResponse.json(
      { error: 'Failed to fetch or create paths' },
      { status: 500 }
    );
  }
}
