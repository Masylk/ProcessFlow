// app/api/upload/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient'; // Shared Supabase client
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

  // Generate a unique file name and specify the folder
  const fileName = `${uuidv4()}-${file.name}`;
  const filePath = `uploads/${fileName}`; // Upload inside the "uploads" folder

  // Retrieve bucket name from environment variable
  const bucketName = process.env.NEXT_PUBLIC_SUPABASE_PRIVATE_BUCKET;

  if (!bucketName) {
    return NextResponse.json(
      { error: 'Bucket name is not defined in environment variables' },
      { status: 500 }
    );
  }

  try {
    // Upload the file to the "uploads" folder in the specified bucket
    const { data, error } = await supabase.storage
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
  }
}
