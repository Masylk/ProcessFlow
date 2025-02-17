'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/utils/supabase/server';
import prisma from '@/lib/prisma'; // Import your Prisma client si nécessaire
import { sendEmail } from '../utils/mail';
import { render } from '@react-email/render';
import WelcomeEmail from '../emails/WelcomeEmail';
import { Prisma } from '@prisma/client';

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
  const firstName = (formData.get('first_name') as string) || '';
  const lastName = (formData.get('last_name') as string) || '';

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

  try {
    // Ajoutons des logs pour débugger
    console.log('Attempting to create user in database:', {
      auth_id: user.id,
      email: user.email,
      firstName: formData.get('first_name'),
      lastName: formData.get('last_name'),
    });

    const newUser = await prisma.user.create({
      data: {
        auth_id: user.id,
        email: user.email || '',
        first_name: (formData.get('first_name') as string) || '',
        last_name: (formData.get('last_name') as string) || '',
        full_name: `${formData.get('first_name')} ${formData.get('last_name')}`,
      },
    });

    console.log('User created successfully:', newUser);

    // Création du workspace par défaut
    const defaultWorkspace = await prisma.workspace.create({
      data: {
        name: 'My Workspace',
        background_colour: '#4299E1',
        team_tags: [],
        user_workspaces: {
          create: {
            user_id: newUser.id,
            role: 'ADMIN',
          },
        },
      },
    });

    // Mise à jour de l'utilisateur avec le workspace actif
    await prisma.user.update({
      where: { id: newUser.id },
      data: {
        active_workspace_id: defaultWorkspace.id,
      },
    });

    const emailHtml = await render(
      WelcomeEmail({ firstName: (formData.get('first_name') as string) || '' })
    );

    // Send the welcome email using the sendEmail utility
    const emailResponse = await sendEmail(
      user.email || '',
      'Bienvenue sur ProcessFlow!',
      emailHtml // Pass the rendered HTML from WelcomeEmail
    );

    if (emailResponse.error) {
      console.error('Email sending failed:', emailResponse.error);
    }
  } catch (dbError) {
    if (dbError instanceof Error) {
      console.error('Database error details:', {
        name: dbError.name,
        message: dbError.message,
        stack: dbError.stack,
      });
    } else {
      console.error('Unknown error:', dbError);
    }

    // Vérification spécifique pour Prisma
    if (dbError instanceof Prisma.PrismaClientKnownRequestError) {
      console.error('Prisma error code:', dbError.code);
      console.error('Prisma error meta:', dbError.meta);
    }

    return {
      error: `Error creating user in database: ${dbError instanceof Error ? dbError.message : 'Unknown error'}`,
    };
  }

  return {
    id: user.id,
    firstName,
    lastName,
    email: user.email,
  };
}
