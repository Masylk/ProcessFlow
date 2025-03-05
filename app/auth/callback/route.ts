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
    const type = requestUrl.searchParams.get('type');
    const invitationToken = requestUrl.searchParams.get('invitation');
    
    if (!code) {
      console.error('No code received in callback');
      return NextResponse.redirect(new URL('/login?error=no_code', request.url));
    }

    // Handle email confirmation
    if (type === 'email_confirmation') {
      const supabase = createClient();
      const { data: { session }, error } = await supabase.auth.verifyOtp({
        token_hash: code,
        type: 'email',
      });

      if (error) {
        console.error('Error verifying email:', error);
        return NextResponse.redirect(new URL('/login?error=email_verification', request.url));
      }

      // Update user's email verification status in your database if needed
      if (session?.user) {
        await prisma.user.update({
          where: { auth_id: session.user.id },
          data: {
            // Add any additional fields you want to update
          }
        });
      }

      return NextResponse.redirect(new URL('/dashboard', request.url));
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
          'INVITED_USER': '/onboarding/invited-user',
          'COMPLETED': '/dashboard'
        };
        
        redirectUrl = onboardingSteps[existingUser.onboarding_step || 'PERSONAL_INFO'];
      }
    } else {
      // Nouvel utilisateur, créer l'entrée dans la base de données
      // Check if user was invited
      if (invitationToken) {
        try {
          // Here you would verify the invitation token and get workspace_id
          // This is pseudo-code - you'll need to implement the actual invitation verification
          const invitation = await prisma.invitation.findUnique({
            where: { token: invitationToken }
          });
          
          if (invitation && !invitation.used) {
            await prisma.user.create({
              data: {
                auth_id: session.user.id,
                email: session.user.email || '',
                first_name: session.user.user_metadata?.full_name?.split(' ')[0] || '',
                last_name: session.user.user_metadata?.full_name?.split(' ').slice(1).join(' ') || '',
                full_name: session.user.user_metadata?.full_name || '',
                onboarding_step: 'INVITED_USER',
                avatar_url: session.user.user_metadata?.avatar_url,
                // Add the user to the workspace they were invited to
                workspaces: {
                  create: {
                    workspace_id: invitation.workspace_id,
                    role: invitation.role || 'READER'
                  }
                },
                active_workspace_id: invitation.workspace_id
              },
            });
            
            // Mark invitation as used
            await prisma.invitation.update({
              where: { id: invitation.id },
              data: { used: true, used_at: new Date() }
            });
            
            redirectUrl = '/onboarding/invited-user';
          } else {
            // Invalid or used invitation
            redirectUrl = '/onboarding/personal-info';
          }
        } catch (error) {
          console.error('Error processing invitation:', error);
          redirectUrl = '/onboarding/personal-info';
        }
      } else {
        // Regular new user (not invited)
        await prisma.user.create({
          data: {
            auth_id: session.user.id,
            email: session.user.email || '',
            first_name: session.user.user_metadata?.full_name?.split(' ')[0] || '',
            last_name: session.user.user_metadata?.full_name?.split(' ').slice(1).join(' ') || '',
            full_name: session.user.user_metadata?.full_name || '',
            onboarding_step: session.user.app_metadata?.provider === 'google' 
              ? 'PROFESSIONAL_INFO'  // Skip personal info for Google users since we have their data
              : 'PERSONAL_INFO',     // Start with personal info for email users
            avatar_url: session.user.user_metadata?.avatar_url,
          },
        });
        
        redirectUrl = session.user.app_metadata?.provider === 'google'
          ? '/onboarding/professional-info'
          : '/onboarding/personal-info';
      }
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