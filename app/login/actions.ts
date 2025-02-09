'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/utils/supabase/server';
import prisma from '@/lib/prisma'; // Import your Prisma client si nécessaire

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
    // On renvoie une structure d'erreur que tu pourras gérer côté client
    return { error: error.message };
  }

  const user = data?.user;
  if (!user) {
    return { error: 'No user returned from signInWithPassword' };
  }

  // --- [Optionnel] Récupérer first/last name dans ta BDD via Prisma ---
  // Cela te permet d'envoyer ces infos si tu veux
  // qu'elles soient disponibles côté client pour PostHog.
  let firstName = '';
  let lastName = '';

  try {
    const userInDb = await prisma.user.findUnique({
      where: { auth_id: user.id },
      select: { first_name: true, last_name: true },
    });
    if (userInDb) {
      firstName = userInDb.first_name ?? '';
      lastName  = userInDb.last_name ?? '';
    }
  } catch (dbError) {
    console.error('Error retrieving user from DB:', dbError);
  }

  // On retourne l'ID, l'email, et éventuellement le prénom/nom
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

  // On tente l'inscription via Supabase
  const { data, error: authError } = await supabase.auth.signUp(credentials);

  if (authError) {
    console.error('Sign up error:', authError);
    return { error: authError.message };
  }

  const user = data?.user;
  if (!user) {
    return { error: 'No user returned from signUp' };
  }

  // On récupère aussi les champs first_name / last_name pour compléter en base
  const firstName = (formData.get('first_name') as string) || '';
  const lastName = (formData.get('last_name') as string) || '';
  const email = user.email || '';

  // On crée (ou met à jour) l'utilisateur dans ta propre base
  try {
    await prisma.user.create({
      data: {
        auth_id: user.id, // Lien vers l'UID Supabase
        email,
        first_name: firstName,
        last_name: lastName,
        full_name: `${firstName} ${lastName}`,
      },
    });

    // Tu peux éventuellement revalider le cache si nécessaire.
    // revalidatePath('/', 'layout'); // Optionnel
  } catch (dbError) {
    console.error('Error creating user in Prisma:', dbError);
    return { error: 'Error creating user in DB' };
  }

  // On renvoie l'ID, l'email, et le prénom/nom pour un call PostHog côté client
  return {
    id: user.id,
    email: user.email,
    firstName,
    lastName,
  };
}
