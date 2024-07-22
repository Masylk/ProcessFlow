/*
  Warnings:

  - You are about to drop the column `poles` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `role` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `pole` on the `Workspace` table. All the data in the column will be lost.
  - You are about to drop the `_UserTeams` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `domain` to the `Workflow` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "_UserTeams" DROP CONSTRAINT "_UserTeams_A_fkey";

-- DropForeignKey
ALTER TABLE "_UserTeams" DROP CONSTRAINT "_UserTeams_B_fkey";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "poles",
DROP COLUMN "role",
ADD COLUMN     "domains" TEXT[];

-- AlterTable
ALTER TABLE "Workflow" ADD COLUMN     "domain" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Workspace" DROP COLUMN "pole";

-- DropTable
DROP TABLE "_UserTeams";

-- CreateTable
CREATE TABLE "UserTeam" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "teamId" INTEGER NOT NULL,
    "role" TEXT NOT NULL,
    "poles" TEXT[],

    CONSTRAINT "UserTeam_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserTeam_userId_teamId_key" ON "UserTeam"("userId", "teamId");

-- AddForeignKey
ALTER TABLE "UserTeam" ADD CONSTRAINT "UserTeam_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserTeam" ADD CONSTRAINT "UserTeam_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
