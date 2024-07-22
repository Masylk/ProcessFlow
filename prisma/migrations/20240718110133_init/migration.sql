/*
  Warnings:

  - You are about to drop the column `domains` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `domain` on the `Workflow` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "domains";

-- AlterTable
ALTER TABLE "Workflow" DROP COLUMN "domain";
