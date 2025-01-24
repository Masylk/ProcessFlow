import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { token, password } = await req.json();

  if (!token || !password) {
    return NextResponse.json(
      { error: 'Token and password are required' },
      { status: 400 }
    );
  }

  // Use the session token to update the password
  const { data: user, error } = await supabase.auth.updateUser({
    password,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json(
    { message: 'Password updated successfully.', user },
    { status: 200 }
  );
}
