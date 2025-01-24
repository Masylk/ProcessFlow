import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient'; // Shared Supabase client
import prisma from '@/lib/prisma';
import { Prisma } from '@prisma/client';

export async function PATCH(req: NextRequest) {
  const id = req.nextUrl.pathname.split('/').pop(); // Extract ID from URL

  if (!id) {
    return NextResponse.json(
      { error: 'Block ID is required' },
      { status: 400 }
    );
  }

  const block_id = Number(id);

  try {
    const {
      type,
      position,
      title,
      icon,
      description,
      path_id,
      workflow_id,
      image,
      image_description,
      click_position,
      average_time,
      task_type,
      delay,
    } = await req.json();

    // Fetch the existing block to get the current image URL
    const existingBlock = await prisma.block.findUnique({
      where: { id: block_id },
      select: { image: true },
    });

    if (!existingBlock) {
      return NextResponse.json({ error: 'Block not found' }, { status: 404 });
    }

    const existingImageUrl = existingBlock.image;

    // Prepare for file deletion from Supabase storage
    const deleteFile = async (fileUrl: string | null) => {
      if (fileUrl) {
        const filePath = fileUrl.replace(
          'https://your-project.supabase.co/storage/v1/object/public/',
          ''
        );

        const bucketName = process.env.NEXT_PUBLIC_SUPABASE_PRIVATE_BUCKET;
        if (!bucketName) {
          console.error(
            'Bucket name is not defined in the environment variables.'
          );
          return;
        }

        const { error } = await supabase.storage
          .from(bucketName)
          .remove([filePath]);

        if (error) {
          console.error(`Failed to delete file: ${fileUrl}`, error);
        } else {
          console.log(`File deleted successfully: ${fileUrl}`);
        }
      }
    };

    // Delete the previous image if the image URL has changed
    if (existingImageUrl && existingImageUrl !== image) {
      await deleteFile(existingImageUrl);
    }

    // Update the block in the database
    const updatedBlock = await prisma.block.update({
      where: { id: block_id },
      data: {
        type,
        position,
        title,
        icon,
        description,
        path_id,
        workflow_id,
        image,
        image_description: image_description || null,
        click_position: click_position || null,
        last_modified: new Date(),
        average_time: average_time || null,
        task_type: task_type || null,
      },
    });

    // Handle block type-specific updates
    if (type === 'DELAY') {
      console.log('UPDATE DELAY: ' + delay);

      await prisma.delay_block.update({
        where: { block_id },
        data: {
          seconds: delay,
        },
      });
    }

    const updatedBlockWithRelations = await prisma.block.findUnique({
      where: { id: block_id },
      include: {
        step_block: true,
        path_block: true,
        delay_block: true,
      },
    });

    return NextResponse.json(updatedBlockWithRelations);
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

  const block_id = Number(id);

  try {
    // Fetch the block to determine its type, relations, and associated files
    const block = await prisma.block.findUnique({
      where: { id: block_id },
      include: {
        step_block: true,
        path_block: true,
        delay_block: true, // Include delay_block if present
      },
    });

    if (!block) {
      return NextResponse.json({ error: 'Block not found' }, { status: 404 });
    }

    const imageUrl = block.image; // Only delete the image file now

    // Prepare for file deletion from Supabase storage
    const deleteFile = async (fileUrl: string | null) => {
      if (fileUrl) {
        const filePath = fileUrl.replace(
          'https://your-project.supabase.co/storage/v1/object/public/',
          ''
        );

        // Check if the bucket name is defined
        const bucketName = process.env.NEXT_PUBLIC_SUPABASE_PRIVATE_BUCKET;
        if (!bucketName) {
          console.error(
            'Bucket name is not defined in the environment variables.'
          );
          return;
        }

        const { error } = await supabase.storage
          .from(bucketName) // Use the environment variable for the bucket name
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
    await prisma.$transaction(
      async (transactionPrisma: Prisma.TransactionClient) => {
        // Delete related records based on block type
        if (block.type === 'PATH' && block.path_block) {
          // Delete the path block itself
          await transactionPrisma.path_block.delete({
            where: { block_id: block_id },
          });
        } else if (block.type === 'STEP' && block.step_block) {
          // Delete the step block
          await transactionPrisma.step_block.delete({
            where: { block_id: block_id },
          });
        } else if (block.type === 'DELAY' && block.delay_block) {
          // Delete the delay block
          await transactionPrisma.delay_block.delete({
            where: { block_id: block_id },
          });
        }

        // Finally, delete the block itself
        await transactionPrisma.block.delete({
          where: { id: block_id },
        });
      }
    );

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
