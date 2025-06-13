/*
  Warnings:

  - A unique constraint covering the columns `[user_id,workspace_id]` on the table `user_workspace` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "user_workspace_user_id_workspace_id_key" ON "user_workspace"("user_id", "workspace_id");
