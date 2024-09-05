-- DropForeignKey
ALTER TABLE "Path" DROP CONSTRAINT "Path_pathBlockId_fkey";

-- AlterTable
ALTER TABLE "Path" ALTER COLUMN "pathBlockId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Path" ADD CONSTRAINT "Path_pathBlockId_fkey" FOREIGN KEY ("pathBlockId") REFERENCES "PathBlock"("id") ON DELETE SET NULL ON UPDATE CASCADE;
