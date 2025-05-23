import { redirect } from 'next/navigation';
import { Metadata } from 'next';
import ReadPageClient from './components/ReadPageClient';
import getBaseUrl from '@/app/onboarding/utils/getBaseUrl';

interface PageParams {
  slug: string;
  flow: string;
}

interface PageProps {
  params: Promise<PageParams>;
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
  // Decode the flow parameter
  const resolvedParams = await params;
  const lastPfIndex = resolvedParams.flow.lastIndexOf('--pf-');
  const workflowName = resolvedParams.flow.slice(0, lastPfIndex);
  const workflowId = resolvedParams.flow.slice(lastPfIndex + 5);
  if (!workflowName || !workflowId) {
    return { title: 'ProcessFlow' };
  }

  // Get workflow data from API
  const baseUrl = getBaseUrl();
  const response = await fetch(`${baseUrl}/api/workflow/${workflowId}`);

  if (!response.ok) {
    return { title: 'ProcessFlow' };
  }

  const workflow: Workflow = await response.json();
  return {
    title: `${workflow.name} | ProcessFlow`,
  };
}

export default async function ReadPage(props: PageProps) {
  // Decode the flow parameter
  const params = await props.params;
  const lastPfIndex = params.flow.lastIndexOf('--pf-');
  const workflowName = params.flow.slice(0, lastPfIndex);
  const workflowId = params.flow.slice(lastPfIndex + 5);
  if (!workflowName || !workflowId) {
    redirect('/'); // Redirect to root if parameters are invalid
  }

  // Get workflow data from API using path parameter
  const baseUrl = getBaseUrl();
  const response = await fetch(`${baseUrl}/api/workflow/${workflowId}`);

  if (!response.ok) {
    // Handle unauthorized or not found cases
    const { error } = await response.json();
    if (response.status === 401) {
      redirect('/login');
    } else {
      redirect('/');
    }
  }

  // You can pass workflow props here if needed
  // const workflow: Workflow = await response.json();

  return <ReadPageClient />;
}
