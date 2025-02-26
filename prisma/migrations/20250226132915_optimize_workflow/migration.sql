/*
  Warnings:

  - You are about to drop the column `path_block_id` on the `path` table. All the data in the column will be lost.
  - The `onboarding_step` column on the `user` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `role` column on the `user_workspace` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the `delay_block` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `path_block` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `step_block` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `workspace_id` to the `billing` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "onboarding_step" AS ENUM ('PERSONAL_INFO', 'PROFESSIONAL_INFO', 'WORKSPACE_SETUP', 'COMPLETED');

-- CreateEnum
CREATE TYPE "user_role" AS ENUM ('ADMIN', 'EDITOR', 'READER');

-- DropForeignKey
ALTER TABLE "delay_block" DROP CONSTRAINT "delay_block_block_id_fkey";

-- DropForeignKey
ALTER TABLE "path" DROP CONSTRAINT "path_path_block_id_fkey";

-- DropForeignKey
ALTER TABLE "path_block" DROP CONSTRAINT "path_block_block_id_fkey";

-- DropForeignKey
ALTER TABLE "step_block" DROP CONSTRAINT "step_block_block_id_fkey";

-- AlterTable
ALTER TABLE "action" ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "billing" ADD COLUMN     "workspace_id" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "block" ADD COLUMN     "delay_seconds" INTEGER,
ADD COLUMN     "step_details" TEXT;

-- AlterTable
ALTER TABLE "folder" ADD COLUMN     "path" TEXT;

-- AlterTable
ALTER TABLE "path" DROP COLUMN "path_block_id";

-- AlterTable
ALTER TABLE "user" DROP COLUMN "onboarding_step",
ADD COLUMN     "onboarding_step" "onboarding_step" DEFAULT 'PERSONAL_INFO';

-- AlterTable
ALTER TABLE "user_workspace" DROP COLUMN "role",
ADD COLUMN     "role" "user_role" NOT NULL DEFAULT 'ADMIN';

-- DropTable
DROP TABLE "delay_block";

-- DropTable
DROP TABLE "path_block";

-- DropTable
DROP TABLE "step_block";

-- DropEnum
DROP TYPE "OnboardingStep";

-- DropEnum
DROP TYPE "role";

-- CreateTable
CREATE TABLE "path_parent_block" (
    "path_id" INTEGER NOT NULL,
    "block_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "path_parent_block_pkey" PRIMARY KEY ("path_id","block_id")
);

-- CreateIndex
CREATE INDEX "path_parent_block_path_id_idx" ON "path_parent_block"("path_id");

-- CreateIndex
CREATE INDEX "path_parent_block_block_id_idx" ON "path_parent_block"("block_id");

-- CreateIndex
CREATE INDEX "action_user_id_idx" ON "action"("user_id");

-- CreateIndex
CREATE INDEX "action_target_id_idx" ON "action"("target_id");

-- CreateIndex
CREATE INDEX "action_workflow_id_idx" ON "action"("workflow_id");

-- CreateIndex
CREATE INDEX "action_created_at_idx" ON "action"("created_at");

-- CreateIndex
CREATE INDEX "billing_workspace_id_idx" ON "billing"("workspace_id");

-- CreateIndex
CREATE INDEX "block_workflow_id_idx" ON "block"("workflow_id");

-- CreateIndex
CREATE INDEX "block_path_id_idx" ON "block"("path_id");

-- CreateIndex
CREATE INDEX "block_type_idx" ON "block"("type");

-- CreateIndex
CREATE INDEX "folder_workspace_id_idx" ON "folder"("workspace_id");

-- CreateIndex
CREATE INDEX "folder_parent_id_idx" ON "folder"("parent_id");

-- CreateIndex
CREATE INDEX "folder_path_idx" ON "folder"("path");

-- CreateIndex
CREATE INDEX "path_workflow_id_idx" ON "path"("workflow_id");

-- CreateIndex
CREATE INDEX "workflow_workspace_id_idx" ON "workflow"("workspace_id");

-- CreateIndex
CREATE INDEX "workflow_folder_id_idx" ON "workflow"("folder_id");

-- AddForeignKey
ALTER TABLE "billing" ADD CONSTRAINT "billing_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "path_parent_block" ADD CONSTRAINT "path_parent_block_path_id_fkey" FOREIGN KEY ("path_id") REFERENCES "path"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "path_parent_block" ADD CONSTRAINT "path_parent_block_block_id_fkey" FOREIGN KEY ("block_id") REFERENCES "block"("id") ON DELETE CASCADE ON UPDATE CASCADE;
