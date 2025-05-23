import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { ReactFlowPageClient } from './components/ReactFlowPageClient';
import { Metadata } from 'next';
import getBaseUrl from '@/app/onboarding/utils/getBaseUrl';
import { isPreview } from '@/app/onboarding/utils/isPreview';

interface PageParams {
  flow: string;
}

interface Workflow {
  id: number;
  name: string;
  icon: string;
  description: string;
  workspace_id: number;
  public_access_id: string;
  folder_id?: number;
  last_opened?: Date;
  updated_at: string;
  created_at: string;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<PageParams>;
}): Promise<Metadata> {
  const resolvedParams = await params;

  // Decode the flow parameter
  const lastPfIndex = resolvedParams.flow.lastIndexOf('--pf-');
  const workflowName = resolvedParams.flow.slice(0, lastPfIndex);
  const workflowId = resolvedParams.flow.slice(lastPfIndex + 5);
  if (!workflowName || !workflowId) {
    return { title: 'ProcessFlow' };
  }
  const baseUrl = getBaseUrl();
  console.log('[DEBUG] Base URL:', baseUrl);
  const response = await fetch(`${baseUrl}/api/workflow/${workflowId}`);

  if (!response.ok) {
    return { title: 'ProcessFlow' };
  }

  const workflow: Workflow = await response.json();
  return {
    title: `${workflow.name} | ProcessFlow`,
  };
}

export default async function ReactFlowPage({
  params,
}: {
  params: Promise<PageParams>;
}) {
  const resolvedParams = await params;

  // Decode the flow parameter
  const lastPfIndex = resolvedParams.flow.lastIndexOf('--pf-');
  const workflowName = resolvedParams.flow.slice(0, lastPfIndex);
  const workflowId = resolvedParams.flow.slice(lastPfIndex + 5);
  if (!workflowName || !workflowId) {
    redirect('/'); // Redirect to root if parameters are invalid
  }

  // Get workflow data from API using path parameter
  const baseUrl = getBaseUrl();
  if (isPreview()) {
    console.log('[DEBUG] Base URL:', baseUrl);
  }
  const response = await fetch(`${baseUrl}/api/workflow/${workflowId}`);
  if (isPreview()) {
    console.log('[DEBUG] Response:', response);
  }

  if (!response.ok) {
    // Handle unauthorized or not found cases
    let error: any = {};
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      error = await response.json();
    }
    if (isPreview()) {
      console.log('[DEBUG] Error:', error);
    }
    if (response.status === 401) {
      redirect('/login');
    } else {
      redirect('/');
    }
  }

  const workflow: Workflow = await response.json();
  if (isPreview()) {
    console.log('[DEBUG] Workflow:', workflow);
  }

  return (
    <ReactFlowPageClient
      workspaceId={workflow.workspace_id.toString()}
      workflowId={workflow.id.toString()}
    />
  );
}
