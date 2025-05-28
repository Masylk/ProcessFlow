import { NextRequest, NextResponse } from 'next/server';
import { generatePublicUrl } from '../utils/generatePublicUrl';

/**
 * @swagger
 * /api/batch-signed-urls:
 *   post:
 *     summary: Get public URLs for multiple files in batch
 *     description: Generates public URLs for multiple files stored in the public Supabase storage bucket.
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
 *         description: Successfully generated public URLs
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

    // Generate public URLs for all paths
    const signedUrls = paths.map((path: string) => {
      try {
        const publicUrl = generatePublicUrl(path);
        return {
          path,
          signedUrl: publicUrl,
          error: null
        };
      } catch (error: any) {
        return {
          path,
          signedUrl: null,
          error: error.message || 'Unknown error'
        };
      }
    });

    return NextResponse.json({ signedUrls });
  } catch (error: any) {
    console.error('Error in batch public URLs:', error);
    return NextResponse.json(
      { error: error.message || 'Something went wrong' },
      { status: 500 }
    );
  }
} 