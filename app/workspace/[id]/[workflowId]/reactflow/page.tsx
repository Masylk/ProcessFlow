import { ReactFlowPageClient } from './components/ReactFlowPageClient';

interface PageParams {
  id: string;
  workflowId: string;
}

export default async function ReactFlowPage({
  params,
}: {
  params: Promise<PageParams>;
}) {
  const resolvedParams = await params; // Next.js 15 supports async components

  return (
    <ReactFlowPageClient
      workspaceId={resolvedParams.id}
      workflowId={resolvedParams.workflowId}
    />
  );
}
