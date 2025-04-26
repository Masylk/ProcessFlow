import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest) {
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
    const existingWorkspace = await prisma.workspace.findFirst({
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
  }
} 