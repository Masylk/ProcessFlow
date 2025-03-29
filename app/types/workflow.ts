export interface Workflow {
  id: number;
  name: string;
  description?: string;
  workspaceId: number;
  folder_id?: number | null;
  team_tags?: string[];
  icon?: string | null;
  // ... other existing fields
} 