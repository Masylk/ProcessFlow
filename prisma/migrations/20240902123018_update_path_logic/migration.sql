/*
  Warnings:

  - Added the required column `workflowId` to the `Path` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Path" ADD COLUMN     "workflowId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "Path" ADD CONSTRAINT "Path_workflowId_fkey" FOREIGN KEY ("workflowId") REFERENCES "Workflow"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
