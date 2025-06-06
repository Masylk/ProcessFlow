// app/api/deleteUser/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { supabaseAdmin } from '@/utils/supabase/admin'; // Use the new admin client
import { PrismaClient } from '@prisma/client';
import { isVercel } from '@/app/api/utils/isVercel';
import { supabase } from '@/lib/supabaseClient';

/**
 * @swagger
 * /api/deleteUser:
 *   post:
 *     summary: Delete a user from the database and Supabase Auth
 *     description: Removes a user from the PostgreSQL database and Supabase authentication system.
 *     tags:
 *       - User 
*     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *                 description: The authentication ID of the user to be deleted.
 *                 example: "user-12345"
 *     responses:
 *       200:
 *         description: User successfully deleted
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *       400:
 *         description: Missing user ID in the request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "User ID is required"
 *       404:
 *         description: User not found in the database
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "User not found in database"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Internal Server Error: Error message"
 */
export async function POST(req: NextRequest) {
  const prisma_client = isVercel() ? new PrismaClient() : prisma;
  if (!prisma_client) {
    throw new Error('Prisma client not initialized');
  }
  try {
    const { userId } = await req.json();

    console.log('deleting user', userId);
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Find user in PostgreSQL using auth_id
    const user = await prisma_client.user.findUnique({
      where: { auth_id: userId },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found in database' },
        { status: 404 }
      );
    }

    // Delete related user_workspace
    await prisma_client.user_workspace.deleteMany({ where: { user_id: user.id } });

    // Delete the user from PostgreSQL
    await prisma_client.user.delete({ where: { id: user.id } });

    // Delete the user from Supabase Auth using the admin client
  
    const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);

    if (error) {
      return NextResponse.json(
        { error: `Failed to delete user in Supabase: ${error.message}` },
        { status: 500 }
      );
    }

    // Delete all files in the user's storage folder (named after their UID)
    const bucketName = process.env.NEXT_PUBLIC_SUPABASE_PRIVATE_BUCKET;
    if (bucketName) {
      try {
        // List all files in the user's root folder (UID)
        const { data: files, error: listError } = await supabase.storage.from(bucketName).list(`${userId}/avatars`);
        console.log('files', files);
        if (listError) {
          console.error(`Error listing files for user ${userId}:`, listError);
        } else if (files && files.length > 0) {
          // Collect all file paths (including subfolders)
          const filePaths = files.map((file: any) => `${userId}/avatars/${file.name}`);
          const { error: removeError } = await supabase.storage.from(bucketName).remove(filePaths);
          if (removeError) {
            console.error(`Error deleting files for user ${userId}:`, removeError);
          }
        }
      } catch (storageError) {
        console.error(`Unexpected error deleting user files for ${userId}:`, storageError);
      }
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { error: `Internal Server Error: ${error.message}` },
      { status: 500 }
    );
  } finally {
    if (isVercel()) {
      await prisma_client.$disconnect();
    }
  }
}