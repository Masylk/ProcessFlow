import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { supabase } from '@/lib/supabaseClient';
import { Prisma } from '@prisma/client';

export async function POST(req: NextRequest) {
  try {
    const id = req.nextUrl.pathname.split('/')[3];
    const blockId = parseInt(id);
    
    // Get position and path_id from request body if provided
    const body = await req.json().catch(() => ({}));
    
    // Get the original block
    const originalBlock = await prisma.block.findUnique({
      where: { id: blockId },
    });

    if (!originalBlock) {
      return NextResponse.json(
        { error: 'Original block not found' },
        { status: 404 }
      );
    }

    // Use provided position and path_id or defaults
    const targetPosition = body.position ?? originalBlock.position + 1;
    const targetPathId = body.path_id ?? originalBlock.path_id;

    // Handle image duplication if exists
    let newImagePath = null;
    if (originalBlock.image) {
      const bucketName = process.env.NEXT_PUBLIC_SUPABASE_PRIVATE_BUCKET;
      if (bucketName) {
        // Generate new unique filename
        const timestamp = Date.now();
        const originalFileName = originalBlock.image.split('/').pop();
        const newFileName = `${timestamp}-${originalFileName}`;
        const newPath = originalBlock.image.replace(originalFileName!, newFileName);

        // Copy file in Supabase storage
        const { data: copyData, error: copyError } = await supabase
          .storage
          .from(bucketName)
          .copy(originalBlock.image, newPath);

        if (copyError) {
          console.error('Error copying file:', copyError);
        } else {
          newImagePath = newPath;
        }
      }
    }

    // Update positions of blocks after the target position
    await prisma.block.updateMany({
      where: {
        path_id: targetPathId,
        position: {
          gte: targetPosition
        }
      },
      data: {
        position: {
          increment: 1
        }
      }
    });

    // Create the duplicate block
    const duplicatedBlock = await prisma.block.create({
      data: {
        type: originalBlock.type,
        position: targetPosition,
        icon: originalBlock.icon,
        description: originalBlock.description,
        image: newImagePath,
        workflow: { connect: { id: originalBlock.workflow_id } },
        path: { connect: { id: targetPathId } },
        click_position: originalBlock.click_position || Prisma.JsonNull,
        step_details: originalBlock.type === 'STEP' ? originalBlock.step_details : null,
        delay_seconds: originalBlock.type === 'DELAY' ? originalBlock.delay_seconds : null,
        delay_event: originalBlock.type === 'DELAY' ? originalBlock.delay_event : null,
        delay_type: originalBlock.type === 'DELAY' ? originalBlock.delay_type : null,
        title: `${originalBlock.title || ''} (copy)`,
        created_at: new Date(),
        updated_at: new Date(),
      },
    });

    // Fetch all paths to return updated data
    const paths = await prisma.path.findMany({
      where: {
        workflow_id: originalBlock.workflow_id,
      },
      include: {
        blocks: {
          orderBy: {
            position: 'asc',
          },
          include: {
            child_paths: {
              include: {
                path: true,
              },
            },
          },
        },
        parent_blocks: true,
      },
    });

    return NextResponse.json({
      block: duplicatedBlock,
      paths: paths,
    });

  } catch (error) {
    console.error('Error duplicating block:', error);
    return NextResponse.json(
      { error: 'Failed to duplicate block' },
      { status: 500 }
    );
  }
} 