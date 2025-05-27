import { createClient } from '@/utils/supabase/server';
import { NextResponse, type NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { PrismaClient } from '@prisma/client';
import { isVercel } from '@/app/api/utils/isVercel';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const token_hash = requestUrl.searchParams.get('token_hash');
  const type = requestUrl.searchParams.get('type');

  if (!token_hash || !type) {
    return NextResponse.redirect(new URL('/login?error=invalid_token', request.url));
  }

  const supabase = await createClient();

  // Choose the correct Prisma client
  const prisma_client = isVercel() ? new PrismaClient() : prisma;

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
        const existingUser = await prisma_client.user.findUnique({
          where: { auth_id: data.user.id }
        });

        if (!existingUser) {
          await prisma_client.user.create({
            data: {
              auth_id: data.user.id,
              email: data.user.email || '',
              first_name: '',
              last_name: '',
              full_name: '',
            }
          });
        }

        const response = NextResponse.redirect(new URL('/onboarding', request.url));
        
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
  } finally {
    if (isVercel()) {
      await prisma_client.$disconnect();
    }
  }
} 