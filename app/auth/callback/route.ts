import { createClient } from '@/lib/supabaseServerClient';
import { NextResponse, type NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { PostHog } from 'posthog-node';
import * as Sentry from '@sentry/nextjs';

const posthog = new PostHog(
  process.env.NEXT_PUBLIC_POSTHOG_KEY as string,
  {
    host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
  }
);

export async function GET(request: NextRequest) {
  try {
    const requestUrl = new URL(request.url);
    const code = requestUrl.searchParams.get('code');
    
    if (!code) {
      console.error('No code received in callback');
      return NextResponse.redirect(new URL('/login?error=no_code', request.url));
    }

    const supabase = createClient();
    const { data: { session }, error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (error) {
      console.error('Error exchanging code:', error);
      return NextResponse.redirect(new URL('/login?error=auth', request.url));
    }

    if (!session) {
      return NextResponse.redirect(new URL('/login?error=no_session', request.url));
    }

    // Vérifier si l'utilisateur existe et son état d'onboarding
    const existingUser = await prisma.user.findUnique({
      where: { auth_id: session.user.id }
    });

    // Définir la redirection en fonction de l'état de l'onboarding
    let redirectUrl = '/dashboard'; // Par défaut, rediriger vers le dashboard

    if (existingUser) {
      // Si l'onboarding n'est pas terminé, rediriger vers l'étape appropriée
      if (!existingUser.onboarding_completed_at) {
        const onboardingSteps: Record<string, string> = {
          'PERSONAL_INFO': '/onboarding/personal-info',
          'PROFESSIONAL_INFO': '/onboarding/professional-info',
          'WORKSPACE_SETUP': '/onboarding/workspace-setup',
          'COMPLETED': '/dashboard',
          'INVITED_USER': '/onboarding/personal-info'
        };
        
        redirectUrl = onboardingSteps[existingUser.onboarding_step || 'PERSONAL_INFO'];
      }
    } else {
      // Nouvel utilisateur, créer l'entrée dans la base de données
      await prisma.user.create({
        data: {
          auth_id: session.user.id,
          email: session.user.email || '',
          first_name: session.user.user_metadata?.full_name?.split(' ')[0] || '',
          last_name: session.user.user_metadata?.full_name?.split(' ').slice(1).join(' ') || '',
          full_name: session.user.user_metadata?.full_name || '',
          onboarding_step: 'PROFESSIONAL_INFO', // Pour les utilisateurs Google, on skip l'étape personal-info
          avatar_url: session.user.user_metadata?.avatar_url,
        },
      });
      
      redirectUrl = '/onboarding/professional-info';
    }

    // Set session cookies and redirect
    const response = NextResponse.redirect(new URL(redirectUrl, requestUrl.origin));
    
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
    console.error('Top level error in callback:', error);
    return NextResponse.redirect(new URL('/login?error=callback', request.url));
  }
} 