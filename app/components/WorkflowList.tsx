import Link from 'next/link';

interface Workflow {
  id: number;
  name: string;
  workspaceId: number;
}

interface WorkflowListProps {
  workflows: Workflow[];
  workspaceId: string;
}

function WorkflowList({ workflows, workspaceId }: WorkflowListProps) {
  return (
    <div>
      <h1>Workflows</h1>
      <ul>
        {workflows.map((workflow) => (
          <li key={workflow.id}>
            <Link href={`/workspace/${workspaceId}/${workflow.id}`}>
              {workflow.name}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default WorkflowList;
