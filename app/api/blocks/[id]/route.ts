// app/api/blocks/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { generatePublicUrl } from '../../utils/generatePublicUrl';
import prisma from '@/lib/prisma';
import { PrismaClient } from '@prisma/client';
import { isVercel } from '@/app/api/utils/isVercel';
import { deleteOneBlock } from '../../utils/blocks/deleteOne';
import { formatTitle } from '../../utils/formatTitle';
import { createSignedUrlForBlock } from '@/utils/createSignedUrls';
import { supabase } from '@/lib/supabaseClient';

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
 *               average_time:
 *                 type: integer
 *               task_type:
 *                 type: string
 *               delay_seconds:
 *                 type: integer
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

  // Choose the correct Prisma client
  const prisma_client = isVercel() ? new PrismaClient() : prisma;
  if (!prisma_client) {
    throw new Error('Prisma client not initialized');
  }
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
      average_time,
      task_type,
      delay_seconds,
      delay_type,
      delay_event,
    } = await req.json();

    // const formattedTitle = formatTitle(title);
    const formattedTitle = title;
    const formattedDelayEvent = delay_event ? formatTitle(delay_event) : undefined;

    const existingBlock = await prisma_client.block.findUnique({
      where: { id: block_id },
      select: { 
        image: true,
        original_image: true,
        icon: true
      },
    });

    if (!existingBlock) {
      return NextResponse.json({ error: 'Block not found' }, { status: 404 });
    }

    // Delete previous images from storage if new images are being set
    const bucketName = process.env.NEXT_PUBLIC_SUPABASE_WORKSPACE_BUCKET;
    if (bucketName && (image !== undefined || original_image !== undefined || icon !== undefined)) {
      const filesToDelete = [];
      
      // If updating image and there's an existing one, mark it for deletion only if it's different from both existingBlock.image and existingBlock.original_image
      if (
        image !== undefined &&
        existingBlock.image &&
        existingBlock.image !== image &&
        existingBlock.original_image &&
        existingBlock.original_image !== '' &&
        existingBlock.image !== existingBlock.original_image
      ) {
        filesToDelete.push(existingBlock.image);
      }
      
      // // If updating original_image and there's an existing one, mark it for deletion
      // if (original_image !== undefined && existingBlock.original_image && existingBlock.original_image !== original_image) {
      //   filesToDelete.push(existingBlock.original_image);
      // }

      // If updating icon and both new and old icons contain 'uploads/' and 'icons/', and the icon is changing, mark it for deletion
      if (
        icon !== undefined &&
        existingBlock.icon &&
        existingBlock.icon !== icon &&
        (existingBlock.icon.includes('uploads/') && existingBlock.icon.includes('icons/') || existingBlock.icon.includes('step-icons/custom'))
      ) {
        filesToDelete.push(existingBlock.icon);
      }

      // Delete the files from storage
      if (filesToDelete.length > 0) {
        const { error: storageError } = await supabase.storage
          .from(bucketName)
          .remove(filesToDelete);

        if (storageError) {
          console.error('Error deleting previous images/icons from storage:', storageError);
        }
      }
    }

    // Update block with all fields
    const updatedBlock: any = await prisma_client.block.update({
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
        updated_at: new Date(),
        average_time,
        task_type,
        delay_seconds: type === 'DELAY' ? delay_seconds : null,
        delay_type: type === 'DELAY' ? delay_type : null,
        delay_event: type === 'DELAY' ? formattedDelayEvent : null,
      },
    });

    const signedBlock = await createSignedUrlForBlock(updatedBlock);

    return NextResponse.json(signedBlock);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update block' },
      { status: 500 }
    );
  } finally {
    if (isVercel()) {
      await prisma_client.$disconnect();
    }
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
