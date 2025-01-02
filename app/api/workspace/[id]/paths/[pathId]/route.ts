import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma'; // Adjust the import path according to your setup

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string; pathId: string } }
) {
  const url = new URL(req.url);
  const workflowId = url.searchParams.get('workflowId');
  const workspaceId = parseInt(params.id);
  const pathId = parseInt(params.pathId);

  // Validate parameters
  if (!workflowId || isNaN(workspaceId) || isNaN(pathId)) {
    return NextResponse.json(
      { error: 'Valid workspaceId, pathId, and workflowId are required' },
      { status: 400 }
    );
  }

  try {
    const parsedWorkflowId = parseInt(workflowId);

    if (isNaN(parsedWorkflowId)) {
      return NextResponse.json(
        { error: 'Invalid workflowId' },
        { status: 400 }
      );
    }

    // Fetch path data including blocks, pathBlock, stepBlock, and delay field
    const pathData = await prisma.path.findUnique({
      where: { id: pathId },
      include: {
        blocks: {
          where: { workflowId: parsedWorkflowId }, // Adjust to match your data structure
          include: {
            pathBlock: true, // Include related pathBlock information
            stepBlock: true, // Include related stepBlock information
          },
          orderBy: {
            position: 'asc',
          },
        },
      },
    });

    if (!pathData) {
      return NextResponse.json({ error: 'Path not found' }, { status: 404 });
    }

    return NextResponse.json(pathData);
  } catch (error) {
    console.error('Error fetching path data:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
