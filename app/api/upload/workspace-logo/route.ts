import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import prisma from '@/lib/prisma';
import { PrismaClient } from '@prisma/client';
import { isVercel } from '@/app/api/utils/isVercel';

// Maximum file size (1MB)
const MAX_FILE_SIZE = 1 * 1024 * 1024;
// Allowed file types
const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/svg+xml'];

export async function POST(request: NextRequest) {
  const prisma_client = isVercel() ? new PrismaClient() : prisma;
  if (!prisma_client) {
    throw new Error('Prisma client not initialized');
  }
  try {
    const supabase = await createClient();
    
    // Check if user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (!user || authError) {
      return NextResponse.json({ error: 'You must be logged in to upload a logo' }, { status: 401 });
    }
    
    // Parse the multipart form data
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const workspaceId = formData.get('workspaceId') as string;
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }
    
    if (!workspaceId) {
      return NextResponse.json({ error: 'No workspace ID provided' }, { status: 400 });
    }
    
    // Validate file type
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      return NextResponse.json({ 
        error: 'Invalid file type. Please use JPEG, PNG, GIF, or SVG images.' 
      }, { status: 400 });
    }
    
    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ 
        error: 'File is too large. Maximum size is 1MB.' 
      }, { status: 400 });
    }
    
    // Get the user from the database
    const dbUser = await prisma_client.user.findUnique({
      where: { auth_id: user.id },
    });
    
    if (!dbUser) {
      return NextResponse.json({ error: 'User not found in database' }, { status: 404 });
    }
    
    // Check if the user has access to the workspace
    const userWorkspace = await prisma_client.user_workspace.findFirst({
      where: {
        user_id: dbUser.id,
        workspace_id: parseInt(workspaceId),
      },
    });
    
    if (!userWorkspace) {
      return NextResponse.json({ 
        error: 'Workspace not found or you do not have access to it' 
      }, { status: 404 });
    }
    
    // Generate a filename following the same pattern as onboarding
    const fileName = `workspace-logo-${user.id}-${Date.now()}`;
    
    // Upload the file to Supabase Storage using the same bucket and path as onboarding
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('user-assets')
      .upload(`workspaces_logo/${fileName}`, file, {
        cacheControl: '3600',
        upsert: false
      });
      
    if (uploadError) {
      console.error('Error uploading file:', uploadError);
      throw new Error('Failed to upload logo');
    }
    
    // Get the public URL using the same method as onboarding
    const { data: { publicUrl } } = supabase.storage
      .from('user-assets')
      .getPublicUrl(`workspaces_logo/${fileName}`);
    
    // Update the workspace in the database with the new logo URL
    await prisma_client.workspace.update({
      where: { 
        id: parseInt(workspaceId) 
      },
      data: { 
        icon_url: publicUrl 
      }
    });
    
    return NextResponse.json({ url: publicUrl });
  } catch (error) {
    console.error('Error in workspace logo upload:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ 
      error: `Internal server error: ${errorMessage}` 
    }, { status: 500 });
  } finally {
    if (isVercel()) {
      await prisma_client.$disconnect();
    }
  }
} 