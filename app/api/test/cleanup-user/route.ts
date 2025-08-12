import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { isVercel } from '@/app/api/utils/isVercel';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: NextRequest) {
  const prisma = isVercel() ? new PrismaClient() : require('@/lib/prisma').default;
  const { email } = await req.json();
  if (!email) {
    return NextResponse.json({ error: 'Email is required' }, { status: 400 });
  }
  try {
    // Get userId by email
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    const auth_id = user.auth_id;
    // Delete user from Prisma
    await prisma.user.delete({ where: { auth_id } });
    // Delete user from Supabase
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase environment variables');
    }
    const supabase = createClient(supabaseUrl, supabaseKey);
    const { error: supabaseError } = await supabase.auth.admin.deleteUser(auth_id);
    if (supabaseError) {
      return NextResponse.json({ error: supabaseError.message }, { status: 500 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message || 'Internal server error' }, { status: 500 });
  } finally {
    if (isVercel()) await prisma.$disconnect();
  }
}
