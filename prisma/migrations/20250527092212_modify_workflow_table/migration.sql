-- AlterTable
ALTER TABLE "workflow" ADD COLUMN     "notes" TEXT,
ADD COLUMN     "owner" TEXT,
ADD COLUMN     "review_date" TIMESTAMP(3);
