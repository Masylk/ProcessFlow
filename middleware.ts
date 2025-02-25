import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import prisma from './lib/prisma-edge';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value ?? '';
        },
        set(name: string, value: string, options: CookieOptions) {
          response.cookies.set({
            name,
            value,
            ...options,
          });
        },
        remove(name: string, options: CookieOptions) {
          response.cookies.delete({
            name,
            ...options,
          });
        },
      },
    }
  );

  const { data: { session } } = await supabase.auth.getSession();

  // Routes publiques qui ne nécessitent pas d'authentification
  const publicRoutes = ['/login', '/auth/callback', '/register', '/auth/confirm', '/check-email', '/api/auth/confirm'];
  const isPublicRoute = publicRoutes.some(route => 
    request.nextUrl.pathname.startsWith(route)
  );

  // Rediriger vers login si pas de session et route protégée
  if (!session && !isPublicRoute) {
    const redirectUrl = new URL('/login', request.url);
    redirectUrl.searchParams.set('redirect', request.nextUrl.pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // Rediriger vers dashboard si session et sur une route publique
  if (session && isPublicRoute && !request.nextUrl.pathname.includes('/auth/confirm')) {
    try {
      // Utiliser Supabase au lieu de Prisma
      const { data: userData, error } = await supabase
        .from('user')
        .select('onboarding_completed_at, onboarding_step')
        .eq('auth_id', session.user.id)
        .single();

      if (error) throw error;

      if (userData && !userData.onboarding_completed_at) {
        const currentStep = (userData.onboarding_step || 'PERSONAL_INFO').toLowerCase().replace('_', '-');
        return NextResponse.redirect(new URL(`/onboarding/${currentStep}`, request.url));
      }

      return NextResponse.redirect(new URL('/dashboard', request.url));
    } catch (error) {
      console.error('Error in middleware:', error);
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  // Ajouter la protection des routes d'onboarding
  if (request.nextUrl.pathname.startsWith('/onboarding')) {
    if (!session) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    try {
      const user = await prisma.user.findUnique({
        where: { auth_id: session.user.id },
      });

      if (!user) {
        return NextResponse.redirect(new URL('/login', request.url));
      }

      // Si l'onboarding est terminé, rediriger vers le dashboard
      if (user.onboarding_completed_at) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }

      // Vérifier que l'utilisateur suit bien l'ordre des étapes
      const currentStep = request.nextUrl.pathname.split('/').pop() || 'personal-info';
      const stepOrder = ['personal-info', 'professional-info', 'workspace-setup'];
      const currentStepIndex = stepOrder.indexOf(currentStep);
      const userStepIndex = stepOrder.indexOf(
        (user.onboarding_step || 'PERSONAL_INFO').toLowerCase().replace('_', '-')
      );

      if (currentStepIndex > userStepIndex) {
        return NextResponse.redirect(
          new URL(`/onboarding/${stepOrder[userStepIndex]}`, request.url)
        );
      }
    } catch (error) {
      console.error('Error in middleware:', error);
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public assets)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
