import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { supabase } from '@/lib/supabaseClient';

export async function DELETE(req: NextRequest) {
  try {
    // Extract ID from the URL path
    const id = req.nextUrl.pathname.split('/').slice(-2)[0];
    if (!id) {
      return NextResponse.json(
        { error: 'Block ID is required' },
        { status: 400 }
      );
    }

    const blockId = parseInt(id);

    // Get both current image and original image paths
    const block = await prisma.block.findUnique({
      where: { id: blockId },
      select: { 
        image: true,
        original_image: true 
      },
    });

    if (!block?.image && !block?.original_image) {
      return NextResponse.json({ message: 'No images to delete' });
    }

    // Delete both images from Supabase storage
    const bucketName = process.env.NEXT_PUBLIC_SUPABASE_PRIVATE_BUCKET;
    if (bucketName) {
      const filesToDelete = [
        block.image,
        block.original_image
      ].filter(Boolean) as string[];

      if (filesToDelete.length > 0) {
        const { error: storageError } = await supabase.storage
          .from(bucketName)
          .remove(filesToDelete);

        if (storageError) {
          console.error('Error deleting from storage:', storageError);
        }
      }
    }

    // Update the block to remove both image references
    const updatedBlock = await prisma.block.update({
      where: { id: blockId },
      data: { 
        image: null,
        original_image: null 
      },
    });

    return NextResponse.json(updatedBlock);
  } catch (error) {
    console.error('Error deleting images:', error);
    return NextResponse.json(
      { error: 'Failed to delete images' },
      { status: 500 }
    );
  }
} 