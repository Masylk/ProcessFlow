import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { supabase } from '@/lib/supabaseClient';
import { Prisma } from '@prisma/client';
import { PrismaClient } from '@prisma/client';
import { isVercel } from '@/app/api/utils/isVercel';
import { generatePublicUrl } from '@/app/api/utils/generatePublicUrl';

/**
 * @swagger
 * /api/blocks/{id}/duplicate:
 *   post:
 *     summary: Duplicate a block
 *     description: Duplicates a block by its ID, optionally at a new position or under a different path. Handles image duplication if the block has an image.
 *     tags:
 *       - Blocks
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the block to duplicate.
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               position:
 *                 type: integer
 *                 description: The position to insert the duplicated block.
 *               path_id:
 *                 type: integer
 *                 description: The path ID to assign the duplicated block to.
 *     responses:
 *       200:
 *         description: Block duplicated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 block:
 *                   $ref: '#/components/schemas/Block'
 *                 paths:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Path'
 *       404:
 *         description: Original block not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Original block not found
 *       500:
 *         description: Failed to duplicate block
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Failed to duplicate block
 */

export async function POST(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const blockId = Number(params.id);

  const prisma_client = isVercel() ? new PrismaClient() : prisma;
  if (!prisma_client) {
    throw new Error('Prisma client not initialized');
  }

  try {
    // Get position and path_id from request body if provided
    const body = await req.json().catch(() => ({}));
    
    // Get the original block
    const originalBlock = await prisma_client.block.findUnique({
      where: { id: blockId },
      select: {
        id: true,
        type: true,
        position: true,
        icon: true,
        description: true,
        image: true,
        workflow_id: true,
        path_id: true,
        delay_seconds: true,
        delay_event: true,
        delay_type: true,
        title: true,
      }
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
      const bucketName = process.env.NEXT_PUBLIC_SUPABASE_WORKSPACE_BUCKET;
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

    // Handle icon duplication if it matches certain paths

    let newIconPath = originalBlock.icon;
    if (originalBlock.icon && (
      (originalBlock.icon.includes('/uploads') && originalBlock.icon.includes('/icons')) ||
      originalBlock.icon.includes('/step-icons/custom')
    )) {
        const bucketName = process.env.NEXT_PUBLIC_SUPABASE_WORKSPACE_BUCKET;
        if (bucketName) {
          const timestamp = Date.now();
          const originalIconFileName = originalBlock.icon.split('/').pop();
          const newIconFileName = `${timestamp}-${originalIconFileName}`;
          const newIconPathCandidate = originalBlock.icon.replace(originalIconFileName!, newIconFileName);
          
          const { data: iconCopyData, error: iconCopyError } = await supabase
          .storage
          .from(bucketName)
          .copy(originalBlock.icon, newIconPathCandidate);
          
          if (iconCopyError) {
            console.error('Error copying icon:', iconCopyError);
        } else {
          newIconPath = newIconPathCandidate;
        }
      }
    }  
    
    // Update positions of blocks after the target position
    await prisma_client.block.updateMany({
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
    const duplicatedBlock = await prisma_client.block.create({
      data: {
        type: originalBlock.type,
        position: targetPosition,
        icon: newIconPath,
        description: originalBlock.description,
        image: newImagePath,
        workflow: { connect: { id: originalBlock.workflow_id } },
        path: { connect: { id: targetPathId } },
        delay_seconds: originalBlock.type === 'DELAY' ? originalBlock.delay_seconds : null,
        delay_event: originalBlock.type === 'DELAY' ? originalBlock.delay_event : null,
        delay_type: originalBlock.type === 'DELAY' ? originalBlock.delay_type : null,
        title: `${originalBlock.title || ''} (copy)`,
        created_at: new Date(),
        updated_at: new Date(),
      },
    });

    const shouldGenerateIconUrl = duplicatedBlock.icon && !duplicatedBlock.icon.startsWith('https://cdn.brandfetch.io/');

    // Fetch all paths to return updated data
    // const paths = await prisma.path.findMany({
    //   where: {
    //     workflow_id: originalBlock.workflow_id,
    //   },
    //   include: {
    //     blocks: {
    //       orderBy: {
    //         position: 'asc',
    //       },
    //       include: {
    //         child_paths: {
    //           include: {
    //             path: true,
    //           },
    //         },
    //       },
    //     },
    //     parent_blocks: true,
    //   },
    // });

    return NextResponse.json({
      block: {
        ...duplicatedBlock,
        signedIconUrl: shouldGenerateIconUrl && typeof duplicatedBlock.icon === 'string'
          ? await generatePublicUrl(duplicatedBlock.icon)
          : duplicatedBlock.icon
      },
      // paths: paths,
    });

  } catch (error) {
    console.error('Error duplicating block:', error);
    return NextResponse.json(
      { error: 'Failed to duplicate block' },
      { status: 500 }
    );
  } finally {
    if (isVercel()) {
      await prisma_client.$disconnect();
    }
  }
} 