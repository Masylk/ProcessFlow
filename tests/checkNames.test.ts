import { checkWorkflowName, checkFolderName, checkWorkspaceName } from '../app/utils/checkNames';

describe('checkWorkflowName', () => {
  it('returns null for valid name', () => {
    expect(checkWorkflowName('Valid Name')).toBeNull();
  });

  it('returns error for name longer than 50 chars', () => {
    const longName = 'a'.repeat(51);
    expect(checkWorkflowName(longName)).toEqual({
      title: 'Invalid Name Length',
      description: 'Workflow name cannot be longer than 50 characters'
    });
  });
});

describe('checkFolderName', () => {
  it('returns null for valid name', () => {
    expect(checkFolderName('Valid Folder')).toBeNull();
  });

  it('returns error for name longer than 100 chars', () => {
    const longName = 'a'.repeat(101);
    expect(checkFolderName(longName)).toEqual({
      title: 'Invalid Name Length',
      description: 'Folder name cannot be longer than 100 characters'
    });
  });
});

describe('checkWorkspaceName', () => {
  it('returns null for valid name', () => {
    expect(checkWorkspaceName('Valid Workspace')).toBeNull();
  });

  it('returns error for name longer than 50 chars', () => {
    const longName = 'a'.repeat(51);
    expect(checkWorkspaceName(longName)).toEqual({
      title: 'Invalid Name Length',
      description: 'Workspace name cannot be longer than 50 characters'
    });
  });

  it('returns error for invalid characters', () => {
    expect(checkWorkspaceName('Invalid!Name')).toEqual({
      title: 'Invalid Characters',
      description: 'Workspace name must contain only letters, numbers, spaces, and hyphens.'
    });
  });
}); 