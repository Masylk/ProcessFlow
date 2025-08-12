/*
  Warnings:

  - You are about to drop the column `owner` on the `block` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "block" DROP COLUMN "owner",
ADD COLUMN     "assignee" TEXT;
