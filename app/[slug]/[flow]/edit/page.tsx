import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { ReactFlowPageClient } from './components/ReactFlowPageClient';
import { Metadata } from 'next';

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
  team_tags: string[];
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
  const [workflowName, workflowId] = resolvedParams.flow.split('--pf-');
  if (!workflowName || !workflowId) {
    return { title: 'ProcessFlow' };
  }

  // Get workflow data from API
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_APP_URL}/api/workflow/${workflowId}`
  );

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
  const [workflowName, workflowId] = resolvedParams.flow.split('--pf-');
  if (!workflowName || !workflowId) {
    redirect('/'); // Redirect to root if parameters are invalid
  }

  // Get workflow data from API using path parameter
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_APP_URL}/api/workflow/${workflowId}`
  );

  if (!response.ok) {
    // Handle unauthorized or not found cases
    const { error } = await response.json();
    if (response.status === 401) {
      redirect('/login');
    } else {
      redirect('/');
    }
  }

  const workflow: Workflow = await response.json();

  return (
    <ReactFlowPageClient
      workspaceId={workflow.workspace_id.toString()}
      workflowId={workflow.id.toString()}
    />
  );
}
