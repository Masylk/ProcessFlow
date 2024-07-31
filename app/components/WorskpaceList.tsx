import Link from 'next/link';

interface Workspace {
  id: number;
  name: string;
  teamId: number;
}

interface WorkspaceListProps {
  workspaces: Workspace[];
}

function WorkspaceList({ workspaces }: WorkspaceListProps) {
  return (
    <div>
      <h1>Workspaces</h1>
      <ul>
        {workspaces.map((workspace) => (
          <li key={workspace.id}>
            <Link href={`/workspace/${workspace.id}`}>{workspace.name}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default WorkspaceList;
