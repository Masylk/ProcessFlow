import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      console.error('Auth error:', authError);
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Check if the request is multipart/form-data or JSON
    const contentType = request.headers.get('content-type');
    let step: string;
    let formData: any;

    if (contentType?.includes('multipart/form-data')) {
      // Handle multipart/form-data (with file)
      const requestFormData = await request.formData();
      step = requestFormData.get('step') as string;
      
      // Get JSON data
      const dataString = requestFormData.get('data') as string;
      formData = JSON.parse(dataString);
      
      // Handle logo file if present
      const logoFile = requestFormData.get('logo') as File;
      if (logoFile) {
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
        
        // Get public URL for the logo
        const { data: { publicUrl } } = supabase.storage
          .from('user-assets')
          .getPublicUrl(`workspaces_logo/${fileName}`);
        
        formData.workspace_icon_url = publicUrl;
      }
    } else {
      // Handle JSON request (without file)
      const json = await request.json();
      step = json.step;
      formData = json.data;
    }

    if (!step || !formData) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Get user from database
    const dbUser = await prisma.user.findUnique({
      where: { auth_id: user.id },
    });

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Handle each onboarding step
    switch (step) {
      case 'PERSONAL_INFO':
        await prisma.user.update({
          where: { id: dbUser.id },
          data: {
            ...formData,
            onboarding_step: 'PROFESSIONAL_INFO'
          }
        });

        // Update Supabase user metadata
        await supabase.auth.updateUser({
          data: {
            onboarding_status: {
              current_step: 'professional-info',
              completed_at: null
            }
          }
        });
        break;

      case 'PROFESSIONAL_INFO':
        // Extract user-specific and workspace-specific data
        const { industry, company_size, ...userData } = formData;
        
        await prisma.user.update({
          where: { id: dbUser.id },
          data: {
            ...userData,
            temp_industry: industry,
            temp_company_size: company_size,
            onboarding_step: 'WORKSPACE_SETUP'
          }
        });

        // Update Supabase user metadata
        await supabase.auth.updateUser({
          data: {
            onboarding_status: {
              current_step: 'workspace-setup',
              completed_at: null
            }
          }
        });
        break;

      case 'WORKSPACE_SETUP':
        // Create workspace
        const workspace = await prisma.workspace.create({
          data: {
            name: formData.workspace_name,
            slug: formData.workspace_url,
            icon_url: formData.workspace_icon_url,
            industry: dbUser.temp_industry || null,
            company_size: dbUser.temp_company_size || null,
            team_tags: [],
            user_workspaces: {
              create: {
                user_id: dbUser.id,
                role: 'ADMIN'
              }
            }
          }
        });

        // Update user with active workspace and complete onboarding
        await prisma.user.update({
          where: { id: dbUser.id },
          data: {
            active_workspace_id: workspace.id,
            onboarding_step: 'COMPLETED',
            onboarding_completed_at: new Date(),
            temp_industry: null,
            temp_company_size: null
          }
        });

        // Update Supabase user metadata
        await supabase.auth.updateUser({
          data: {
            onboarding_status: {
              current_step: 'completed',
              completed_at: new Date().toISOString()
            }
          }
        });
        break;

      case 'INVITED_USER':
        await prisma.user.update({
          where: { id: dbUser.id },
          data: {
            ...formData,
            onboarding_step: 'COMPLETED',
            onboarding_completed_at: new Date()
          }
        });

        // Update Supabase user metadata
        await supabase.auth.updateUser({
          data: {
            onboarding_status: {
              current_step: 'completed',
              completed_at: new Date().toISOString()
            }
          }
        });
        break;

      default:
        return NextResponse.json({ error: 'Invalid step' }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error processing onboarding:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update onboarding information' },
      { status: 500 }
    );
  }
} 