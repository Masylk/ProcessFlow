import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { PrismaClient } from '@prisma/client';
import { isVercel } from '@/app/api/utils/isVercel';

export async function GET(req: NextRequest) {
  const prisma_client = isVercel() ? new PrismaClient() : prisma;
  if (!prisma_client) {
    throw new Error('Prisma client not initialized');
  }
  try {
    const { searchParams } = new URL(req.url);
    const slug = searchParams.get('slug');

    if (!slug) {
      return NextResponse.json(
        { error: 'Slug parameter is required' },
        { status: 400 }
      );
    }

    // Check if a workspace with this slug exists
    const existingWorkspace = await prisma_client.workspace.findFirst({
      where: { slug },
    });

    return NextResponse.json({
      available: !existingWorkspace,
      message: existingWorkspace 
        ? 'This workspace URL is already taken' 
        : 'This workspace URL is available'
    });
  } catch (error) {
    console.error('Error checking workspace slug:', error);
    return NextResponse.json(
      { error: 'Failed to check workspace slug availability' },
      { status: 500 }
    );
  } finally {
    if (isVercel()) await prisma_client.$disconnect();
  }
} 