// app/api/workspace/[id]/blocks/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { Prisma } from '@prisma/client';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const url = new URL(req.url);
  const workflow_id = url.searchParams.get('workflow_id');
  const workspaceId = parseInt(params.id);

  // Validate workflow_id and workspaceId
  if (!workflow_id || isNaN(workspaceId)) {
    return NextResponse.json(
      { error: 'workflow_id and valid workspaceId are required' },
      { status: 400 }
    );
  }

  try {
    // Convert workflow_id to a number for further processing
    const parsedworkflow_id = parseInt(workflow_id);

    if (isNaN(parsedworkflow_id)) {
      return NextResponse.json(
        { error: 'Invalid workflow_id' },
        { status: 400 }
      );
    }

    // Log the request data
    console.log('Fetching paths for:', { workspaceId, parsedworkflow_id });

    // Fetch or create paths with blocks for the given workflow_id
    const result = await prisma.$transaction(
      async (prisma: Prisma.TransactionClient) => {
        // Fetch paths for the given workflow_id
        const existingPaths = await prisma.path.findMany({
          where: {
            workflow_id: parsedworkflow_id,
          },
          include: {
            blocks: {
              orderBy: {
                position: 'asc',
              },
              include: {
                path_block: {
                  include: {
                    paths: {
                      include: {
                        blocks: {
                          include: {
                            path_block: true,
                            step_block: true,
                          },
                        },
                      },
                    },
                  },
                },
                step_block: true,
              },
            },
          },
        });

        // If no paths are found, create a new Path without linking to a path_block
        if (existingPaths.length === 0) {
          const newPath = await prisma.path.create({
            data: {
              name: 'First Path',
              workflow_id: parsedworkflow_id,
              path_block_id: null,
            },
            include: {
              blocks: {
                include: {
                  path_block: {
                    include: {
                      paths: {
                        include: {
                          blocks: {
                            include: {
                              path_block: true,
                              step_block: true,
                            },
                          },
                        },
                      },
                    },
                  },
                  step_block: true,
                },
              },
            },
          });

          return { paths: [newPath] };
        }

        // Return existing paths
        return { paths: existingPaths };
      }
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching or creating paths and blocks:', error);
    return NextResponse.json(
      { error: 'Failed to fetch or create paths and blocks' },
      { status: 500 }
    );
  }
}
