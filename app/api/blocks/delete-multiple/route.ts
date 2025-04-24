import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { supabase } from '@/lib/supabaseClient';
import { deleteManyPaths } from '@/app/api/utils/paths/deleteMany';

export async function POST(req: NextRequest) {
  try {
    const { blockIds } = await req.json();

    // Get blocks to handle image deletion and child_paths
    const blocks = await prisma.block.findMany({
      where: {
        id: {
          in: blockIds
        }
      },
      select: {
        id: true,
        type: true,
        path_id: true,
        image: true,
        position: true,
        child_paths: {
          select: { path_id: true }
        }
      }
    });

    // If no blocks found, just return success
    if (blocks.length === 0) {
      return NextResponse.json({ success: true });
    }

    // Path ID of the first deleted block
    const pathId = blocks[0].path_id;

    // Delete images from storage if they exist
    const bucketName = process.env.NEXT_PUBLIC_SUPABASE_PRIVATE_BUCKET;
    if (bucketName) {
      for (const block of blocks) {
        if (block.image) {
          const { error } = await supabase.storage
            .from(bucketName)
            .remove([block.image]);
          
          if (error) {
            console.error('Error deleting image:', error);
          }
        }
      }
    }

    // Handle PATH blocks: delete their child paths and convert to LAST
    for (const block of blocks) {
      if (block.type === 'PATH') {
        const childPathIds = block.child_paths.map(cp => cp.path_id);
        if (childPathIds.length > 0) {
          await deleteManyPaths(childPathIds);
        }
        // Convert block to LAST
        await prisma.block.update({
          where: { id: block.id },
          data: { type: 'LAST' }
        });
      }
    }

    // Delete only STEP and DELAY blocks
    await prisma.block.deleteMany({
      where: {
        id: {
          in: blockIds
        },
        type: {
          in: ['STEP', 'DELAY']
        }
      }
    });

    // Decrement positions of blocks with position > maxDeletedPosition
    const deletedPositions = blocks.map(b => b.position);
    const maxDeletedPosition = Math.max(...deletedPositions);
    const numDeleted = blocks.length;

    await prisma.block.updateMany({
      where: {
        path_id: pathId,
        position: { gt: maxDeletedPosition }
      },
      data: {
        position: { decrement: numDeleted }
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting blocks:', error);
    return NextResponse.json(
      { error: 'Failed to delete blocks' },
      { status: 500 }
    );
  }
} 