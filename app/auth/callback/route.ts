import { createClient } from '@/lib/supabaseServerClient';
import { NextResponse, type NextRequest } from 'next/server';
import prisma from '@/lib/prisma-edge';
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
  const type = requestUrl.searchParams.get('type');
  
  console.log('Callback URL:', request.url);
  console.log('Code reçu:', code);

  if (code) {
    const supabase = createClient();
    const { data: { session }, error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (error) {
      console.error('Erreur lors de l\'échange du code:', error);
      return NextResponse.redirect(new URL('/login?error=auth', request.url));
    }

    if (session?.user) {
      try {
        const existingUser = await prisma.user.findUnique({
          where: { auth_id: session.user.id }
        });

        if (existingUser) {
          // Si l'utilisateur existe déjà et n'a pas terminé l'onboarding
          if (!existingUser.onboarding_completed_at) {
            const onboardingStep = (existingUser.onboarding_step || 'PERSONAL_INFO').toLowerCase().replace('_', '-');
            return NextResponse.redirect(
              new URL(`/onboarding/${onboardingStep}`, requestUrl.origin)
            );
          }
          
          // Si l'onboarding est terminé, rediriger vers le dashboard
          return NextResponse.redirect(new URL('/dashboard', requestUrl.origin));
        }

        console.log('Création d\'un nouvel utilisateur:', {
          id: session.user.id,
          email: session.user.email,
          metadata: session.user.user_metadata
        });

        // Créer l'utilisateur et son workspace par défaut
        const newUser = await prisma.user.create({
          data: {
            auth_id: session.user.id,
            email: session.user.email || '',
            first_name: session.user.user_metadata?.full_name?.split(' ')[0] || '',
            last_name: session.user.user_metadata?.full_name?.split(' ').slice(1).join(' ') || '',
            full_name: session.user.user_metadata?.full_name || '',
            onboarding_step: 'PROFESSIONAL_INFO',
            avatar_url: session.user.user_metadata?.avatar_url,
          },
        });

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

        // Créer un cookie de session
        const response = NextResponse.redirect(new URL('/onboarding/personal-info', request.url));
        
        response.cookies.set('sb-access-token', session.access_token, {
          path: '/',
          sameSite: 'lax',
        });
        
        response.cookies.set('sb-refresh-token', session.refresh_token!, {
          path: '/',
          sameSite: 'lax',
        });

        return response;
      } catch (error) {
        console.error('Database error:', error);
        return NextResponse.redirect(`${requestUrl.origin}/login?error=database`);
      }
    }
  }

  console.error('Pas de code reçu dans le callback');
  return NextResponse.redirect(new URL('/login?error=no_code', request.url));
} 