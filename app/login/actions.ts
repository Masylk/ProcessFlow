'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import prisma from '@/lib/prisma'; // Import your Prisma client

export async function login(formData: FormData) {
  const supabase = await createClient();

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  };

  const { error } = await supabase.auth.signInWithPassword(data);

  if (error) {
    console.error('Login error:', error);
    redirect('/error');
  }

  redirect('/');
}

export async function signup(formData: FormData) {
  const supabase = await createClient();

  // Type-casting here for convenience
  // in practice, you should validate your inputs
  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
    options: {
      emailRedirectTo: process.env.NEXT_PUBLIC_BASE_URL,
    },
  };

  // Call signUp, destructure the response
  const { data: authData, error: authError } = await supabase.auth.signUp(data);

  if (authError) {
    redirect('/error');
  }

  const user = authData?.user; // Safely extract the user from the response

  if (user) {
    // Get form data values with a fallback to empty strings if undefined
    const firstName = (formData.get('first_name') as string) || '';
    const lastName = (formData.get('last_name') as string) || '';
    const email = user.email || ''; // User email from Supabase

    // Create user in your own database and link to Supabase UID
    try {
      await prisma.user.create({
        data: {
          auth_id: user.id, // Link to Supabase Auth UID
          email,
          first_name: firstName,
          last_name: lastName,
          full_name: `${firstName} ${lastName}`,
        },
      });

      revalidatePath('/', 'layout');
      redirect('/');
    } catch (dbError) {
      console.error('Error creating user:', dbError);
      redirect('/error');
    }
  }
}
