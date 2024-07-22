/*
  Warnings:

  - You are about to drop the column `domains` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `domain` on the `Workflow` table. All the data in the column will be lost.
  - Added the required column `pole` to the `Workspace` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "domains",
ADD COLUMN     "poles" TEXT[];

-- AlterTable
ALTER TABLE "Workflow" DROP COLUMN "domain";

-- AlterTable
ALTER TABLE "Workspace" ADD COLUMN     "pole" TEXT NOT NULL;
