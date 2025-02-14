'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/utils/supabase/server';
import prisma from '@/lib/prisma'; // Import your Prisma client si nécessaire
import { sendEmail } from '../utils/mail';
import { render } from '@react-email/render';
import WelcomeEmail from '../emails/WelcomeEmail';

export async function login(formData: FormData) {
  const supabase = await createClient();

  const credentials = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  };

  // On tente de se connecter via Supabase
  const { data, error } = await supabase.auth.signInWithPassword(credentials);

  if (error) {
    console.error('Login error:', error);
    return { error: error.message }; // Returning a clear error message
  }

  const user = data?.user;
  if (!user) {
    return { error: 'No user returned from signInWithPassword' };
  }

  // --- [Optionnel] Récupérer first/last name dans ta BDD via Prisma ---
  let firstName = '';
  let lastName = '';

  try {
    const userInDb = await prisma.user.findUnique({
      where: { auth_id: user.id },
      select: { first_name: true, last_name: true },
    });
    if (userInDb) {
      firstName = userInDb.first_name ?? '';
      lastName = userInDb.last_name ?? '';
    }
  } catch (dbError) {
    console.error('Error retrieving user from DB:', dbError);
    return { error: 'Error retrieving user details from database' };
  }

  return {
    id: user.id,
    email: user.email,
    firstName,
    lastName,
  };
}

export async function signup(formData: FormData) {
  const supabase = await createClient();

  const credentials = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
    options: {
      emailRedirectTo: process.env.NEXT_PUBLIC_BASE_URL,
    },
  };

  const { data, error: authError } = await supabase.auth.signUp(credentials);
  if (authError) {
    console.error('Sign up error:', authError);
    return { error: authError.message };
  }

  const user = data?.user;
  if (!user) return { error: 'No user returned from signUp' };

  const firstName = (formData.get('first_name') as string) || '';
  const lastName = (formData.get('last_name') as string) || '';
  const email = user.email || '';

  try {
    await prisma.user.create({
      data: {
        auth_id: user.id,
        email,
        first_name: firstName,
        last_name: lastName,
        full_name: `${firstName} ${lastName}`,
      },
    });

    const emailHtml = await render(WelcomeEmail({ firstName: firstName }));

    // Send the welcome email using the sendEmail utility
    const emailResponse = await sendEmail(
      email,
      'Bienvenue sur ProcessFlow!',
      emailHtml // Pass the rendered HTML from WelcomeEmail
    );

    if (emailResponse.error) {
      console.error('Email sending failed:', emailResponse.error);
    }
  } catch (dbError) {
    console.error('Error creating user in Prisma:', dbError);
    return { error: 'Error creating user in database' };
  }

  return {
    id: user.id,
    email,
    firstName,
    lastName,
  };
}
