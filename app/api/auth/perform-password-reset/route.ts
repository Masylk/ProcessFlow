import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { password } = await req.json();

  // Get token_hash from cookies
  const token_hash = req.cookies.get('password-reset-token')?.value;
  if (!token_hash) {
    return NextResponse.json({ error: 'Missing reset token.' }, { status: 400 });
  }

  // Re-establish recovery session
  const { error: otpError } = await supabase.auth.verifyOtp({
    token_hash,
    type: 'recovery',
  });
  if (otpError) {
    return NextResponse.json({ error: otpError.message }, { status: 400 });
  }

  // Now update the password
  const { error } = await supabase.auth.updateUser({ password });
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  // After updating the password
  const { error: signOutError } = await supabase.auth.signOut();
  if (signOutError) {
    // Optionally log or handle sign out error, but usually you can ignore it here
  }

  // Optionally clear the reset token cookie here

  return NextResponse.json({ message: 'Password reset successful.' });
} 