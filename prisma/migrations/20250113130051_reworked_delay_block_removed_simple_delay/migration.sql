/*
  Warnings:

  - You are about to drop the column `delay` on the `Block` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Block" DROP COLUMN "delay";

-- CreateTable
CREATE TABLE "DelayBlock" (
    "id" SERIAL NOT NULL,
    "blockId" INTEGER NOT NULL,
    "seconds" INTEGER NOT NULL,

    CONSTRAINT "DelayBlock_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DelayBlock_blockId_key" ON "DelayBlock"("blockId");

-- AddForeignKey
ALTER TABLE "DelayBlock" ADD CONSTRAINT "DelayBlock_blockId_fkey" FOREIGN KEY ("blockId") REFERENCES "Block"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
