import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma'; // Import your Prisma client
import { supabase } from '@/lib/supabaseClient';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const userAssetsBucket = process.env.NEXT_PUBLIC_SUPABASE_PRIVATE_BUCKET;

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      id,
      first_name,
      last_name,
      full_name,
      email,
      avatar_url,
      active_workspace,
      delete_avatar,
    } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'User id is required' },
        { status: 400 }
      );
    }

    // Retrieve the existing user data
    const existingUser = await prisma.user.findUnique({
      where: { id: Number(id) },
      select: { avatar_url: true },
    });

    if (!existingUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    let newAvatarUrl = avatar_url;

    // If the user has an existing avatar, delete it before updating
    if ((avatar_url || delete_avatar) && existingUser.avatar_url) {
      const oldAvatarPath = existingUser.avatar_url.replace(
        `${supabaseUrl}/storage/v1/object/public/${userAssetsBucket}/`,
        ''
      );

      if (oldAvatarPath) {
        if (!userAssetsBucket) {
          console.error('Supabase bucket name is undefined');
          return NextResponse.json(
            { error: 'Supabase bucket name is not set' },
            { status: 500 }
          );
        }

        const { error: deleteError } = await supabase.storage
          .from(userAssetsBucket)
          .remove([`uploads/${oldAvatarPath}`]);

        if (deleteError) {
          console.error('Error deleting old avatar:', deleteError.message);
        }
      }
    }

    // If delete_avatar is true, set avatar_url to null
    if (delete_avatar) {
      newAvatarUrl = null;
    }

    // Update user data
    const updatedUser = await prisma.user.update({
      where: { id: Number(id) },
      data: {
        first_name,
        last_name,
        full_name,
        email,
        avatar_url: newAvatarUrl,
        active_workspace,
      },
    });

    return NextResponse.json(updatedUser, { status: 200 });
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    );
  }
}
