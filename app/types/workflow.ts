export interface Workflow {
  id: number;
  name: string;
  description?: string;
  workspaceId: number;
  folder_id?: number | null;
  team_tags?: string[];
  icon?: string | null;
  created_at?: string;
  updated_at?: string;
  // ... other existing fields
} 