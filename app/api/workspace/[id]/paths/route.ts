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

      if (existingPaths.length === 0) {
        const newPath = await prisma.path.create({
          data: {
            name: 'First Path',
            workflowId: parsedWorkflowId,
            pathBlockId: null,
          },
        });

        // Create the default step block inside the new path
        const defaultBlockData: any = {
          type: 'STEP',
          position: 0,
          icon: '/step-icons/default-icons/container.svg',
          description: 'This is the default step block',
          workflow: { connect: { id: parsedWorkflowId } },
          path: { connect: { id: newPath.id } },
          stepBlock: {
            create: {
              stepDetails: 'Default step details',
            },
          },
        };

        const defaultBlock = await prisma.block.create({
          data: defaultBlockData,
          include: {
            stepBlock: true,
          },
        });

        return { paths: [{ ...newPath, blocks: [defaultBlock] }] };
      }

      // Return existing paths with their associated blocks
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
