// /api/user/update/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma'; // Import your Prisma client

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, first_name, last_name, full_name, email, avatar_url } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'User id is required' },
        { status: 400 }
      );
    }

    // Optionally, derive full_name if not provided
    const computedFullName = full_name || `${first_name} ${last_name}`;

    const updatedUser = await prisma.user.update({
      where: { id: Number(id) },
      data: {
        first_name,
        last_name,
        full_name: computedFullName,
        email,
        avatar_url,
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
