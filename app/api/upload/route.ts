import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient'; // Shared Supabase client
import { v4 as uuidv4 } from 'uuid';

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

    console.log('FILEPATH: ' + filePath);
    return NextResponse.json({
      message: `File uploaded successfully: ${filePath}`,
      filePath,
    });
  } catch (error) {
    console.error('File upload error:', error);
    return NextResponse.json({ error: 'File upload failed' }, { status: 500 });
  }
}
