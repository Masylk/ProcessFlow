/*
  Warnings:

  - You are about to drop the column `active_workspace` on the `user` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "user" DROP COLUMN "active_workspace",
ADD COLUMN     "active_workspace_id" INTEGER;

-- CreateIndex
CREATE INDEX "user_active_workspace_id_idx" ON "user"("active_workspace_id");

-- AddForeignKey
ALTER TABLE "user" ADD CONSTRAINT "user_active_workspace_id_fkey" FOREIGN KEY ("active_workspace_id") REFERENCES "workspace"("id") ON DELETE SET NULL ON UPDATE CASCADE;
