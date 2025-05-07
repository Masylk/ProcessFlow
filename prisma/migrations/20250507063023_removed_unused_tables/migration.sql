/*
  Warnings:

  - You are about to drop the column `click_position` on the `block` table. All the data in the column will be lost.
  - You are about to drop the column `last_modified` on the `block` table. All the data in the column will be lost.
  - You are about to drop the column `step_details` on the `block` table. All the data in the column will be lost.
  - You are about to drop the column `phone` on the `user` table. All the data in the column will be lost.
  - You are about to drop the `action` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ai_conversations` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ai_embeddings` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `invitation` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `saved_search` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `workflow_template` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `workflow_version` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "action" DROP CONSTRAINT "action_target_id_fkey";

-- DropForeignKey
ALTER TABLE "action" DROP CONSTRAINT "action_user_id_fkey";

-- DropForeignKey
ALTER TABLE "action" DROP CONSTRAINT "action_workflow_id_fkey";

-- DropForeignKey
ALTER TABLE "ai_conversations" DROP CONSTRAINT "ai_conversations_user_id_fkey";

-- DropForeignKey
ALTER TABLE "ai_conversations" DROP CONSTRAINT "ai_conversations_workflow_id_fkey";

-- DropForeignKey
ALTER TABLE "ai_embeddings" DROP CONSTRAINT "ai_embeddings_workspace_id_fkey";

-- DropForeignKey
ALTER TABLE "invitation" DROP CONSTRAINT "invitation_workspace_id_fkey";

-- DropForeignKey
ALTER TABLE "saved_search" DROP CONSTRAINT "saved_search_user_id_fkey";

-- DropForeignKey
ALTER TABLE "workflow" DROP CONSTRAINT "workflow_template_id_fkey";

-- DropForeignKey
ALTER TABLE "workflow_template" DROP CONSTRAINT "workflow_template_workspace_id_fkey";

-- DropForeignKey
ALTER TABLE "workflow_version" DROP CONSTRAINT "workflow_version_created_by_id_fkey";

-- DropForeignKey
ALTER TABLE "workflow_version" DROP CONSTRAINT "workflow_version_workflow_id_fkey";

-- AlterTable
ALTER TABLE "block" DROP COLUMN "click_position",
DROP COLUMN "last_modified",
DROP COLUMN "step_details";

-- AlterTable
ALTER TABLE "user" DROP COLUMN "phone";

-- DropTable
DROP TABLE "action";

-- DropTable
DROP TABLE "ai_conversations";

-- DropTable
DROP TABLE "ai_embeddings";

-- DropTable
DROP TABLE "invitation";

-- DropTable
DROP TABLE "saved_search";

-- DropTable
DROP TABLE "workflow_template";

-- DropTable
DROP TABLE "workflow_version";
