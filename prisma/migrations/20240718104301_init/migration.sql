/*
  Warnings:

  - You are about to drop the column `authorId` on the `Workflow` table. All the data in the column will be lost.
  - You are about to drop the `_ContributorWorkflows` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[name,workspaceId]` on the table `Workflow` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `role` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `domain` to the `Workflow` table without a default value. This is not possible if the table is not empty.
  - Added the required column `workspaceId` to the `Workflow` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Workflow" DROP CONSTRAINT "Workflow_authorId_fkey";

-- DropForeignKey
ALTER TABLE "_ContributorWorkflows" DROP CONSTRAINT "_ContributorWorkflows_A_fkey";

-- DropForeignKey
ALTER TABLE "_ContributorWorkflows" DROP CONSTRAINT "_ContributorWorkflows_B_fkey";

-- DropIndex
DROP INDEX "Workflow_name_authorId_key";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "domains" TEXT[],
ADD COLUMN     "role" TEXT NOT NULL,
ADD COLUMN     "teamId" INTEGER;

-- AlterTable
ALTER TABLE "Workflow" DROP COLUMN "authorId",
ADD COLUMN     "domain" TEXT NOT NULL,
ADD COLUMN     "workspaceId" INTEGER NOT NULL;

-- DropTable
DROP TABLE "_ContributorWorkflows";

-- CreateTable
CREATE TABLE "Team" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Team_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Workspace" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "teamId" INTEGER NOT NULL,

    CONSTRAINT "Workspace_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Workflow_name_workspaceId_key" ON "Workflow"("name", "workspaceId");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Workflow" ADD CONSTRAINT "Workflow_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Workspace" ADD CONSTRAINT "Workspace_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
