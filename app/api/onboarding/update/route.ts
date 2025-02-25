import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(req: Request) {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  try {
    const { step, data } = await req.json();

    const user = await prisma.user.update({
      where: { auth_id: session.user.id },
      data: {
        ...data,
        ...(step === 'WORKSPACE_SETUP' && {
          onboarding_completed_at: new Date(),
        }),
      },
    });

    // Si c'est l'étape workspace, créer le workspace
    if (step === 'WORKSPACE_SETUP') {
      const workspace = await prisma.workspace.create({
        data: {
          name: data.workspace_name,
          slug: data.workspace_url.toLowerCase().replace(/\s+/g, '-'),
          background_colour: '#4299E1',
          team_tags: [],
          user_workspaces: {
            create: {
              user_id: user.id,
              role: 'ADMIN',
            },
          },
        },
      });

      // Mettre à jour le workspace actif de l'utilisateur
      await prisma.user.update({
        where: { id: user.id },
        data: { active_workspace_id: workspace.id },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating onboarding:', error);
    return NextResponse.json(
      { error: 'Failed to update onboarding' },
      { status: 500 }
    );
  }
} 