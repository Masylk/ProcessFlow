import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { supabaseAdmin } from '@/utils/supabase/admin'; // Use the new admin client

export async function POST(req: NextRequest) {
  try {
    const { userId } = await req.json();

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Find user in PostgreSQL using auth_id
    const user = await prisma.user.findUnique({
      where: { auth_id: userId },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found in database' },
        { status: 404 }
      );
    }

    // Delete related user_workspace and actions
    await prisma.user_workspace.deleteMany({ where: { user_id: user.id } });
    await prisma.action.deleteMany({ where: { user_id: user.id } });

    // Delete the user from PostgreSQL
    await prisma.user.delete({ where: { id: user.id } });

    // Delete the user from Supabase Auth using the admin client
    console.log(`Deleting user from Supabase Auth ID=${userId}`);
    const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);

    if (error) {
      return NextResponse.json(
        { error: `Failed to delete user in Supabase: ${error.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { error: `Internal Server Error: ${error.message}` },
      { status: 500 }
    );
  }
}
