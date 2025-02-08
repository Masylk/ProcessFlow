/*
  Warnings:

  - You are about to drop the column `Emote` on the `folder` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "folder" DROP COLUMN "Emote",
ADD COLUMN     "emote" TEXT;
