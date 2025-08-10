/*
  Warnings:

  - The values [PUBLISHED] on the enum `workflow_status` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "workflow_status_new" AS ENUM ('DRAFT', 'ACTIVE', 'IN_REVIEW', 'NEEDS_UPDATE', 'ARCHIVED');
ALTER TABLE "workflow" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "workflow" ALTER COLUMN "status" TYPE "workflow_status_new" USING ("status"::text::"workflow_status_new");
ALTER TYPE "workflow_status" RENAME TO "workflow_status_old";
ALTER TYPE "workflow_status_new" RENAME TO "workflow_status";
DROP TYPE "workflow_status_old";
ALTER TABLE "workflow" ALTER COLUMN "status" SET DEFAULT 'DRAFT';
COMMIT;
