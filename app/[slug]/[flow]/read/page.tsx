import { redirect } from 'next/navigation';
import { Metadata } from 'next';
import ReadPageClient from './components/ReadPageClient';

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
  team_tags: string[];
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
  const [workflowName, workflowId] = resolvedParams.flow.split('--pf-');
  if (!workflowName || !workflowId) {
    return { title: 'ProcessFlow' };
  }

  // Get workflow data from API
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_APP_URL}/api/workflows/${workflowId}`
  );

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
  const [workflowName, workflowId] = params.flow.split('--pf-');
  if (!workflowName || !workflowId) {
    redirect('/'); // Redirect to root if parameters are invalid
  }

  // Get workflow data from API using path parameter
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_APP_URL}/api/workflows/${workflowId}`
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

  // You can pass workflow props here if needed
  // const workflow: Workflow = await response.json();

  return <ReadPageClient />;
}
