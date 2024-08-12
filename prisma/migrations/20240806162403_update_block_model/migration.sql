/*
  Warnings:

  - Changed the type of `type` on the `Block` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "BlockType" AS ENUM ('DELAY', 'STEP', 'PATH');

-- AlterTable
ALTER TABLE "Block" DROP COLUMN "type",
ADD COLUMN     "type" "BlockType" NOT NULL;

-- CreateTable
CREATE TABLE "DelayBlock" (
    "id" SERIAL NOT NULL,
    "blockId" INTEGER NOT NULL,
    "delay" INTEGER NOT NULL,

    CONSTRAINT "DelayBlock_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StepBlock" (
    "id" SERIAL NOT NULL,
    "blockId" INTEGER NOT NULL,
    "stepDetails" TEXT NOT NULL,

    CONSTRAINT "StepBlock_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PathBlock" (
    "id" SERIAL NOT NULL,
    "blockId" INTEGER NOT NULL,
    "pathOptions" TEXT[],

    CONSTRAINT "PathBlock_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DelayBlock_blockId_key" ON "DelayBlock"("blockId");

-- CreateIndex
CREATE UNIQUE INDEX "StepBlock_blockId_key" ON "StepBlock"("blockId");

-- CreateIndex
CREATE UNIQUE INDEX "PathBlock_blockId_key" ON "PathBlock"("blockId");

-- AddForeignKey
ALTER TABLE "DelayBlock" ADD CONSTRAINT "DelayBlock_blockId_fkey" FOREIGN KEY ("blockId") REFERENCES "Block"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StepBlock" ADD CONSTRAINT "StepBlock_blockId_fkey" FOREIGN KEY ("blockId") REFERENCES "Block"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PathBlock" ADD CONSTRAINT "PathBlock_blockId_fkey" FOREIGN KEY ("blockId") REFERENCES "Block"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
