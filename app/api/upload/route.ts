import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
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

  // Generate a unique file name and save it locally
  const fileName = `${uuidv4()}-${file.name}`;
  const filePath = path.join(process.cwd(), 'public/uploads', fileName);

  try {
    // Ensure the uploads directory exists
    fs.mkdirSync(path.dirname(filePath), { recursive: true });

    // Write the file to the local directory
    fs.writeFileSync(filePath, fileData);

    // Return the relative path for accessing the image
    return NextResponse.json({ url: `/uploads/${fileName}` });
  } catch (error) {
    console.error('File upload error:', error);
    return NextResponse.json({ error: 'File upload failed' }, { status: 500 });
  }
}
