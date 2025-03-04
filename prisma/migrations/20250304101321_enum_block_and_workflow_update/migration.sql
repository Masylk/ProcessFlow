/*
  Warnings:

  - A unique constraint covering the columns `[public_access_id]` on the table `workflow` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterEnum
ALTER TYPE "block_type" ADD VALUE 'LAST';

-- AlterTable
ALTER TABLE "workflow" ADD COLUMN     "is_public" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "public_access_id" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "workflow_public_access_id_key" ON "workflow"("public_access_id");
