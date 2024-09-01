/*
  Warnings:

  - You are about to drop the `PathBlockPath` table. If the table is not empty, all the data it contains will be lost.
  - Made the column `pathId` on table `Block` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `pathBlockId` to the `Path` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Block" DROP CONSTRAINT "Block_pathId_fkey";

-- DropForeignKey
ALTER TABLE "PathBlockPath" DROP CONSTRAINT "PathBlockPath_pathBlockId_fkey";

-- DropForeignKey
ALTER TABLE "PathBlockPath" DROP CONSTRAINT "PathBlockPath_pathId_fkey";

-- AlterTable
ALTER TABLE "Block" ALTER COLUMN "pathId" SET NOT NULL;

-- AlterTable
ALTER TABLE "Path" ADD COLUMN     "pathBlockId" INTEGER NOT NULL;

-- DropTable
DROP TABLE "PathBlockPath";

-- AddForeignKey
ALTER TABLE "Path" ADD CONSTRAINT "Path_pathBlockId_fkey" FOREIGN KEY ("pathBlockId") REFERENCES "PathBlock"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Block" ADD CONSTRAINT "Block_pathId_fkey" FOREIGN KEY ("pathId") REFERENCES "Path"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
