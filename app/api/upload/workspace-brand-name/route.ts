import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';
import { createClient } from '@/utils/supabase/server';
import { v4 as uuidv4 } from 'uuid';
import prisma from '@/lib/prisma';
import { PrismaClient } from '@prisma/client';
import { isVercel } from '@/app/api/utils/isVercel';

export async function POST(req: NextRequest) {
  let prisma_client: PrismaClient | undefined;

  try {
    prisma_client = isVercel() ? new PrismaClient() : prisma;

    if (!prisma_client) {
      return NextResponse.json(
        { error: 'Database connection not available' },
        { status: 500 }
      );
    }

    // Get authenticated user
    const supabaseServer = await createClient();
    const { data: userData, error: userError } =
      await supabaseServer.auth.getUser();

    if (userError || !userData || !userData.user) {
      return NextResponse.json(
        { error: 'User not authenticated' },
        { status: 401 }
      );
    }

    const userUID = userData.user.id;

    // Get user's active workspace
    const user = await prisma_client.user.findUnique({
      where: { auth_id: userUID },
      include: {
        active_workspace: true,
      },
    });

    if (!user || !user.active_workspace) {
      return NextResponse.json(
        { error: 'No active workspace found' },
        { status: 400 }
      );
    }

    const workspaceSlug = user.active_workspace.slug;

    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const workspaceId = formData.get('workspaceId') as string | null;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    if (!workspaceId) {
      return NextResponse.json(
        { error: 'No workspace ID provided' },
        { status: 400 }
      );
    }

    // Retrieve bucket name from environment variable
    const bucketName = process.env.NEXT_PUBLIC_SUPABASE_WORKSPACE_BUCKET;

    if (!bucketName) {
      return NextResponse.json(
        { error: 'Bucket name is not defined in environment variables' },
        { status: 500 }
      );
    }

    // Check for existing brand name image and delete it if exists
    const existingWorkspace = await prisma_client.workspace.findUnique({
      where: { id: parseInt(workspaceId) },
      select: { brand_name_img_url: true },
    });

    if (existingWorkspace?.brand_name_img_url) {
      // Delete existing file from storage
      const { error: deleteError } = await supabase.storage
        .from(bucketName)
        .remove([existingWorkspace.brand_name_img_url]);

      if (deleteError) {
        console.error(
          'Failed to delete existing brand name image:',
          deleteError
        );
      }
    }

    // Validate file type - only images allowed
    const allowedMimeTypes = [
      'image/svg+xml',
      'image/png',
      'image/jpeg',
      'image/gif',
    ];
    if (!allowedMimeTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only images are allowed.' },
        { status: 400 }
      );
    }

    const buffer = await file.arrayBuffer();
    const fileData = new Uint8Array(buffer);

    // Generate a unique file name
    const sanitizedFileName = file.name.replace(/\s+/g, '_');
    const fileName = `${uuidv4()}-${sanitizedFileName}`;
    const filePath = `uploads/${workspaceSlug}/${fileName}`;

    // Upload the file
    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(filePath, fileData, {
        contentType: file.type,
        upsert: true, // Allow overwriting existing brand name image
      });

    if (error) {
      console.error('Supabase upload error:', error);
      return NextResponse.json(
        { error: 'File upload failed' },
        { status: 500 }
      );
    }

    // Update workspace with new brand name image URL
    await prisma_client.workspace.update({
      where: { id: parseInt(workspaceId) },
      data: { brand_name_img_url: filePath },
    });

    return NextResponse.json({
      message: `Brand name image uploaded successfully: ${filePath}`,
      filePath,
    });
  } catch (error) {
    console.error('File upload error:', error);
    return NextResponse.json({ error: 'File upload failed' }, { status: 500 });
  } finally {
    if (isVercel() && prisma_client) await prisma_client.$disconnect();
  }
}

export async function DELETE(req: NextRequest) {
  let prisma_client: PrismaClient | undefined;
  try {
    prisma_client = isVercel() ? new PrismaClient() : prisma;

    if (!prisma_client) {
      return NextResponse.json(
        { error: 'Database connection not available' },
        { status: 500 }
      );
    }

    // Get authenticated user
    const supabaseServer = await createClient();
    const { data: userData, error: userError } =
      await supabaseServer.auth.getUser();

    if (userError || !userData || !userData.user) {
      return NextResponse.json(
        { error: 'User not authenticated' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const workspaceId = searchParams.get('workspaceId');

    if (!workspaceId) {
      return NextResponse.json(
        { error: 'No workspace ID provided' },
        { status: 400 }
      );
    }
    // Get the workspace to find the current brand name image URL
    const workspace = await prisma_client.workspace.findUnique({
      where: { id: parseInt(workspaceId) },
      select: { brand_name_img_url: true },
    });

    if (!workspace?.brand_name_img_url) {
      return NextResponse.json(
        { error: 'No brand name image found' },
        { status: 404 }
      );
    }

    const bucketName = process.env.NEXT_PUBLIC_SUPABASE_WORKSPACE_BUCKET;

    if (!bucketName) {
      return NextResponse.json(
        { error: 'Bucket name is not defined in environment variables' },
        { status: 500 }
      );
    }

    // Delete the file from storage
    const { error: deleteError } = await supabase.storage
      .from(bucketName)
      .remove([workspace.brand_name_img_url]);

    if (deleteError) {
      console.error('Supabase delete error:', deleteError);
    }

    // Update workspace to remove the brand name image URL
    await prisma_client.workspace.update({
      where: { id: parseInt(workspaceId) },
      data: { brand_name_img_url: null },
    });

    return NextResponse.json({
      message: 'Brand name image deleted successfully',
    });
  } catch (error) {
    console.error('Delete error:', error);
    return NextResponse.json(
      { error: 'Failed to delete brand name image' },
      { status: 500 }
    );
  } finally {
    if (isVercel() && prisma_client) await prisma_client.$disconnect();
  }
}
