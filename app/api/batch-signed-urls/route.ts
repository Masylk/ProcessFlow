import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

/**
 * @swagger
 * /api/batch-signed-urls:
 *   post:
 *     summary: Get signed URLs for multiple files in batch
 *     description: Generates signed URLs for multiple files stored in the private Supabase storage bucket for a limited time (24 hours).
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               paths:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Array of file paths in the storage bucket.
 *                 example: ["step-icons/apps/app1.png", "step-icons/default-icons/icon1.svg"]
 *     responses:
 *       200:
 *         description: Successfully generated signed URLs
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 signedUrls:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       path:
 *                         type: string
 *                       signedUrl:
 *                         type: string
 *                       error:
 *                         type: string
 *       400:
 *         description: Missing required paths parameter
 *       500:
 *         description: Internal server error
 */
export async function POST(req: NextRequest) {
  try {
    const { paths } = await req.json();

    if (!paths || !Array.isArray(paths) || paths.length === 0) {
      return NextResponse.json(
        { error: 'Paths array is required and must not be empty' },
        { status: 400 }
      );
    }

    // Get the private bucket name from the environment variable
    const bucketName = process.env.NEXT_PUBLIC_SUPABASE_PRIVATE_BUCKET;

    if (!bucketName) {
      return NextResponse.json(
        { error: 'Bucket name is not defined in the environment variables' },
        { status: 500 }
      );
    }

    // Generate signed URLs for all paths in parallel
    const signedUrlPromises = paths.map(async (path: string) => {
      try {
        const { data, error } = await supabase.storage
          .from(bucketName)
          .createSignedUrl(path, 86400); // 24 hours expiry

        return {
          path,
          signedUrl: error ? null : data.signedUrl,
          error: error?.message || null
        };
      } catch (error: any) {
        return {
          path,
          signedUrl: null,
          error: error.message || 'Unknown error'
        };
      }
    });

    const signedUrls = await Promise.all(signedUrlPromises);

    return NextResponse.json({ signedUrls });
  } catch (error: any) {
    console.error('Error in batch signed URLs:', error);
    return NextResponse.json(
      { error: error.message || 'Something went wrong' },
      { status: 500 }
    );
  }
} 