import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function GET(req: NextRequest) {
  try {
    // Retrieve the bucket name from the environment variable
    const bucketName = process.env.NEXT_PUBLIC_SUPABASE_PRIVATE_BUCKET;

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
