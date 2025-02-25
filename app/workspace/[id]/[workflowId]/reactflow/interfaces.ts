export interface Block {
  id: number;
  position: number;
  path_id: number;
  step_block?: {
    step_data: string;
  };
  type?: 'STEP' | 'PATH' | 'DELAY';
  workflow_id?: number;
} 