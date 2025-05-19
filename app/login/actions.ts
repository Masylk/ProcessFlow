'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/utils/supabase/server';
import prisma from '@/lib/prisma';
import { sendEmail } from '../utils/mail';
import { render } from '@react-email/render';
import { WelcomeEmail } from '@/emails/templates/WelcomeEmail';
import { Prisma } from '@prisma/client';
import { redirect } from 'next/navigation';
import posthog from 'posthog-js';
import React from 'react';
import { cookies } from 'next/headers';

const isDevelopmentOrStaging = process.env.NODE_ENV !== 'production' || process.env.NEXT_PUBLIC_VERCEL_ENV === 'preview';

export async function login(formData: FormData) {
  try {
    const supabase = await createClient();

    await supabase.auth.signOut();
    const credentials = {
      email: formData.get('email') as string,
      password: formData.get('password') as string,
    };

    const { data, error } = await supabase.auth.signInWithPassword(credentials);

    if (error) {
      if (isDevelopmentOrStaging) {
        console.error('Login error:', error);
      }
      return { error: error.message };
    }

    const user = data?.user;
    if (!user) {
      return { error: 'No user returned from signInWithPassword' };
    }

    // Check if email is confirmed
    if (!user.email_confirmed_at) {
      return { 
        needsEmailConfirmation: true,
        email: user.email,
        message: 'Please confirm your email before logging in. Check your inbox for the confirmation link.'
      };
    }

    // Set the auth cookie
    const cookieStore = await cookies();
    const session = data.session;
    if (session) {
      cookieStore.set('session', session.access_token, {
        path: '/',
        maxAge: 60 * 60 * 24 * 7, // 1 week
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax'
      });
    }

    return { id: user.id, email: user.email };
  } catch (err) {
    if (isDevelopmentOrStaging) {
      console.error('Unexpected error during login:', err);
    }
    return { error: 'An unexpected error occurred during login' };
  }
}

export async function signup(formData: FormData) {
  const supabase = await createClient();
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  // Password strength validation (same as frontend)
  const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_\-+=\[\]{};':"\\|,.<>/?]).{8,}$/;
  if (!strongPasswordRegex.test(password)) {
    // Always return success to prevent enumeration, but do not proceed
    return { success: true, message: "If your signup was successful, check your email." };
  }

  // 1. Check if email already exists in Prisma
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });
  if (existingUser) {
    // Always return success, do not reveal existence
    return { success: true, message: "If your signup was successful, check your email." };
  }

  // 2. Check if email already exists in Supabase Auth
  try {
    const { data, error } = await supabase.auth.admin.listUsers();
    if (!error && data?.users) {
      const userExists = data.users.some(user => user.email === email);
      if (userExists) {
        // Always return success, do not reveal existence
        return { success: true, message: "If your signup was successful, check your email." };
      }
    }
  } catch (e) {
    // Optionally log error, but do not block signup on admin API failure
  }

  // 3. Proceed with signup
  const credentials = {
    email,
    password,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_BASE_URL}/auth/confirm`,
    },
  };

  const { data, error: authError } = await supabase.auth.signUp(credentials);
  if (authError) {
    // Always return success, do not reveal error details
    return { success: true, message: "If your signup was successful, check your email." };
  }

  const user = data?.user;
  if (!user) return { success: true, message: "If your signup was successful, check your email." };

  try {
    await prisma.user.create({
      data: {
        auth_id: user.id,
        email: user.email!,
        first_name: '',
        last_name: '',
        full_name: '',
        onboarding_step: 'PERSONAL_INFO'
      }
    });

    await posthog.capture('signup_google', {
      distinctId: String(user.id),
      event: 'signup_google',
      properties: {
        email: user.email,
      }
    });

    return {
      success: true,
      message: "If your signup was successful, check your email.",
      id: user.id,
      email: user.email,
      redirectTo: '/check-email'
    };
  } catch (error) {
    // Clean up Supabase user if needed
    await supabase.auth.admin.deleteUser(user.id);
    return { success: true, message: "If your signup was successful, check your email." };
  }
}

export async function checkEmailExists(email: string) {
  // ... perform your checks as before

  // Always return the same response, regardless of whether the email exists
  return { success: true, message: "If this email can be used, you will receive an email." };
}

export async function debugCheckEmail(email: string) {
  if (isDevelopmentOrStaging) {
    console.log(`[DEBUG] Checking email existence for: ${email}`);
  }
  const results = {
    prismaCheck: false as boolean,
    supabaseAdminCheck: null as boolean | null,
    finalResult: false as boolean,
    explanation: ""
  };
  
  try {
    // 1. Check Prisma
    try {
      const existingUser = await prisma.user.findUnique({
        where: { email: email },
      });
      
      results.prismaCheck = !!existingUser;
      if (isDevelopmentOrStaging) {
        console.log(`[DEBUG] Prisma result: ${results.prismaCheck ? "User found" : "No user found"}`);
      }
      
      // If found in Prisma, get more details
      if (existingUser) {
        results.explanation += `User found in Prisma database with ID: ${existingUser.id}. `;
      } else {
        results.explanation += "No user found in Prisma database. ";
      }
    } catch (error) {
      if (isDevelopmentOrStaging) {
        console.error('[DEBUG] Prisma check error:', error);
      }
      results.explanation += "Prisma check failed. ";
    }
    
    // 2. Check Supabase directly using admin API
    try {
      const supabase = await createClient();
      try {
        const { data, error } = await supabase.auth.admin.listUsers();
        
        if (!error && data?.users) {
          const userExists = data.users.some(user => user.email === email);
          results.supabaseAdminCheck = userExists;
          if (isDevelopmentOrStaging) {
            console.log(`[DEBUG] Supabase admin check: ${userExists ? "User found" : "No user found"}`);
          }
          
          if (userExists) {
            const matchingUser = data.users.find(user => user.email === email);
            results.explanation += `User found in Supabase with ID: ${matchingUser?.id}. `;
          } else {
            results.explanation += "No user found in Supabase admin check. ";
          }
        } else {
          if (isDevelopmentOrStaging) {
            console.log('[DEBUG] Supabase admin check failed:', error);
          }
          results.explanation += `Supabase admin check failed: ${error?.message || "Unknown error"}. `;
          results.supabaseAdminCheck = null; // Couldn't check
        }
      } catch (adminError: any) {
        if (isDevelopmentOrStaging) {
          console.log('[DEBUG] Supabase admin check not available:', adminError);
        }
        results.explanation += `Supabase admin check not available: ${adminError?.message || "Unknown error"}. `;
        results.supabaseAdminCheck = null; // Couldn't check
      }
    } catch (error) {
      if (isDevelopmentOrStaging) {
        console.error('[DEBUG] Supabase check error:', error);
      }
      results.explanation += "Supabase check failed with error. ";
      results.supabaseAdminCheck = null; // Couldn't check
    }
    
    // 3. Determine final result
    if (results.prismaCheck === true && results.supabaseAdminCheck === false) {
      results.finalResult = false;
      results.explanation += "INCONSISTENCY DETECTED: Account exists in Prisma but confirmed not in Supabase. ";
    } 
    else if (results.supabaseAdminCheck === true) {
      results.finalResult = true;
      results.explanation += "Account confirmed to exist in Supabase. ";
    }
    else if (results.prismaCheck === true) {
      results.finalResult = true;
      results.explanation += "Account confirmed to exist in Prisma. Supabase status unknown. ";
    }
    else if (results.prismaCheck === false) {
      results.finalResult = false;
      results.explanation += "Account confirmed not to exist in Prisma. ";
    }
    else {
      results.finalResult = false;
      results.explanation += "Could not determine email existence with confidence. ";
    }
    
    if (isDevelopmentOrStaging) {
      console.log(`[DEBUG] Final result: ${results.finalResult ? "Email exists" : "Email doesn't exist"}`);
    }
    return results;
    
  } catch (error) {
    if (isDevelopmentOrStaging) {
      console.error('[DEBUG] Unexpected error:', error);
    }
    results.explanation += "Debug check failed with unexpected error. ";
    return results;
  }
}
