import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { isVercel } from '@/app/api/utils/isVercel';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: NextRequest) {
  const prisma = isVercel() ? new PrismaClient() : require('@/lib/prisma').default;
  const { email, password, email_confirmed, onboarding_step, first_name, last_name, full_name, provider } = await req.json();
  if (!email || !password) {
    return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
  }
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase environment variables');
  }
  const supabase = createClient(supabaseUrl, supabaseKey);
  let step = onboarding_step || 'PERSONAL_INFO';
  const isCompleted = step === 'COMPLETED';
  try {
    // Try to create user in Supabase Auth
    let { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: email_confirmed,
      user_metadata: {
        onboarding_step: step,
        onboarding_status: {
          current_step: step,
          completed_at: isCompleted ? new Date().toISOString() : null
        }
      }
    });
    let resultUser = authUser;
    if (authError && authError.message.includes('already been registered')) {
      // Update user if already exists
      const { data: userList, error: listError } = await supabase.auth.admin.listUsers();
      if (listError) return NextResponse.json({ error: listError.message }, { status: 500 });
      const user = userList?.users?.find((u) => u.email === email);
      if (!user) return NextResponse.json({ error: 'User not found for update.' }, { status: 404 });
      const { data: updatedUser, error: updateError } = await supabase.auth.admin.updateUserById(user.id, {
        email_confirm: email_confirmed,
        user_metadata: {
          onboarding_step: step,
          onboarding_status: {
            current_step: step,
            completed_at: isCompleted ? new Date().toISOString() : null
          }
        }
      });
      if (updateError) return NextResponse.json({ error: updateError.message }, { status: 500 });
      resultUser = updatedUser;
    } else if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 500 });
    }
    // Create or update user in Prisma
    const auth_id = resultUser.user?.id;
    const userEmail = resultUser.user?.email;
    if (!auth_id || !userEmail) {
      return NextResponse.json({ error: 'Supabase user missing id or email' }, { status: 500 });
    }
    let user = await prisma.user.findUnique({ where: { auth_id } });
    if (!user) {
      user = await prisma.user.create({
        data: {
          auth_id,
          email: userEmail,
          first_name: first_name || '',
          last_name: last_name || '',
          full_name: full_name || '',
          onboarding_step: step,
          onboarding_completed_at: isCompleted ? new Date().toISOString() : null,
        }
      });
    } else {
      user = await prisma.user.update({
        where: { auth_id },
        data: {
          onboarding_step: step,
          onboarding_completed_at: isCompleted ? new Date().toISOString() : null,
        }
      });
    }
    return NextResponse.json({ user });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message || 'Internal server error' }, { status: 500 });
  } finally {
    if (isVercel()) await prisma.$disconnect();
  }
}
