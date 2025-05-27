import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { supabase } from '@/lib/supabaseClient';
import { PrismaClient } from '@prisma/client';
import { isVercel } from '@/app/api/utils/isVercel';

export async function GET(req: NextRequest) {
  const prisma_client = isVercel() ? new PrismaClient() : prisma;
  try {
    const { searchParams } = new URL(req.url);
    const public_access_id = searchParams.get('public_access_id');

    if (!public_access_id) {
      return NextResponse.json(
        { error: 'Public access ID is required' },
        { status: 400 }
      );
    }

    const workflow: any = await prisma_client.workflow.findFirst({
      where: {
        public_access_id,
        is_public: true,
      },
      include: {
        workspace: {
          select: {
            id: true,
            name: true,
          },
        },
        folder: {
          select: {
            id: true,
            name: true,
            parent: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        author: {
          select: {
            full_name: true,
            avatar_url: true,
          },
        },
      },
    });

    if (!workflow) {
      return NextResponse.json(
        { error: 'Workflow not found or not public' },
        { status: 404 }
      );
    }
    
    if (
      workflow.author?.avatar_url &&
      !workflow.author.avatar_url.startsWith('http')
    ) {
      const bucketName = process.env.NEXT_PUBLIC_SUPABASE_PRIVATE_BUCKET;
      if (bucketName) {
        const { data, error } = await supabase.storage
          .from(bucketName)
          .createSignedUrl(workflow.author.avatar_url, 86400);
        if (!error && data?.signedUrl) {
          workflow.author.avatar_signed_url = data.signedUrl;
        }
      }
    }
    return NextResponse.json(workflow);
  } catch (error) {
    console.error('Error fetching public workflow:', error);
    return NextResponse.json(
      { error: 'Failed to fetch workflow' },
      { status: 500 }
    );
  } finally {
    if (isVercel()) await prisma_client.$disconnect();
  }
} 