// app/api/step-icons/route.ts
import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export async function GET(req: NextRequest) {
  try {
    // Define the folder paths
    const appsFolder = path.join(process.cwd(), 'public', 'step-icons', 'apps');
    const iconsFolder = path.join(
      process.cwd(),
      'public',
      'step-icons',
      'default-icons'
    );

    // Retrieve file names from both folders
    const [applist, iconlist] = await Promise.all([
      fs.readdir(appsFolder),
      fs.readdir(iconsFolder),
    ]);

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
