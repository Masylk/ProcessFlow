/*
  Warnings:

  - You are about to drop the column `notes` on the `workflow` table. All the data in the column will be lost.
  - You are about to drop the column `owner` on the `workflow` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "workflow" DROP COLUMN "notes",
DROP COLUMN "owner",
ADD COLUMN     "additional_notes" TEXT,
ADD COLUMN     "process_owner" TEXT;
