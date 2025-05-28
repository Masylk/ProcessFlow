// app/api/user/update/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { generatePublicUrl } from '../../utils/generatePublicUrl';
import prisma from '@/lib/prisma'; // Import your Prisma client
import { supabase } from '@/lib/supabaseClient';
import { isVercel } from '../../utils/isVercel';
import { PrismaClient } from '@prisma/client';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const userAssetsBucket = process.env.NEXT_PUBLIC_SUPABASE_PRIVATE_BUCKET;

/**
 * @swagger
 * /api/user/update:
 *   put:
 *     summary: Update user profile
 *     description: Updates user details, including avatar management (upload/delete).
 *     tags:
 *       - User
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id:
 *                 type: integer
 *                 description: The user ID.
 *                 example: 1
 *               first_name:
 *                 type: string
 *                 description: User's first name.
 *                 example: "John"
 *               last_name:
 *                 type: string
 *                 description: User's last name.
 *                 example: "Doe"
 *               full_name:
 *                 type: string
 *                 description: User's full name.
 *                 example: "John Doe"
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User's email address.
 *                 example: "john.doe@example.com"
 *               avatar_url:
 *                 type: string
 *                 format: uri
 *                 nullable: true
 *                 description: URL of the user's avatar.
 *                 example: "https://example.com/avatar.jpg"
 *               active_workspace:
 *                 type: integer
 *                 nullable: true
 *                 description: The ID of the active workspace.
 *                 example: 3
 *               delete_avatar:
 *                 type: boolean
 *                 description: If true, deletes the user's current avatar.
 *                 example: false
 *     responses:
 *       200:
 *         description: User updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   example: 1
 *                 first_name:
 *                   type: string
 *                   example: "John"
 *                 last_name:
 *                   type: string
 *                   example: "Doe"
 *                 full_name:
 *                   type: string
 *                   example: "John Doe"
 *                 email:
 *                   type: string
 *                   example: "john.doe@example.com"
 *                 avatar_url:
 *                   type: string
 *                   nullable: true
 *                   example: "https://example.com/avatar.jpg"
 *                 active_workspace:
 *                   type: integer
 *                   nullable: true
 *                   example: 3
 *       400:
 *         description: Missing required user ID.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "User id is required"
 *       404:
 *         description: User not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "User not found"
 *       500:
 *         description: Internal server error, possibly due to database or storage issues.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Failed to update user"
 */
export async function PUT(req: NextRequest) {
  try {
    const prisma_client = isVercel() ? new PrismaClient() : prisma;
    if (!prisma_client) {
      throw new Error('Prisma client not initialized');
    }
    const body = await req.json();
    const {
      id,
      first_name,
      last_name,
      full_name,
      email,
      avatar_url,
      active_workspace_id,
      delete_avatar,
    } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'User id is required' },
        { status: 400 }
      );
    }

    // Retrieve the existing user data
    const existingUser = await prisma_client.user.findUnique({
      where: { id: Number(id) },
      select: { avatar_url: true },
    });

    if (!existingUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    let newAvatarUrl = avatar_url;

    // If delete_avatar is true, set avatar_url to null
    if (delete_avatar) {
      newAvatarUrl = null;
    }

    // Update user data
    const updatedUser: any = await prisma_client.user.update({
      where: { id: Number(id) },
      data: {
        first_name,
        last_name,
        full_name,
        email,
        avatar_url: newAvatarUrl,
        active_workspace_id: active_workspace_id ? Number(active_workspace_id) : null,
      },
    });

    if (updatedUser.avatar_url) {
      // If the updatedUser.avatar_url is a storage path (not an external URL), generate a public URL
      if (!updatedUser.avatar_url.startsWith('http')) {
        try {
          updatedUser.avatar_signed_url = generatePublicUrl(updatedUser.avatar_url);
        } catch (error) {
          console.error('Error generating public URL for avatar:', error);
        }
      }
    }
    return NextResponse.json(updatedUser, { status: 200 });
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    );
  }
}
