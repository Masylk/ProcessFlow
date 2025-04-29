import { createClient } from '@/lib/supabaseServerClient';
import { NextResponse, type NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { PostHog } from 'posthog-node';
import * as Sentry from '@sentry/nextjs';
import { createDefaultWorkflow } from '@/app/api/utils/create-default-workflow';

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
    const token_hash = requestUrl.searchParams.get('token_hash');
    const type = requestUrl.searchParams.get('type');
    const inviteToken = requestUrl.searchParams.get('invite_token');
    const workspaceId = requestUrl.searchParams.get('workspace_id');

    if (!code && !token_hash) {
      console.error('No code or token_hash found in URL');
      return NextResponse.redirect(new URL('/login?error=no-code', request.url));
    }

    const supabase = createClient();

    // Handle email confirmation (using either token_hash or code)
    const verifyData = token_hash ? 
      await supabase.auth.verifyOtp({
        token_hash,
        type: 'email'
      }) :
      await supabase.auth.exchangeCodeForSession(code as string);

    if (verifyData.error) {
      console.error('Error verifying email:', verifyData.error);
      return NextResponse.redirect(new URL('/login?error=confirmation-failed', request.url));
    }

    const { data: { user, session } } = verifyData;

    if (user && session) {
      try {
        const existingUser = await prisma.user.findUnique({
          where: { auth_id: user.id }
        });

        let redirectUrl = '/onboarding/personal-info';

        if (!existingUser) {
          // Check if it's a Google sign-in
          const isGoogleAuth = user.app_metadata?.provider === 'google';
          const googleAvatarUrl = isGoogleAuth ? user.user_metadata?.avatar_url : null;
          const firstName = user.user_metadata?.full_name?.split(' ')[0] || '';
          const lastName = user.user_metadata?.full_name?.split(' ').slice(1).join(' ') || '';

          // Create new user with Google avatar if available
          const newUser = await prisma.user.create({
            data: {
              auth_id: user.id,
              email: user.email || '',
              first_name: firstName,
              last_name: lastName,
              full_name: user.user_metadata?.full_name || '',
              avatar_url: googleAvatarUrl, // Store Google avatar URL
              onboarding_step: isGoogleAuth ? 'PROFESSIONAL_INFO' : 'PERSONAL_INFO'
            }
          });

          // For Google users, create a temporary workspace
          if (isGoogleAuth && newUser) {
            // const tempWorkspaceId = await createTempWorkspaceForGoogle(
            //   newUser.id,
            //   newUser.first_name || 'New',
            //   newUser.last_name || 'User'
            // );
            
            // if (tempWorkspaceId) {
            //   await supabase.auth.updateUser({
            //     data: {
            //       temp_workspace_id: tempWorkspaceId
            //     }
            //   });
            // }

            redirectUrl = '/onboarding/professional-info';
          }
        } else if (inviteToken && workspaceId) {
          // Handle workspace invitation
          redirectUrl = `/auth/workspace-invite?token=${inviteToken}&workspace_id=${workspaceId}`;
        } else {
          redirectUrl = '/dashboard';
        }

        const response = NextResponse.redirect(new URL(redirectUrl, request.url));
        
        response.cookies.set('sb-access-token', session.access_token, {
          path: '/',
          sameSite: 'lax',
          maxAge: 60 * 60 * 24 * 7, // 7 days
        });
        
        response.cookies.set('sb-refresh-token', session.refresh_token!, {
          path: '/',
          sameSite: 'lax',
          maxAge: 60 * 60 * 24 * 7, // 7 days
        });

        return response;
      } catch (error) {
        console.error('Database error:', error);
        return NextResponse.redirect(new URL('/login?error=database', request.url));
      }
    }

    return NextResponse.redirect(new URL('/login?error=invalid-confirmation-type', request.url));
  } catch (error) {
    console.error('Unexpected error during confirmation:', error);
    return NextResponse.redirect(new URL('/login?error=confirmation-failed', request.url));
  }
} 