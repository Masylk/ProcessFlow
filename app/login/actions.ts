'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/utils/supabase/server';
import prisma from '@/lib/prisma';
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
  if (!user) {
    return { error: 'No user returned from signInWithPassword' };
  }

  return { id: user.id, email: user.email };
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
    console.log('Attempting to create user in database:', {
      auth_id: user.id,
      email: user.email,
      firstName,
      lastName,
    });

    const [newUser, defaultWorkspace] = await prisma.$transaction([
      prisma.user.create({
        data: {
          auth_id: user.id,
          email: user.email || '',
          first_name: firstName,
          last_name: lastName,
          full_name: `${firstName} ${lastName}`,
        },
      }),
      prisma.workspace.create({
        data: {
          name: 'My Workspace',
          background_colour: '#4299E1',
          team_tags: [],
        },
      }),
    ]);

    await prisma.$transaction([
      prisma.user.update({
        where: { id: newUser.id },
        data: {
          active_workspace_id: defaultWorkspace.id,
        },
      }),
      prisma.user_workspace.create({
        data: {
          user_id: newUser.id,
          workspace_id: defaultWorkspace.id,
          role: 'ADMIN',
        },
      }),
    ]);

    console.log(
      'User and workspace created successfully:',
      newUser,
      defaultWorkspace
    );

    const emailHtml = await render(WelcomeEmail({ firstName }));

    const emailResponse = await sendEmail(
      user.email || '',
      'Bienvenue sur ProcessFlow!',
      emailHtml
    );

    if (emailResponse.error) {
      console.error('Email sending failed:', emailResponse.error);
    }

    return {
      id: newUser.id.toString(),
      email: newUser.email,
      firstName: newUser.first_name,
      lastName: newUser.last_name,
    };
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

    if (dbError instanceof Prisma.PrismaClientKnownRequestError) {
      console.error('Prisma error code:', dbError.code);
      console.error('Prisma error meta:', dbError.meta);
    }

    return {
      error: `Error creating user in database: ${dbError instanceof Error ? dbError.message : 'Unknown error'}`,
    };
  }
}
