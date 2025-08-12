// app/api/get-signed-url/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { generatePublicUrl } from '../utils/generatePublicUrl';

/**
 * @swagger
 * /api/get-signed-url:
 *   get:
 *     summary: Get a public URL for a file in the public Supabase bucket
 *     description: Generates a public URL for accessing a file stored in the public Supabase storage bucket.
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
 *         description: Successfully generated public URL
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 signedUrl:
 *                   type: string
 *                   description: The public URL for accessing the file.
 *                   example: "https://fshqhpophyrgrvhzyrto.supabase.co/storage/v1/object/public/user-assets/folder/file.png"
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
 *                   example: "Supabase URL or storage path is not defined in the environment variables"
 */
export async function GET(req: NextRequest) {
  // Parse the query parameters
  const { searchParams } = new URL(req.url);
  const path = searchParams.get('path');

  if (!path) {
    return NextResponse.json({ error: 'Path is required' }, { status: 400 });
  }

  try {
    // Generate the public URL using the utility function
    const publicUrl = generatePublicUrl(path);

    return NextResponse.json({ signedUrl: publicUrl });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Something went wrong' },
      { status: 500 }
    );
  }
}
