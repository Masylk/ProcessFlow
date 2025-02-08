import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server'; // Import your Supabase client
import prisma from '@/lib/prisma'; // Import your Prisma client

export async function GET(req: NextRequest) {
  const supabase = await createClient();

  // Get the user from Supabase Auth
  const { data: userData, error: userError } = await supabase.auth.getUser();

  if (userError || !userData || !userData.user) {
    return NextResponse.json(
      { error: 'User not authenticated' },
      { status: 401 }
    );
  }

  const supabaseUser = userData.user;
  const userId = supabaseUser.id; // Supabase UID
  const supabaseEmail = supabaseUser.email;

  if (!supabaseEmail) {
    return NextResponse.json(
      { error: 'No email found in Supabase user data' },
      { status: 400 }
    );
  }

  try {
    // Fetch the Prisma user based on the Supabase UID
    const user = await prisma.user.findUnique({
      where: {
        auth_id: userId,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // If the email differs, update the Prisma user record
    if (user.email !== supabaseEmail) {
      const updatedUser = await prisma.user.update({
        where: { auth_id: userId },
        data: {
          email: supabaseEmail,
        },
      });
      return NextResponse.json(updatedUser);
    }

    return NextResponse.json(user);
  } catch (dbError) {
    console.error('Error fetching or updating user from Prisma:', dbError);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
