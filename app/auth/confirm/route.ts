import { type EmailOtpType } from '@supabase/supabase-js';
import { type NextRequest } from 'next/server';

import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token_hash = searchParams.get('token_hash');
  const type = searchParams.get('type') as string | null; // Allow string type
  const next = searchParams.get('next') ?? '/';

  if (token_hash && type) {
    const supabase = await createClient();

    const { error } = await supabase.auth.verifyOtp({
      type: type as EmailOtpType, // Ensure this is cast to EmailOtpType
      token_hash,
    });

    if (!error) {
      if (type === 'recovery') {
        // redirect to the reset password page after confirming OTP
        redirect(`/reset-password?token_hash=${token_hash}`);
      } else {
        // handle other types like signup
        redirect(next);
      }
    } else {
      // Redirect to the error page with the error message
      redirect(`/error?message=${encodeURIComponent(error.message)}`);
    }
  }

  // If no token_hash or type is provided, redirect to error page with a generic message
  redirect('/error?message=Invalid%20parameters');
}
