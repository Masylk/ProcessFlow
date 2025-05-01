// app/api/blocks/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient'; // Shared Supabase client
import prisma from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { deleteOneBlock } from '../../utils/blocks/deleteOne';
import { formatTitle } from '../../utils/formatTitle';

/**
 * @swagger
 * /api/blocks/{id}:
 *   patch:
 *     summary: Update a block by ID
 *     description: Updates the properties of a block including its type, position, title, icon, and image.
 *     tags:
 *       - Blocks
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the block to update.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               type:
 *                 type: string
 *               position:
 *                 type: integer
 *               title:
 *                 type: string
 *               icon:
 *                 type: string
 *               description:
 *                 type: string
 *               path_id:
 *                 type: integer
 *               workflow_id:
 *                 type: integer
 *               image:
 *                 type: string
 *               image_description:
 *                 type: string
 *               click_position:
 *                 type: integer
 *               average_time:
 *                 type: integer
 *               task_type:
 *                 type: string
 *               delay_seconds:
 *                 type: integer
 *               step_details:
 *                 type: string
 *     responses:
 *       200:
 *         description: Successfully updated block.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       400:
 *         description: Invalid block ID.
 *       404:
 *         description: Block not found.
 *       500:
 *         description: Failed to update block.
 */
export async function PATCH(req: NextRequest) {
  const id = req.nextUrl.pathname.split('/').pop();

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
      original_image,
      image_description,
      click_position,
      average_time,
      task_type,
      delay_seconds,
      delay_type,
      delay_event,
      step_details,
    } = await req.json();

    // const formattedTitle = formatTitle(title);
    const formattedTitle = title;
    const formattedDelayEvent = delay_event ? formatTitle(delay_event) : undefined;

    const existingBlock = await prisma.block.findUnique({
      where: { id: block_id },
      select: { 
        image: true,
        original_image: true 
      },
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
        }
      }
    };

    // Delete the previous image only if it's not being used as original_image
    if (existingImageUrl && 
        existingImageUrl !== image && 
        existingImageUrl !== original_image) {
      await deleteFile(existingImageUrl);
    }

    // Update block with all fields
    const updatedBlock = await prisma.block.update({
      where: { id: block_id },
      data: {
        type,
        position,
        title: formattedTitle,
        icon,
        description,
        path_id,
        workflow_id,
        image,
        original_image,
        image_description,
        click_position,
        last_modified: new Date(),
        average_time,
        task_type,
        delay_seconds: type === 'DELAY' ? delay_seconds : null,
        delay_type: type === 'DELAY' ? delay_type : null,
        delay_event: type === 'DELAY' ? formattedDelayEvent : null,
        step_details: type === 'STEP' ? step_details : null,
      },
    });

    return NextResponse.json(updatedBlock);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update block' },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/blocks/{id}:
 *   delete:
 *     summary: Delete a block by ID
 *     description: Deletes a block and its related records from the database.
 *     tags:
 *       - Blocks
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the block to delete.
 *     responses:
 *       204:
 *         description: Block successfully deleted.
 *       400:
 *         description: Invalid block ID.
 *       404:
 *         description: Block not found.
 *       500:
 *         description: Failed to delete block.
 */
export async function DELETE(req: NextRequest) {
  const id = req.nextUrl.pathname.split('/').pop();

  if (!id) {
    return NextResponse.json(
      { error: 'Block ID is required' },
      { status: 400 }
    );
  }

  const block_id = Number(id);

  const { error, status } = await deleteOneBlock(block_id);

  if (error) {
    return NextResponse.json({ error }, { status });
  }

  return new NextResponse(null, { status: 204 });
}
