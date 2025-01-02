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

  // Validate workflowId and workspaceId
  if (!workflowId || isNaN(workspaceId)) {
    return NextResponse.json(
      { error: 'workflowId and valid workspaceId are required' },
      { status: 400 }
    );
  }

  try {
    // Convert workflowId to a number for further processing
    const parsedWorkflowId = parseInt(workflowId);

    if (isNaN(parsedWorkflowId)) {
      return NextResponse.json(
        { error: 'Invalid workflowId' },
        { status: 400 }
      );
    }

    // Log the request data
    console.log('Fetching paths for:', { workspaceId, parsedWorkflowId });

    // Fetch or create paths with blocks for the given workflowId
    const result = await prisma.$transaction(async (prisma) => {
      // Fetch paths for the given workflowId
      const existingPaths = await prisma.path.findMany({
        where: {
          workflowId: parsedWorkflowId,
        },
        include: {
          blocks: {
            orderBy: {
              position: 'asc',
            },
            include: {
              pathBlock: {
                include: {
                  paths: {
                    include: {
                      blocks: {
                        include: {
                          pathBlock: true,
                          stepBlock: true,
                        },
                      },
                    },
                  },
                },
              },
              stepBlock: true,
            },
          },
        },
      });

      // If no paths are found, create a new Path without linking to a PathBlock
      if (existingPaths.length === 0) {
        const newPath = await prisma.path.create({
          data: {
            name: 'First Path',
            workflowId: parsedWorkflowId,
            pathBlockId: null,
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
                          },
                        },
                      },
                    },
                  },
                },
                stepBlock: true,
              },
            },
          },
        });

        return { paths: [newPath] };
      }

      // Return existing paths
      return { paths: existingPaths };
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching or creating paths and blocks:', error);
    return NextResponse.json(
      { error: 'Failed to fetch or create paths and blocks' },
      { status: 500 }
    );
  }
}
