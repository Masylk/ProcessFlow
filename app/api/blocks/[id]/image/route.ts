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

    // 1. Get the current image path from the block
    const block = await prisma.block.findUnique({
      where: { id: blockId },
      select: { image: true },
    });

    if (!block?.image) {
      return NextResponse.json({ message: 'No image to delete' });
    }

    // 2. Delete the image from Supabase storage
    const bucketName = process.env.NEXT_PUBLIC_SUPABASE_PRIVATE_BUCKET;
    if (bucketName) {
      const { error: storageError } = await supabase.storage
        .from(bucketName)
        .remove([block.image]);

      if (storageError) {
        console.error('Error deleting from storage:', storageError);
      }
    }

    // 3. Update the block to remove the image reference
    const updatedBlock = await prisma.block.update({
      where: { id: blockId },
      data: { image: null },
    });

    return NextResponse.json(updatedBlock);
  } catch (error) {
    console.error('Error deleting image:', error);
    return NextResponse.json(
      { error: 'Failed to delete image' },
      { status: 500 }
    );
  }
} 