import prisma from '@/lib/prisma';
import { checkWorkspaceName } from '@/app/utils/checkNames';

export async function editOneWorkspace(id: number | string, data: any) {
  if (data.name) {
    const nameError = checkWorkspaceName(data.name);
    if (nameError) {
      throw new Error(nameError.description);
    }
  }
  return prisma.workspace.update({
    where: { id: typeof id === 'string' ? parseInt(id, 10) : id },
    data,
  });
} 