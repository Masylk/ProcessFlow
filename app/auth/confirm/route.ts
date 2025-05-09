import { createClient } from '@/utils/supabase/server';
import { NextResponse, type NextRequest } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const token_hash = requestUrl.searchParams.get('token_hash');
  const code = requestUrl.searchParams.get('code');
  const type = requestUrl.searchParams.get('type') || 'email'; // Default to email if not specified

  // Check for either token_hash (password recovery) or code (email confirmation)
  if (!token_hash && !code) {
    return NextResponse.redirect(new URL('/login?error=invalid_token', request.url));
  }

  const supabase = await createClient();

  try {
    // Handle password recovery
    if (type === 'recovery' && token_hash) {
      const { data, error } = await supabase.auth.verifyOtp({
        token_hash,
        type: 'recovery'
      });
      
      if (error) {
        console.error('Error verifying recovery token:', error);
        return NextResponse.redirect(new URL('/login?error=recovery-failed', request.url));
      }

      // Set a cookie to indicate that password reset is required and store the user ID
      const response = NextResponse.redirect(new URL('/reset-password', request.url));
      response.cookies.set('password-reset-token', token_hash, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 30 // 30 minutes
      });
      
      // Store the user ID in a separate cookie for the reset password page
      if (data.user) {
        response.cookies.set('reset-user-id', data.user.id, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 60 * 30 // 30 minutes
        });
      }
      
      return response;
    }

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

        if (!existingUser) {
          await prisma.user.create({
            data: {
              auth_id: user.id,
              email: user.email || '',
              first_name: '',
              last_name: '',
              full_name: '',
              onboarding_step: 'PERSONAL_INFO'
            }
          });
        }

        const response = NextResponse.redirect(new URL('/onboarding', request.url));
        
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