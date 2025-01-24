import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient'; // Shared Supabase client

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
    console.log('Fetching for : ', path);
    // Generate a signed URL for the requested path
    const { data, error } = await supabase.storage
      .from(bucketName) // Use the bucket name from the environment variable
      .createSignedUrl(path, 60); // 60 seconds expiry

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
