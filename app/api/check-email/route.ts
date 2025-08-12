import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { supabaseAdmin } from '@/utils/supabase/admin';
import { isVercel } from '../utils/isVercel';
import { PrismaClient } from '@prisma/client';

export async function GET(req: NextRequest) {
  const prisma_client = isVercel() ? new PrismaClient() : prisma;
  if (!prisma_client) throw new Error('Prisma client not initialized');

  try {
    const email = req.nextUrl.searchParams.get('email');
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // 1. Check Prisma
    const existingUser = await prisma_client.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      console.log('User exists in Prisma:', existingUser);
      return NextResponse.json({ exists: true });
    }

    // 2. Check Supabase using admin client
    try {
      const { data, error } = await supabaseAdmin.auth.admin.listUsers();
      if (!error && data?.users) {
        const userExists = data.users.some(user => user.email === email);
        if (userExists) {
          console.log('User exists in Supabase:', userExists);
          return NextResponse.json({ exists: true });
        }
      }
    } catch (e) {
      // If we can't check Supabase, assume user doesn't exist
      console.error('Error checking Supabase:', e);
    }

    console.log('User does not exist in Prisma or Supabase');
    return NextResponse.json({ exists: false });
  } catch (error) {
    console.error('Check email error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  } finally {
    if (isVercel()) {
      await prisma_client.$disconnect();
    }
  }
} 