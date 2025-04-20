import prisma from '@/lib/prisma';
import { checkWorkspaceName } from '@/app/utils/checkNames';

export async function addOneWorkspace(data: any) {
  if (data.name) {
    const nameError = checkWorkspaceName(data.name);
    if (nameError) {
      throw new Error(nameError.description);
    }
  }
  return prisma.workspace.create({ data });
} 