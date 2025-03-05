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
  const supabase = createClient();

  const { data: { user }, error: userError } = await supabase.auth.getUser();
  
  if (!user) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  try {
    const existingUser = await prisma.user.findUnique({
      where: { auth_id: user.id }
    });

    if (existingUser) {
      if (!existingUser.onboarding_completed_at) {
        const onboardingStep = (existingUser.onboarding_step || 'PERSONAL_INFO').toLowerCase().replace('_', '-');
        // Update user metadata in Supabase
        await supabase.auth.updateUser({
          data: {
            onboarding_status: {
              current_step: onboardingStep,
              completed_at: null
            }
          }
        });
        return NextResponse.redirect(new URL(`/onboarding/${onboardingStep}`, request.url));
      }
      
      // Update user metadata to mark onboarding as complete
      await supabase.auth.updateUser({
        data: {
          onboarding_status: {
            current_step: 'completed',
            completed_at: new Date().toISOString()
          }
        }
      });
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    // Create new user
    const newUser = await prisma.user.create({
      data: {
        auth_id: user.id,
        email: user.email || '',
        first_name: user.user_metadata?.full_name?.split(' ')[0] || '',
        last_name: user.user_metadata?.full_name?.split(' ').slice(1).join(' ') || '',
        full_name: user.user_metadata?.full_name || '',
        onboarding_step: 'PROFESSIONAL_INFO',
        avatar_url: user.user_metadata?.avatar_url,
      },
    });

    // Update user metadata in Supabase
    await supabase.auth.updateUser({
      data: {
        onboarding_status: {
          current_step: 'personal-info',
          completed_at: null
        }
      }
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

    return NextResponse.redirect(new URL('/onboarding/personal-info', request.url));
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.redirect(new URL('/login?error=database', request.url));
  }
}

export async function POST(request: NextRequest) {
  const supabase = createClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  
  if (!user) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  try {
    const existingUser = await prisma.user.findUnique({
      where: { auth_id: user.id }
    });

    if (existingUser) {
      if (!existingUser.onboarding_completed_at) {
        const onboardingStep = (existingUser.onboarding_step || 'PERSONAL_INFO').toLowerCase().replace('_', '-');
        // Update user metadata in Supabase
        await supabase.auth.updateUser({
          data: {
            onboarding_status: {
              current_step: onboardingStep,
              completed_at: null
            }
          }
        });
        return NextResponse.json({ redirect: `/onboarding/${onboardingStep}` });
      }
      
      // Update user metadata to mark onboarding as complete
      await supabase.auth.updateUser({
        data: {
          onboarding_status: {
            current_step: 'completed',
            completed_at: new Date().toISOString()
          }
        }
      });
      return NextResponse.json({ redirect: '/dashboard' });
    }

    // Create new user
    const newUser = await prisma.user.create({
      data: {
        auth_id: user.id,
        email: user.email || '',
        first_name: user.user_metadata?.full_name?.split(' ')[0] || '',
        last_name: user.user_metadata?.full_name?.split(' ').slice(1).join(' ') || '',
        full_name: user.user_metadata?.full_name || '',
        onboarding_step: 'PROFESSIONAL_INFO',
        avatar_url: user.user_metadata?.avatar_url,
      },
    });

    // Update user metadata in Supabase
    await supabase.auth.updateUser({
      data: {
        onboarding_status: {
          current_step: 'personal-info',
          completed_at: null
        }
      }
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

    return NextResponse.json({ redirect: '/onboarding/personal-info' });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
} 