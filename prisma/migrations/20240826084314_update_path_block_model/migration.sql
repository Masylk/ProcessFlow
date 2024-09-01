/*
  Warnings:

  - You are about to drop the column `pathOptions` on the `PathBlock` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "PathBlock" DROP COLUMN "pathOptions";

-- CreateTable
CREATE TABLE "PathOption" (
    "id" SERIAL NOT NULL,
    "pathOption" TEXT NOT NULL,
    "pathBlockId" INTEGER NOT NULL,

    CONSTRAINT "PathOption_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PathOptionBlock" (
    "id" SERIAL NOT NULL,
    "pathOptionId" INTEGER NOT NULL,
    "blockId" INTEGER NOT NULL,

    CONSTRAINT "PathOptionBlock_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PathOption_pathBlockId_pathOption_key" ON "PathOption"("pathBlockId", "pathOption");

-- CreateIndex
CREATE UNIQUE INDEX "PathOptionBlock_pathOptionId_blockId_key" ON "PathOptionBlock"("pathOptionId", "blockId");

-- AddForeignKey
ALTER TABLE "PathOption" ADD CONSTRAINT "PathOption_pathBlockId_fkey" FOREIGN KEY ("pathBlockId") REFERENCES "PathBlock"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PathOptionBlock" ADD CONSTRAINT "PathOptionBlock_pathOptionId_fkey" FOREIGN KEY ("pathOptionId") REFERENCES "PathOption"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PathOptionBlock" ADD CONSTRAINT "PathOptionBlock_blockId_fkey" FOREIGN KEY ("blockId") REFERENCES "Block"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
