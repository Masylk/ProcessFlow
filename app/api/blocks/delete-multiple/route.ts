import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { supabase } from '@/lib/supabaseClient';

export async function POST(req: NextRequest) {
  try {
    const { blockIds } = await req.json();

    // Get blocks to handle image deletion
    const blocks = await prisma.block.findMany({
      where: {
        id: {
          in: blockIds
        }
      }
    });

    // If no blocks found, just return success
    if (blocks.length === 0) {
      return NextResponse.json({ success: true });
    }

    // All blocks have the same path_id
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

    // Delete the blocks
    await prisma.block.deleteMany({
      where: {
        id: {
          in: blockIds
        }
      }
    });

    // Reorder positions for the affected path
    const remainingBlocks = await prisma.block.findMany({
      where: { path_id: pathId },
      orderBy: { position: 'asc' },
      select: { id: true }
    });

    for (let i = 0; i < remainingBlocks.length; i++) {
      await prisma.block.update({
        where: { id: remainingBlocks[i].id },
        data: { position: i }
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting blocks:', error);
    return NextResponse.json(
      { error: 'Failed to delete blocks' },
      { status: 500 }
    );
  }
} 