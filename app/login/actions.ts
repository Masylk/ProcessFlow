'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/utils/supabase/server';
import prisma from '@/lib/prisma-edge';
import { sendEmail } from '../utils/mail';
import { render } from '@react-email/render';
import WelcomeEmail from '../emails/WelcomeEmail';
import { Prisma } from '@prisma/client';
import { redirect } from 'next/navigation';

export async function login(formData: FormData) {
  const supabase = await createClient();

  const credentials = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  };

  const { data, error } = await supabase.auth.signInWithPassword(credentials);

  if (error) {
    console.error('Login error:', error);
    return { error: error.message };
  }

  const user = data?.user;
  if (!user) return { error: 'No user returned from signInWithPassword' };

  // Vérifier l'état de l'onboarding
  const dbUser = await prisma.user.findUnique({
    where: { auth_id: user.id },
  });

  if (!dbUser) return { error: 'User not found in database' };

  if (!dbUser.onboarding_completed_at) {
    const currentStep = (dbUser.onboarding_step || 'PERSONAL_INFO').toLowerCase().replace('_', '-');
    return {
      id: dbUser.id.toString(),
      email: dbUser.email,
      redirectTo: `/onboarding/${currentStep}`
    };
  }

  return {
    id: dbUser.id.toString(),
    email: dbUser.email,  
    redirectTo: '/dashboard'
  };
}

export async function signup(formData: FormData) {
  const supabase = await createClient();

  const credentials = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_BASE_URL}/auth/confirm`,
    },
  };

  const { data, error: authError } = await supabase.auth.signUp(credentials);
  if (authError) {
    console.error('Sign up error:', authError);
    return { error: authError.message };
  }

  const user = data?.user;
  if (!user) return { error: 'No user returned from signUp' };

  return {
    id: user.id,
    email: user.email,
    redirectTo: '/check-email'
  };
}
