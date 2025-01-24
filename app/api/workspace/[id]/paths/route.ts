// app/api/workspace/[id]/paths/route.ts
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

  if (!workflow_id) {
    return NextResponse.json(
      { error: 'workflow_id is required' },
      { status: 400 }
    );
  }

  try {
    const result = await prisma.$transaction(
      async (prisma: Prisma.TransactionClient) => {
        const parsedworkflow_id = parseInt(workflow_id, 10);

        // Fetch paths for the given workflow_id
        const existingPaths = await prisma.path.findMany({
          where: {
            workflow_id: parsedworkflow_id, // Use `workflow_id` instead of `workflow_id`
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

        if (existingPaths.length === 0) {
          const newPath = await prisma.path.create({
            data: {
              name: 'First Path',
              workflow_id: parsedworkflow_id,
              path_block_id: null,
            },
          });

          // Create the default step block inside the new path
          const defaultBlockData: any = {
            type: 'STEP',
            position: 0,
            icon: '/step-icons/default-icons/container.svg',
            description: 'This is the default step block',
            workflow: { connect: { id: parsedworkflow_id } },
            path: { connect: { id: newPath.id } },
            step_block: {
              create: {
                step_details: 'Default step details',
              },
            },
          };

          const defaultBlock = await prisma.block.create({
            data: defaultBlockData,
            include: {
              step_block: true,
            },
          });

          return { paths: [{ ...newPath, blocks: [defaultBlock] }] };
        }

        // Return existing paths with their associated blocks
        return { paths: existingPaths };
      }
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching or creating paths:', error);
    return NextResponse.json(
      { error: 'Failed to fetch or create paths' },
      { status: 500 }
    );
  }
}
