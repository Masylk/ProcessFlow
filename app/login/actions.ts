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

export async function login(formData: FormData) {
  try {
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
    console.error('Unexpected error during login:', err);
    return { error: 'An unexpected error occurred during login' };
  }
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

  try {
    // Create the initial user record in Prisma
    await prisma.user.create({
      data: {
        auth_id: user.id,
        email: user.email!,
        first_name: '',  // Will be filled during onboarding
        last_name: '',   // Will be filled during onboarding
        full_name: '',   // Will be filled during onboarding
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
      id: user.id,
      email: user.email,
      redirectTo: '/check-email'
    };
  } catch (error) {
    console.error('Error creating Prisma user:', error);
    // If we fail to create the Prisma user, we should clean up the Supabase user
    await supabase.auth.admin.deleteUser(user.id);
    return { error: 'Failed to complete signup process' };
  }
}

export async function checkEmailExists(email: string) {
  try {
    console.log(`[SERVER] Checking if email exists: ${email}`);
    
    // Check in Prisma database first
    try {
      const existingUser = await prisma.user.findUnique({
        where: {
          email: email,
        },
      });
      
      console.log(`[SERVER] Prisma user check result:`, existingUser ? "User found" : "No user found");
      
      if (existingUser) {
        return { exists: true };
      }
    } catch (prismaError) {
      console.error('[SERVER] Prisma error checking email:', prismaError);
    }
    
    // Check in Supabase Auth
    try {
      const supabase = await createClient();
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password: 'dummy_check_password_123456789',
      });
      
      // The key issue was here - we were incorrectly interpreting the error messages
      // "Invalid login credentials" doesn't necessarily mean the email exists
      
      if (error) {
        console.log(`[SERVER] Supabase auth error message: "${error.message}"`);
        
        // Only return exists: true if we're absolutely certain
        if (error.message.includes("already registered") || 
            error.message.includes("already in use") ||
            error.message.includes("already exists")) {
          console.log('[SERVER] Email exists based on auth error');
          return { exists: true };
        }
        
        // Otherwise, assume the email is available
        console.log('[SERVER] Email appears to be available');
        return { exists: false };
      }
      
      // If no error (shouldn't happen with dummy password)
      return { exists: false };
      
    } catch (error) {
      console.error('[SERVER] Error in auth check:', error);
      return { exists: false, error: 'Failed to check email availability' };
    }
    
  } catch (error) {
    console.error('[SERVER] Unexpected error checking email:', error);
    return { exists: false, error: 'Failed to check email availability' };
  }
}

export async function debugCheckEmail(email: string) {
  console.log(`[DEBUG] Checking email existence for: ${email}`);
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
      console.log(`[DEBUG] Prisma result: ${results.prismaCheck ? "User found" : "No user found"}`);
      
      // If found in Prisma, get more details
      if (existingUser) {
        results.explanation += `User found in Prisma database with ID: ${existingUser.id}. `;
      } else {
        results.explanation += "No user found in Prisma database. ";
      }
    } catch (error) {
      console.error('[DEBUG] Prisma check error:', error);
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
          console.log(`[DEBUG] Supabase admin check: ${userExists ? "User found" : "No user found"}`);
          
          if (userExists) {
            const matchingUser = data.users.find(user => user.email === email);
            results.explanation += `User found in Supabase with ID: ${matchingUser?.id}. `;
          } else {
            results.explanation += "No user found in Supabase admin check. ";
          }
        } else {
          console.log('[DEBUG] Supabase admin check failed:', error);
          results.explanation += `Supabase admin check failed: ${error?.message || "Unknown error"}. `;
          results.supabaseAdminCheck = null; // Couldn't check
        }
      } catch (adminError: any) { // Type assertion to any to access message property
        console.log('[DEBUG] Supabase admin check not available:', adminError);
        results.explanation += `Supabase admin check not available: ${adminError?.message || "Unknown error"}. `;
        results.supabaseAdminCheck = null; // Couldn't check
      }
    } catch (error) {
      console.error('[DEBUG] Supabase check error:', error);
      results.explanation += "Supabase check failed with error. ";
      results.supabaseAdminCheck = null; // Couldn't check
    }
    
    // 3. Determine final result
    // If Prisma says yes but Supabase admin DEFINITELY says no
    if (results.prismaCheck === true && results.supabaseAdminCheck === false) {
      results.finalResult = false;
      results.explanation += "INCONSISTENCY DETECTED: Account exists in Prisma but confirmed not in Supabase. ";
    } 
    // If admin check found it, trust that
    else if (results.supabaseAdminCheck === true) {
      results.finalResult = true;
      results.explanation += "Account confirmed to exist in Supabase. ";
    }
    // If Prisma found it, and we couldn't check Supabase, trust Prisma
    else if (results.prismaCheck === true) {
      results.finalResult = true;
      results.explanation += "Account confirmed to exist in Prisma. Supabase status unknown. ";
    }
    // If Prisma says it doesn't exist, and either Supabase also says no or we couldn't check
    else if (results.prismaCheck === false) {
      results.finalResult = false;
      results.explanation += "Account confirmed not to exist in Prisma. ";
    }
    // Default to false if we can't determine
    else {
      results.finalResult = false;
      results.explanation += "Could not determine email existence with confidence. ";
    }
    
    console.log(`[DEBUG] Final result: ${results.finalResult ? "Email exists" : "Email doesn't exist"}`);
    return results;
    
  } catch (error) {
    console.error('[DEBUG] Unexpected error:', error);
    results.explanation += "Debug check failed with unexpected error. ";
    return results;
  }
}
