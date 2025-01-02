/*
  Warnings:

  - You are about to drop the `DelayBlock` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "DelayBlock" DROP CONSTRAINT "DelayBlock_blockId_fkey";

-- AlterTable
ALTER TABLE "Block" ADD COLUMN     "delay" INTEGER;

-- DropTable
DROP TABLE "DelayBlock";
