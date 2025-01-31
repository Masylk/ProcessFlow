import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server'; // Import your Supabase client
import prisma from '@/lib/prisma'; // Import your Prisma client

export async function GET(req: NextRequest) {
  const supabase = await createClient();

  // Get the user from Supabase and authenticate it
  const { data: userData, error: userError } = await supabase.auth.getUser();

  if (userError || !userData) {
    return NextResponse.json(
      { error: 'User not authenticated' },
      { status: 401 }
    );
  }

  const userId = userData.user.id; // Get the UID from the user data

  // Query Prisma to find the user based on the Supabase UID
  try {
    const user = await prisma.user.findUnique({
      where: {
        auth_id: userId, // assuming `auth_id` is the column storing the Supabase UID
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (dbError) {
    console.error('Error fetching user from Prisma:', dbError);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
