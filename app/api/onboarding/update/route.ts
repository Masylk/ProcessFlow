import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import prisma from '@/lib/prisma';

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  
  // Vérifier l'authentification
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  if (authError || !user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  try {
    // Vérifier si la requête est multipart/form-data ou JSON
    const contentType = request.headers.get('content-type');
    
    let step: string;
    let formData: any;

    if (contentType?.includes('multipart/form-data')) {
      // Traiter comme multipart/form-data (avec fichier)
      const requestFormData = await request.formData();
      step = requestFormData.get('step') as string;
      
      // Récupérer les données JSON
      const dataString = requestFormData.get('data') as string;
      formData = JSON.parse(dataString);
      
      // Traiter le fichier logo s'il est présent
      const logoFile = requestFormData.get('logo') as File;
      
      if (logoFile) {
        // Téléchargement du logo vers Supabase Storage
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
        
        // Récupérer l'URL publique du logo
        const { data: { publicUrl } } = supabase.storage
          .from('user-assets')
          .getPublicUrl(`workspaces_logo/${fileName}`);
        
        // Ajouter l'URL du logo aux données du workspace
        formData.workspace_icon_url = publicUrl;
      }
    } else {
      // Traiter comme JSON (sans fichier)
      const json = await request.json();
      step = json.step;
      formData = json.data;
    }

    if (!step || !formData) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Récupérer l'utilisateur depuis la base de données
    const dbUser = await prisma.user.findUnique({
      where: { auth_id: user.id },
    });

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Gérer chaque étape de manière différente
    switch (step) {
      case 'PERSONAL_INFO':
        await prisma.user.update({
          where: { id: dbUser.id },
          data: formData
        });
        break;
        
      case 'PROFESSIONAL_INFO':
        // Extract user-specific and workspace-specific data
        const { industry, company_size, ...userData } = formData;
        
        // Update user data
        await prisma.user.update({
          where: { id: dbUser.id },
          data: userData
        });
        
        // Store industry and company_size temporarily for workspace creation
        // We'll use them when creating the workspace in the next step
        await prisma.$executeRaw`UPDATE "user" SET 
          "temp_industry" = ${industry}, 
          "temp_company_size" = ${company_size} 
          WHERE "id" = ${dbUser.id}`;
        break;
        
      case 'WORKSPACE_SETUP':
        // Get the temporarily stored company data
        const tempUserData = await prisma.user.findUnique({
          where: { id: dbUser.id },
          select: { 
            temp_industry: true, 
            temp_company_size: true 
          }
        });
        
        // Créer un workspace
        const workspace = await prisma.workspace.create({
          data: {
            name: formData.workspace_name,
            slug: formData.workspace_url,
            icon_url: formData.workspace_icon_url,
            industry: tempUserData?.temp_industry || null,
            company_size: tempUserData?.temp_company_size || null,
            team_tags: [],
            // Créer une relation avec l'utilisateur
            user_workspaces: {
              create: {
                user_id: dbUser.id,
                role: 'ADMIN'
              }
            }
          }
        });
        
        // Mettre à jour l'utilisateur avec le workspace actif et marquer l'onboarding comme terminé
        await prisma.user.update({
          where: { id: dbUser.id },
          data: {
            active_workspace_id: workspace.id,
            onboarding_step: 'COMPLETED',
            onboarding_completed_at: new Date(),
            // Clear temporary fields
            temp_industry: null,
            temp_company_size: null
          }
        });
        break;
        
      case 'INVITED_USER':
        // For users who were invited to a workspace
        await prisma.user.update({
          where: { id: dbUser.id },
          data: {
            ...formData,
            onboarding_step: 'COMPLETED',
            onboarding_completed_at: new Date()
          }
        });
        break;
        
      default:
        return NextResponse.json({ error: 'Invalid step' }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error processing request:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Internal server error' 
    }, { status: 500 });
  }
} 