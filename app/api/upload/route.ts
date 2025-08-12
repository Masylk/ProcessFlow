// app/api/upload/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient'; // Shared Supabase client
import { createClient } from '@/utils/supabase/server';
import prisma from '@/lib/prisma';
import { PrismaClient } from '@prisma/client';
import { isVercel } from '@/app/api/utils/isVercel';
import { v4 as uuidv4 } from 'uuid';

/**
 * @swagger
 * /api/upload:
 *   post:
 *     summary: Upload a file to Supabase storage
 *     description: Allows users to upload images or videos to a designated Supabase storage bucket.
 *     tags:
 *       - Upload 
*     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: The file to be uploaded.
 *     responses:
 *       200:
 *         description: File uploaded successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "File uploaded successfully: uploads/unique-file-name.png"
 *                 filePath:
 *                   type: string
 *                   example: "uploads/unique-file-name.png"
 *       400:
 *         description: Invalid file type or no file provided.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "No file uploaded"
 *       500:
 *         description: Internal server error, possibly due to Supabase upload failure.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "File upload failed"
 */
export async function POST(req: NextRequest) {
  // Get authenticated user
  const supabaseServer = await createClient();
  const { data: userData, error: userError } = await supabaseServer.auth.getUser();

  if (userError || !userData || !userData.user) {
    return NextResponse.json(
      { error: 'User not authenticated' },
      { status: 401 }
    );
  }

  const userUID = userData.user.id;

  // Get user's active workspace
  const prisma_client = isVercel() ? new PrismaClient() : prisma;
  if (!prisma_client) {
    throw new Error('Prisma client not initialized');
  }

  try {
    const user = await prisma_client.user.findUnique({
      where: { auth_id: userUID },
      include: {
        active_workspace: true
      }
    });

    if (!user || !user.active_workspace) {
      return NextResponse.json(
        { error: 'No active workspace found' },
        { status: 400 }
      );
    }

    const workspaceSlug = user.active_workspace.slug;

    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    // Validate file type
    const allowedMimeTypes = [
      'image/svg+xml',
      'image/png',
      'image/jpeg',
      'image/gif',
      'video/mp4',
    ];
    if (!allowedMimeTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Invalid file type' }, { status: 400 });
    }

    const buffer = await file.arrayBuffer();
    const fileData = new Uint8Array(buffer); // Convert to Uint8Array

    // Generate a unique file name and specify the folder using workspace slug
    const sanitizedFileName = file.name.replace(/\s+/g, '_'); // Replace spaces with underscores
    const fileName = `${uuidv4()}-${sanitizedFileName}`;
    const filePath = `uploads/${workspaceSlug}/${fileName}`; // Upload inside workspace folder

    // Retrieve bucket name from environment variable
    const bucketName = process.env.NEXT_PUBLIC_SUPABASE_WORKSPACE_BUCKET;

    if (!bucketName) {
      return NextResponse.json(
        { error: 'Bucket name is not defined in environment variables' },
        { status: 500 }
      );
    }
    
    // Upload the file to the workspace folder in the specified bucket
    const { error } = await supabase.storage
      .from(bucketName)
      .upload(filePath, fileData, {
        contentType: file.type,
        upsert: false, // Avoid overwriting existing files
      });

    if (error) {
      console.error('Supabase upload error:', error);
      return NextResponse.json(
        { error: 'File upload failed' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: `File uploaded successfully: ${filePath}`,
      filePath,
    });
  } catch (error) {
    console.error('File upload error:', error);
    return NextResponse.json({ error: 'File upload failed' }, { status: 500 });
  } finally {
    if (isVercel()) await prisma_client.$disconnect();
  }
}
