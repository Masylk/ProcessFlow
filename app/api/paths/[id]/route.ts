import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { supabase } from '@/lib/supabaseClient';
import { deleteOnePath } from '@/app/api/utils/paths/deleteOne';
import { PrismaClient } from '@prisma/client';
import { isVercel } from '@/app/api/utils/isVercel';

export async function GET(req: NextRequest) {
  const prisma_client = isVercel() ? new PrismaClient() : prisma;
  if (!prisma_client) {
    throw new Error('Prisma client not initialized');
  }
  try {
    const url = new URL(req.url);
    const id = url.searchParams.get('id');
    const pathId = parseInt(id!, 10);

    if (!id || isNaN(pathId)) {
      return NextResponse.json(
        { error: 'Invalid path ID' },
        { status: 400 }
      );
    }

    const path = await prisma_client.path.findUnique({
      where: { id: pathId },
      include: {
        blocks: {
          orderBy: {
            position: 'asc',
          },
        },
        parent_blocks: true,
      },
    });

    if (!path) {
      return NextResponse.json(
        { error: 'Path not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(path);
  } catch (error) {
    console.error('Error fetching path:', error);
    return NextResponse.json(
      { error: 'Failed to fetch path' },
      { status: 500 }
    );
  } finally {
    if (isVercel()) {
      await prisma_client.$disconnect();
    }
  }
}

export async function PATCH(
  req: NextRequest,
  props: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const prisma_client = isVercel() ? new PrismaClient() : prisma;
  if (!prisma_client) {
    throw new Error('Prisma client not initialized');
  }
  try {
    const params = await props.params;
    const id = parseInt(params.id);
    const { name } = await req.json();

    if (!name) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      );
    }

    const updatedPath = await prisma_client.path.update({
      where: { id },
      data: { name },
      select: {
        id: true,
        name: true,
      }
    });

    return NextResponse.json(updatedPath);
  } catch (error) {
    console.error('Error updating path:', error);
    return NextResponse.json(
      { error: 'Failed to update path' },
      { status: 500 }
    );
  } finally {
    if (isVercel()) {
      await prisma_client.$disconnect();
    }
  }
}

export async function DELETE(req: NextRequest) {
  const prisma_client = isVercel() ? new PrismaClient() : prisma;
  if (!prisma_client) {
    throw new Error('Prisma client not initialized');
  }
  try {
    const id = req.nextUrl.pathname.split('/')[3];
    const pathId = parseInt(id);

    // Get the path and its blocks to handle image deletion
    const path = await prisma_client.path.findUnique({
      where: { id: pathId },
      include: {
        blocks: true,
        parent_blocks: true,
      },
    });

    if (!path) {
      return NextResponse.json({ error: 'Path not found' }, { status: 404 });
    }

    // Delete images from storage if they exist
    const bucketName = process.env.NEXT_PUBLIC_SUPABASE_PRIVATE_BUCKET;
    if (bucketName) {
      for (const block of path.blocks) {
        if (block.image) {
          const { error } = await supabase.storage
            .from(bucketName)
            .remove([block.image]);
          
          if (error) {
            console.error('Error deleting image:', error);
          }
        }
      }
    }

    // Use the new deleteOnePath logic
    try {
      await deleteOnePath(pathId);
    } catch (err: any) {
      return NextResponse.json(
        { error: err.message || 'Failed to delete path' },
        { status: 409 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting path:', error);
    return NextResponse.json(
      { error: 'Failed to delete path' },
      { status: 500 }
    );
  } finally {
    if (isVercel()) {
      await prisma_client.$disconnect();
    }
  }
}
