import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { generatePublicAccessId } from '../utils';
import { supabase } from '@/lib/supabaseClient';
import { isPreview } from '@/app/onboarding/utils/isPreview';

export async function PATCH(req: NextRequest) {
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

    const updatedWorkflow = await prisma.workflow.update({
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
  }
}

export async function GET(
  req: NextRequest,
  props: { params: Promise<{ workflow_id: string }> }
) {
  try {
    if (isPreview()) {
      console.log('[GET] /api/workflow/[workflow_id] called');
    }
    const params = await props.params;
    if (isPreview()) {
      console.log('[GET] Params:', params);
    }

    const workflowId = parseInt(params.workflow_id);

    if (isPreview()) {
      console.log('[GET] Fetching workflow from DB...');
    }
    let workflow: any = await prisma.workflow.findUnique({
      where: { id: workflowId },
      select: {
        id: true,
        name: true,
        icon: true,
        is_public: true,
        public_access_id: true,
        description: true,
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
    if (isPreview()) {
      console.log('[GET] Workflow fetched:', workflow);
    }

    if (!workflow) {
      if (isPreview()) {
        console.log('[GET] Workflow not found');
      }
      return new NextResponse(null, { status: 404 });
    }

    if (!workflow.public_access_id) {
      if (isPreview()) {
        console.log('[GET] No public_access_id, generating...');
      }
      const publicId = await generatePublicAccessId(
        workflow.name,
        workflow.id,
        workflow.workspace_id
      );
      if (isPreview()) {
        console.log('[GET] Generated public_access_id:', publicId);
      }

      if (isPreview()) {
        console.log('[GET] Updating workflow with new public_access_id...');
      }
      workflow = await prisma.workflow.update({
        where: { id: workflowId },
        data: { public_access_id: publicId },
        select: {
          id: true,
          name: true,
          icon: true,
          is_public: true,
          public_access_id: true,
          description: true,
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
      if (isPreview()) {
        console.log('[GET] Workflow updated with public_access_id:', workflow);
      }
    }

    // Add signedIconUrl if workflow.icon exists and is not a Brandfetch URL
    if (workflow.icon && !workflow.icon.startsWith('https://cdn.brandfetch.io/')) {
      const bucketName = process.env.NEXT_PUBLIC_SUPABASE_PRIVATE_BUCKET;
      if (bucketName) {
        if (isPreview()) {
          console.log('[GET] Generating signed icon URL for:', workflow.icon);
        }
        const { data, error } = await supabase.storage
          .from(bucketName)
          .createSignedUrl(workflow.icon, 86400);
        if (!error && data?.signedUrl) {
          (workflow as any).signedIconUrl = data.signedUrl;
          if (isPreview()) {
            console.log('[GET] Signed icon URL generated:', data.signedUrl);
          }
        } else {
          if (isPreview()) {
            console.log('[GET] Error generating signed icon URL:', error);
          }
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
        if (isPreview()) {
          console.log('[GET] Generating signed avatar URL for:', workflow.author.avatar_url);
        }
        const { data, error } = await supabase.storage
          .from(bucketName)
          .createSignedUrl(workflow.author.avatar_url, 86400);
        if (!error && data?.signedUrl) {
          (workflow.author as any).avatar_signed_url = data.signedUrl;
          if (isPreview()) {
            console.log('[GET] Signed avatar URL generated:', data.signedUrl);
          }
        } else {
          if (isPreview()) {
            console.log('[GET] Error generating signed avatar URL:', error);
          }
        }
      }
    }
    
    if (isPreview()) {
      console.log('[GET] Returning workflow:', workflow);
    }
    return NextResponse.json(workflow);
  } catch (error) {
    if (isPreview()) {
      console.error('Error fetching workflow:', error);
    }
    return new NextResponse(null, { status: 500 });
  }
} 