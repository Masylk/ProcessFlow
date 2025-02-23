import { createClient } from '@/utils/supabase/server';
import { NextResponse, type NextRequest } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const token_hash = requestUrl.searchParams.get('token_hash');
  const type = requestUrl.searchParams.get('type');

  if (!token_hash || !type) {
    return NextResponse.redirect(new URL('/login?error=invalid_token', request.url));
  }

  const supabase = await createClient();

  try {
    const { data, error } = await supabase.auth.verifyOtp({
      token_hash,
      type: 'email'
    });

    if (error) {
      console.error('Verification error:', error);
      return NextResponse.redirect(new URL(`/login?error=${error.message}`, request.url));
    }

    if (data?.user && data?.session) {
      try {
        const existingUser = await prisma.user.findUnique({
          where: { auth_id: data.user.id }
        });

        if (!existingUser) {
          await prisma.user.create({
            data: {
              auth_id: data.user.id,
              email: data.user.email || '',
              first_name: '',
              last_name: '',
              full_name: '',
              onboarding_step: 'PERSONAL_INFO'
            }
          });
        }

        const response = NextResponse.redirect(new URL('/onboarding/personal-info', request.url));
        
        response.cookies.set('sb-access-token', data.session.access_token, {
          path: '/',
          sameSite: 'lax',
          maxAge: 60 * 60 * 24 * 7, // 7 jours
        });
        
        response.cookies.set('sb-refresh-token', data.session.refresh_token!, {
          path: '/',
          sameSite: 'lax',
          maxAge: 60 * 60 * 24 * 7, // 7 jours
        });

        return response;
      } catch (error) {
        console.error('Database error:', error);
        return NextResponse.redirect(new URL('/login?error=database', request.url));
      }
    }

    return NextResponse.redirect(new URL('/login?error=no_session', request.url));
  } catch (error) {
    console.error('Error during confirmation:', error);
    return NextResponse.redirect(new URL('/login?error=confirmation_failed', request.url));
  }
} 