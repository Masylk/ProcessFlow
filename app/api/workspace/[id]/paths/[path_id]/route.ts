import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma'; // Adjust the import path according to your setup

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string; path_id: string } }
) {
  const url = new URL(req.url);
  const workflow_id = url.searchParams.get('workflow_id');
  const workspaceId = parseInt(params.id);
  const path_id = parseInt(params.path_id);

  // Validate parameters
  if (!workflow_id || isNaN(workspaceId) || isNaN(path_id)) {
    return NextResponse.json(
      { error: 'Valid workspaceId, path_id, and workflow_id are required' },
      { status: 400 }
    );
  }

  try {
    const parsedworkflow_id = parseInt(workflow_id);

    if (isNaN(parsedworkflow_id)) {
      return NextResponse.json(
        { error: 'Invalid workflow_id' },
        { status: 400 }
      );
    }

    // Fetch path data including blocks, path_block, step_block, and delay field
    const pathData = await prisma.path.findUnique({
      where: { id: path_id },
      include: {
        blocks: {
          where: { workflow_id: parsedworkflow_id }, // Adjust to match your data structure
          include: {
            path_block: true, // Include related path_block information
            step_block: true, // Include related step_block information
            delay_block: true,
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
