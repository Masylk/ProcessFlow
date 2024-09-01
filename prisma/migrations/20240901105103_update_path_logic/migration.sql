/*
  Warnings:

  - You are about to drop the `PathOption` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PathOptionBlock` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "PathOption" DROP CONSTRAINT "PathOption_pathBlockId_fkey";

-- DropForeignKey
ALTER TABLE "PathOptionBlock" DROP CONSTRAINT "PathOptionBlock_blockId_fkey";

-- DropForeignKey
ALTER TABLE "PathOptionBlock" DROP CONSTRAINT "PathOptionBlock_pathOptionId_fkey";

-- AlterTable
ALTER TABLE "Block" ADD COLUMN     "pathId" INTEGER;

-- DropTable
DROP TABLE "PathOption";

-- DropTable
DROP TABLE "PathOptionBlock";

-- CreateTable
CREATE TABLE "Path" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Path_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PathBlockPath" (
    "id" SERIAL NOT NULL,
    "pathBlockId" INTEGER NOT NULL,
    "pathId" INTEGER NOT NULL,

    CONSTRAINT "PathBlockPath_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PathBlockPath_pathBlockId_pathId_key" ON "PathBlockPath"("pathBlockId", "pathId");

-- AddForeignKey
ALTER TABLE "Block" ADD CONSTRAINT "Block_pathId_fkey" FOREIGN KEY ("pathId") REFERENCES "Path"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PathBlockPath" ADD CONSTRAINT "PathBlockPath_pathBlockId_fkey" FOREIGN KEY ("pathBlockId") REFERENCES "PathBlock"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PathBlockPath" ADD CONSTRAINT "PathBlockPath_pathId_fkey" FOREIGN KEY ("pathId") REFERENCES "Path"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
