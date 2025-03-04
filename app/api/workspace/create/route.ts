import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import prisma from '@/lib/prisma';

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  
  // Check authentication
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  if (authError || !user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  try {
    // Check if the request is multipart/form-data or JSON
    const contentType = request.headers.get('content-type');
    
    let formData: any;

    if (contentType?.includes('multipart/form-data')) {
      // Process as multipart/form-data (with file)
      const requestFormData = await request.formData();
      
      // Get the JSON data
      const dataString = requestFormData.get('data') as string;
      formData = JSON.parse(dataString);
      
      // Process the logo file if present
      const logoFile = requestFormData.get('logo') as File;
      
      if (logoFile) {
        // Upload the logo to Supabase Storage
        const fileName = `workspace-logo-${user.id}-${Date.now()}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('user-assets')
          .upload(`workspaces_logo/${fileName}`, logoFile, {
            cacheControl: '3600',
            upsert: false
          });
        
        if (uploadError) {
          console.error('Error uploading logo:', uploadError);
          throw new Error('Failed to upload logo');
        }
        
        // Get the public URL of the logo
        const { data: { publicUrl } } = supabase.storage
          .from('user-assets')
          .getPublicUrl(`workspaces_logo/${fileName}`);
        
        // Add the logo URL to the workspace data
        formData.icon_url = publicUrl;
      }
    } else {
      // Process as JSON (without file)
      formData = await request.json();
    }

    // Get the user from the database
    const dbUser = await prisma.user.findUnique({
      where: { auth_id: user.id },
    });

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Validate required fields
    if (!formData.name) {
      return NextResponse.json({ error: 'Workspace name is required' }, { status: 400 });
    }

    // Create a workspace
    const workspace = await prisma.workspace.create({
      data: {
        name: formData.name,
        slug: formData.slug || formData.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
        icon_url: formData.icon_url || null,
        industry: formData.industry || null,
        company_size: formData.company_size || null,
        team_tags: [],
        // Create a relationship with the user
        user_workspaces: {
          create: {
            user_id: dbUser.id,
            role: 'ADMIN'
          }
        }
      }
    });
    
    // Return the created workspace in a format the frontend expects
    return NextResponse.json({ workspace });
  } catch (error) {
    console.error('Error processing request:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Internal server error' 
    }, { status: 500 });
  }
} 