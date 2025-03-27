-- AlterTable
ALTER TABLE "workflow" ADD COLUMN     "author_id" INTEGER,
ADD COLUMN     "icon" TEXT;

-- AddForeignKey
ALTER TABLE "workflow" ADD CONSTRAINT "workflow_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;
