import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient'; // Shared Supabase client
import prisma from '@/lib/prisma';

// Handler for PATCH requests to update a block
export async function PATCH(req: NextRequest) {
  const id = req.nextUrl.pathname.split('/').pop(); // Extract ID from URL

  if (!id) {
    return NextResponse.json(
      { error: 'Block ID is required' },
      { status: 400 }
    );
  }

  const blockId = Number(id);

  try {
    const {
      type,
      position,
      title,
      icon,
      description,
      pathId,
      workflowId,
      image,
      imageDescription,
      clickPosition, // Include clickPosition in the request body
      averageTime, // Include averageTime
      taskType, // Include taskType
      delay, // New optional field
    } = await req.json();

    // Update the block in the database
    const updatedBlock = await prisma.block.update({
      where: { id: blockId },
      data: {
        type,
        position,
        title,
        icon,
        description,
        pathId,
        workflowId,
        image,
        imageDescription: imageDescription || null,
        clickPosition: clickPosition || null,
        lastModified: new Date(), // Set to the current timestamp
        averageTime: averageTime || null,
        taskType: taskType || null,
      },
    });

    return NextResponse.json(updatedBlock);
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Failed to update block:', error.message);
      return NextResponse.json(
        { error: `Failed to update block: ${error.message}` },
        { status: 500 }
      );
    } else {
      console.error('Failed to update block:', error);
      return NextResponse.json(
        { error: 'Failed to update block: unknown error' },
        { status: 500 }
      );
    }
  }
}

// Handler for DELETE requests to delete a block
export async function DELETE(req: NextRequest) {
  const id = req.nextUrl.pathname.split('/').pop(); // Extract ID from URL

  if (!id) {
    return NextResponse.json(
      { error: 'Block ID is required' },
      { status: 400 }
    );
  }

  const blockId = Number(id);

  try {
    // Fetch the block to determine its type, relations, and associated files
    const block = await prisma.block.findUnique({
      where: { id: blockId },
      include: {
        stepBlock: true,
        pathBlock: true,
      },
    });

    if (!block) {
      return NextResponse.json({ error: 'Block not found' }, { status: 404 });
    }

    const imageUrl = block.image; // Only delete the image file now
    // Removed iconUrl logic

    // Prepare for file deletion from Supabase storage
    const deleteFile = async (fileUrl: string | null) => {
      if (fileUrl) {
        const filePath = fileUrl.replace(
          'https://your-project.supabase.co/storage/v1/object/public/',
          ''
        );
        const { error } = await supabase.storage
          .from('user-assets')
          .remove([filePath]);
        if (error) {
          console.error(`Failed to delete file: ${fileUrl}`, error);
        } else {
          console.log(`File deleted successfully: ${fileUrl}`);
        }
      } else {
        console.log('no file url to delete');
      }
    };

    // Delete only the image file from Supabase storage
    await deleteFile(imageUrl);

    // Perform the database transaction to delete the block and related records
    await prisma.$transaction(async (transactionPrisma) => {
      // Delete related records based on block type
      if (block.type === 'PATH' && block.pathBlock) {
        // Delete the path block itself
        await transactionPrisma.pathBlock.delete({
          where: { blockId: blockId },
        });
      } else if (block.type === 'STEP' && block.stepBlock) {
        // Delete the step block
        await transactionPrisma.stepBlock.delete({
          where: { blockId: blockId },
        });
      }

      // Finally, delete the block itself
      await transactionPrisma.block.delete({
        where: { id: blockId },
      });
    });

    // Return a response with no content
    return new NextResponse(null, { status: 204 });
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Failed to delete block:', error.message);
      return NextResponse.json(
        { error: `Failed to delete block: ${error.message}` },
        { status: 500 }
      );
    } else {
      console.error('Failed to delete block:', error);
      return NextResponse.json(
        { error: 'Failed to delete block: unknown error' },
        { status: 500 }
      );
    }
  }
}
