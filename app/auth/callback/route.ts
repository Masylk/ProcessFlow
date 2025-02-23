import { createClient } from '@/lib/supabaseServerClient';
import { NextResponse, type NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { PostHog } from 'posthog-node';
import * as Sentry from '@sentry/nextjs';

// Initialiser PostHog pour le côté serveur
const posthog = new PostHog(
  process.env.NEXT_PUBLIC_POSTHOG_KEY as string,
  {
    host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
  }
);

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  
  console.log('Callback URL:', request.url);
  console.log('Code reçu:', code);

  if (code) {
    const supabase = createClient();
    const { data: { session }, error: sessionError } = await supabase.auth.exchangeCodeForSession(code);
    
    if (sessionError) {
      console.error('Erreur lors de l\'échange du code:', sessionError);
      return NextResponse.redirect(`${requestUrl.origin}/login?error=auth`);
    }

    if (session?.user) {
      try {
        // Vérifier si l'utilisateur existe déjà
        const existingUser = await prisma.user.findUnique({
          where: { auth_id: session.user.id }
        });

        if (!existingUser) {
          console.log('Création d\'un nouvel utilisateur:', {
            id: session.user.id,
            email: session.user.email,
            metadata: session.user.user_metadata
          });

          // Créer l'utilisateur et son workspace par défaut
          const [newUser, defaultWorkspace] = await prisma.$transaction([
            prisma.user.create({
              data: {
                auth_id: session.user.id,
                email: session.user.email || '',
                first_name: session.user.user_metadata?.full_name?.split(' ')[0] || '',
                last_name: session.user.user_metadata?.full_name?.split(' ').slice(1).join(' ') || '',
                full_name: session.user.user_metadata?.full_name || '',
                avatar_url: session.user.user_metadata?.avatar_url,
              },
            }),
            prisma.workspace.create({
              data: {
                name: 'My Workspace',
                background_colour: '#4299E1',
                team_tags: [],
              },
            }),
          ]);

          await prisma.$transaction([
            prisma.user.update({
              where: { id: newUser.id },
              data: {
                active_workspace_id: defaultWorkspace.id,
              },
            }),
            prisma.user_workspace.create({
              data: {
                user_id: newUser.id,
                workspace_id: defaultWorkspace.id,
                role: 'ADMIN',
              },
            }),
          ]);

          // Tracking PostHog
          await posthog.capture({
            distinctId: String(newUser.id),
            event: 'signup_google',
            properties: {
              email: newUser.email,
              firstName: newUser.first_name,
              lastName: newUser.last_name,
              provider: 'google',
              $set: {
                email: newUser.email,
                firstName: newUser.first_name,
                lastName: newUser.last_name,
              }
            }
          });

          Sentry.setUser({
            id: String(newUser.id),
            email: newUser.email,
          });
        } else {
          // Si l'utilisateur existe déjà, on track la connexion
          await posthog.capture({
            distinctId: String(existingUser.id),
            event: 'login_google',
            properties: {
              email: existingUser.email,
              provider: 'google'
            }
          });

          Sentry.setUser({
            id: String(existingUser.id),
            email: existingUser.email,
          });
        }

        return NextResponse.redirect(`${requestUrl.origin}/dashboard`);
      } catch (error) {
        console.error('Erreur base de données:', error);
        Sentry.captureException(error);
        return NextResponse.redirect(`${requestUrl.origin}/login?error=database`);
      }
    }
  }

  console.error('Pas de code reçu dans le callback');
  return NextResponse.redirect(`${requestUrl.origin}/login?error=no_code`);
} 