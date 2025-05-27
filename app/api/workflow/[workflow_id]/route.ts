import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { PrismaClient } from '@prisma/client';
import { isVercel } from '@/app/api/utils/isVercel';
import { generatePublicAccessId } from '../utils';
import { supabase } from '@/lib/supabaseClient';

export async function PATCH(req: NextRequest) {
  const prisma_client = isVercel() ? new PrismaClient() : prisma;
  try {
    const workflow_id = req.nextUrl.pathname.split('/').pop();
    if (!workflow_id) {
      return NextResponse.json({ error: 'Workflow ID is required' }, { status: 400 });
    }

    const data = await req.json();
    
    // Ensure is_public is a boolean if it's being updated
    if ('is_public' in data && typeof data.is_public !== 'boolean') {
      return NextResponse.json({ error: 'is_public must be a boolean' }, { status: 400 });
    }

    const updatedWorkflow = await prisma_client.workflow.update({
      where: { id: parseInt(workflow_id) },
      data: {
        ...data,
        updated_at: new Date()
      },
      select: {
        id: true,
        name: true,
        icon: true,
        is_public: true,
        public_access_id: true,
        description: true,
        process_owner: true,
        review_date: true,
        additional_notes: true,
        workspace_id: true,
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
        workspace: {
          select: {
            id: true,
            name: true,
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

    return NextResponse.json(updatedWorkflow);
  } catch (error) {
    console.error('Error updating workflow:', error);
    return NextResponse.json({ error: 'Failed to update workflow' }, { status: 500 });
  } finally {
    if (isVercel()) await prisma_client.$disconnect();
  }
}

export async function GET(
  req: NextRequest,
  props: { params: Promise<{ workflow_id: string }> }
) {
  const prisma_client = isVercel() ? new PrismaClient() : prisma;
  try {
    const params = await props.params;

    const workflowId = parseInt(params.workflow_id);

    let workflow: any = await prisma_client.workflow.findUnique({
      where: { id: workflowId },
      select: {
        id: true,
        name: true,
        icon: true,
        is_public: true,
        public_access_id: true,
        description: true,
        process_owner: true,
        review_date: true,
        additional_notes: true,
        workspace_id: true,
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
        workspace: {
          select: {
            id: true,
            name: true,
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
      return new NextResponse(null, { status: 404 });
    }

    if (!workflow.public_access_id) {
      const publicId = await generatePublicAccessId(
        workflow.name,
        workflow.id,
        workflow.workspace_id
      );

      workflow = await prisma_client.workflow.update({
        where: { id: workflowId },
        data: { public_access_id: publicId },
        select: {
          id: true,
          name: true,
          icon: true,
          is_public: true,
          public_access_id: true,
          description: true,
          process_owner: true,
          review_date: true,
          additional_notes: true,
          workspace_id: true,
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
          workspace: {
            select: {
              id: true,
              name: true,
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
    }

    // Add signedIconUrl if workflow.icon exists and is not a Brandfetch URL
    if (workflow.icon && !workflow.icon.startsWith('https://cdn.brandfetch.io/')) {
      const bucketName = process.env.NEXT_PUBLIC_SUPABASE_PRIVATE_BUCKET;
      if (bucketName) {
        const { data, error } = await supabase.storage
          .from(bucketName)
          .createSignedUrl(workflow.icon, 86400);
        if (!error && data?.signedUrl) {
          (workflow as any).signedIconUrl = data.signedUrl;
        } 
      }
    }

    // Add signed avatar URL for author if needed
    if (
      workflow.author &&
      workflow.author.avatar_url &&
      !workflow.author.avatar_url.startsWith('http')
    ) {
      const bucketName = process.env.NEXT_PUBLIC_SUPABASE_PRIVATE_BUCKET;
      if (bucketName) {
        const { data, error } = await supabase.storage
          .from(bucketName)
          .createSignedUrl(workflow.author.avatar_url, 86400);
        if (!error && data?.signedUrl) {
          (workflow.author as any).avatar_signed_url = data.signedUrl;
        } 
      }
    }
    
    return NextResponse.json(workflow);
  } catch (error) {
    console.error('Error fetching workflow:', error);
    return new NextResponse(null, { status: 500 });
  } finally {
    if (isVercel()) await prisma_client.$disconnect();
  }
}