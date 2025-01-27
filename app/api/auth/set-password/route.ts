import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function POST(req: NextRequest) {
  const { token, password } = await req.json();

  if (!token || !password) {
    return NextResponse.json(
      { error: 'Token and password are required' },
      { status: 400 }
    );
  }

  // Initialize Supabase client
  const supabase = await createClient(); // Await the client creation

  // Use the token to update the user's password
  const { data: user, error } = await supabase.auth.updateUser({
    password,
    access_token: token, // Pass the token directly here
  });

  if (error) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json(
    { message: 'Password updated successfully.', user },
    { status: 200 }
  );
}
