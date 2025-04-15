interface NameError {
  title: string;
  description: string;
}

export function checkWorkflowName(name: string): NameError | null {
  if (name.includes('-')) {
    return {
      title: 'Invalid Character',
      description: 'Workflow name cannot contain hyphens (-)'
    };
  }

  if (name.length > 50) {
    return {
      title: 'Invalid Name Length',
      description: 'Workflow name cannot be longer than 50 characters'
    };
  }

  return null;
}

export function checkFolderName(name: string): NameError | null {
  if (name.length > 100) {
    return {
      title: 'Invalid Name Length',
      description: 'Folder name cannot be longer than 100 characters'
    };
  }

  return null;
}

export function checkWorkspaceName(name: string): NameError | null {
  if (name.length > 50) {
    return {
      title: 'Invalid Name Length',
      description: 'Workspace name cannot be longer than 50 characters'
    };
  }

  return null;
} 