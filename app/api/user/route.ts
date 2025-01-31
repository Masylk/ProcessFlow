import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server'; // Import your Supabase client
import prisma from '@/lib/prisma'; // Import your Prisma client

export async function GET(req: NextRequest) {
  const supabase = await createClient();

  // Get the session from Supabase
  const { data, error } = await supabase.auth.getSession();

  if (error || !data?.session) {
    return NextResponse.json(
      { error: 'User not authenticated' },
      { status: 401 }
    );
  }

  const userId = data.session.user.id; // Get the UID from the session

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
