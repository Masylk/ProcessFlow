// app/api/get-signed-url/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient'; // Shared Supabase client

/**
 * @swagger
 * /api/get-signed-url:
 *   get:
 *     summary: Get a signed URL for a file in the private Supabase bucket
 *     description: Generates a signed URL for accessing a file stored in the private Supabase storage bucket for a limited time (60 seconds).
 *     parameters:
 *       - in: query
 *         name: path
 *         required: true
 *         schema:
 *           type: string
 *         description: The path of the file in the storage bucket.
 *         example: "folder/file.png"
 *     responses:
 *       200:
 *         description: Successfully generated signed URL
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 signedUrl:
 *                   type: string
 *                   description: The signed URL for accessing the file.
 *                   example: "https://your-supabase-url.supabase.co/storage/v1/object/sign/folder/file.png?token=example-token"
 *       400:
 *         description: Missing required path parameter
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Path is required"
 *       500:
 *         description: Internal server error or environment variable issue
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Bucket name is not defined in the environment variables"
 */
export async function GET(req: NextRequest) {
  // Parse the query parameters
  const { searchParams } = new URL(req.url);
  const path = searchParams.get('path');

  if (!path) {
    return NextResponse.json({ error: 'Path is required' }, { status: 400 });
  }

  // Get the private bucket name from the environment variable
  const bucketName = process.env.NEXT_PUBLIC_SUPABASE_PRIVATE_BUCKET;

  if (!bucketName) {
    return NextResponse.json(
      { error: 'Bucket name is not defined in the environment variables' },
      { status: 500 }
    );
  }

  try {
    // Generate a signed URL for the requested path
    const { data, error } = await supabase.storage
      .from(bucketName) // Use the bucket name from the environment variable
      .createSignedUrl(path, 86400); // 24 hours expiry

    if (error) {
      throw new Error(error.message);
    }

    return NextResponse.json({ signedUrl: data.signedUrl });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Something went wrong' },
      { status: 500 }
    );
  }
}
