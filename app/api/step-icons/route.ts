// app/api/step-icons/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

/**
 * @swagger
 * /api/step-icons:
 *   get:
 *     summary: Retrieve step icons from Supabase storage
 *     description: Fetches lists of application icons and default step icons stored in a Supabase bucket.
 *     responses:
 *       200:
 *         description: Successfully retrieved lists of step icons.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 applist:
 *                   type: array
 *                   items:
 *                     type: string
 *                   description: List of application icons.
 *                   example: ["app1.png", "app2.svg"]
 *                 iconlist:
 *                   type: array
 *                   items:
 *                     type: string
 *                   description: List of default step icons.
 *                   example: ["icon1.png", "icon2.svg"]
 *       500:
 *         description: Internal server error, possibly due to missing configuration or failed file retrieval from Supabase.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Failed to retrieve files"
 */
export async function GET(req: NextRequest) {
  try {
    // Retrieve the bucket name from the environment variable
    const bucketName = process.env.NEXT_PUBLIC_SUPABASE_PUBLIC_BUCKET;

    if (!bucketName) {
      console.error('Bucket name is not defined in the environment variables.');
      return NextResponse.json(
        { error: 'Bucket name is not configured' },
        { status: 500 }
      );
    }

    // Define the folder paths within the bucket
    const appsFolder = 'step-icons/apps';
    const iconsFolder = 'step-icons/default-icons';

    // Fetch the file lists from the Supabase bucket
    const [appsResponse, iconsResponse] = await Promise.all([
      supabase.storage.from(bucketName).list(appsFolder),
      supabase.storage.from(bucketName).list(iconsFolder),
    ]);

    // Check for errors in the responses
    if (appsResponse.error || iconsResponse.error) {
      console.error('Error retrieving files from Supabase:', {
        appsError: appsResponse.error,
        iconsError: iconsResponse.error,
      });
      return NextResponse.json(
        { error: 'Failed to retrieve files from Supabase' },
        { status: 500 }
      );
    }

    // Extract file names from the responses
    const applist = appsResponse.data?.map((file) => file.name) || [];
    const iconlist = iconsResponse.data?.map((file) => file.name) || [];

    // Return the lists as JSON
    return NextResponse.json({ applist, iconlist });
  } catch (error) {
    console.error('Error retrieving files:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve files' },
      { status: 500 }
    );
  }
}
