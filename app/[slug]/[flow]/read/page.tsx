import { Metadata } from 'next';
import ReadPageClient from './components/ReadPageClient';

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

export default function Page({
  params,
}: {
  params: { slug: string; flow: string };
}) {
  return <ReadPageClient />;
}
