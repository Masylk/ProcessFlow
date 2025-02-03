/*
  Warnings:

  - You are about to drop the column `folderId` on the `workflow` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "workflow" DROP CONSTRAINT "workflow_folderId_fkey";

-- AlterTable
ALTER TABLE "workflow" DROP COLUMN "folderId",
ADD COLUMN     "folder_id" INTEGER;

-- AddForeignKey
ALTER TABLE "workflow" ADD CONSTRAINT "workflow_folder_id_fkey" FOREIGN KEY ("folder_id") REFERENCES "folder"("id") ON DELETE SET NULL ON UPDATE CASCADE;
