/*
  Warnings:

  - You are about to drop the column `team_tags` on the `folder` table. All the data in the column will be lost.
  - You are about to drop the column `is_loop` on the `stroke_line` table. All the data in the column will be lost.
  - You are about to drop the column `is_template` on the `workflow` table. All the data in the column will be lost.
  - You are about to drop the column `team_tags` on the `workflow` table. All the data in the column will be lost.
  - You are about to drop the column `template_id` on the `workflow` table. All the data in the column will be lost.
  - You are about to drop the column `version_number` on the `workflow` table. All the data in the column will be lost.
  - You are about to drop the column `team_tags` on the `workspace` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "folder" DROP COLUMN "team_tags";

-- AlterTable
ALTER TABLE "stroke_line" DROP COLUMN "is_loop";

-- AlterTable
ALTER TABLE "workflow" DROP COLUMN "is_template",
DROP COLUMN "team_tags",
DROP COLUMN "template_id",
DROP COLUMN "version_number";

-- AlterTable
ALTER TABLE "workspace" DROP COLUMN "team_tags";
