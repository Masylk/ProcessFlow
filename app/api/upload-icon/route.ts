import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createClient as createServerClient } from '@/utils/supabase/server';
import prisma from '@/lib/prisma';
import { PrismaClient } from '@prisma/client';
import { isVercel } from '@/app/api/utils/isVercel';

const ALLOWED_FILE_TYPES = ['image/png', 'image/jpeg', 'image/svg+xml'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * Handles icon file uploads to workspace-specific folders
 * @param {NextRequest} request - The incoming request containing the file
 * @returns {Promise<NextResponse>} JSON response with the uploaded file URL or error
 */
export async function POST(request: NextRequest) {
  const prisma_client = isVercel() ? new PrismaClient() : prisma;
  if (!prisma_client) {
    throw new Error('Prisma client not initialized');
  }

  try {
    // Get authenticated user
    const supabaseServer = await createServerClient();
    const { data: userData, error: userError } = await supabaseServer.auth.getUser();

    if (userError || !userData || !userData.user) {
      return NextResponse.json(
        { 
          success: false,
          error: 'User not authenticated' 
        },
        { status: 401 }
      );
    }

    const userUID = userData.user.id;

    // Get user's active workspace
    const user = await prisma_client.user.findUnique({
      where: { auth_id: userUID },
      include: {
        active_workspace: true
      }
    });

    if (!user || !user.active_workspace) {
      return NextResponse.json(
        { 
          success: false,
          error: 'No active workspace found' 
        },
        { status: 400 }
      );
    }

    const workspaceSlug = user.active_workspace.slug;

    // Input validation
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { 
          success: false,
          error: 'No file provided' 
        },
        { status: 400 }
      );
    }

    // Validate file type
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Invalid file type. Please upload PNG, JPEG, or SVG files.' 
        },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { 
          success: false,
          error: 'File size exceeds 5MB limit.' 
        },
        { status: 400 }
      );
    }

    // Convert File to Buffer
    const buffer = Buffer.from(await file.arrayBuffer());
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    
    // Generate a secure filename and upload to workspace-specific icons folder
    const timestamp = Date.now();
    const randomString = crypto.randomUUID();
    const fileName = `${timestamp}-${randomString}.${fileExtension}`;
    const filePath = `uploads/${workspaceSlug}/icons/${fileName}`;

    // Upload to Supabase Storage
    const { error: uploadError, data } = await supabase.storage
      .from(process.env.NEXT_PUBLIC_SUPABASE_WORKSPACE_BUCKET!)
      .upload(filePath, buffer, {
        contentType: file.type,
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) {
      console.error('Supabase upload error:', uploadError);
      return NextResponse.json(
        { 
          success: false,
          error: 'Failed to upload file to storage' 
        },
        { status: 500 }
      );
    }

    // Get the public URL for the uploaded file
    const { data: { publicUrl } } = supabase.storage
      .from(process.env.NEXT_PUBLIC_SUPABASE_WORKSPACE_BUCKET!)
      .getPublicUrl(filePath);

    if (process.env.NODE_ENV === 'development') {
      console.log('publicUrl', publicUrl);
      console.log('filePath', filePath);
    }
    // Return success response with file information
    return NextResponse.json({
      success: true,
      data: {
        iconUrl: filePath,
        publicUrl: publicUrl
      }
    }, { 
      status: 201,
      headers: {
        'Content-Type': 'application/json'
      }
    });

  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Internal server error',
      },
      { status: 500 }
    );
  } finally {
    if (isVercel()) await prisma_client.$disconnect();
  }
}

// Configure request size limit
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '5mb',
    },
  },
}; 