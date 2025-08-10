-- DropIndex
DROP INDEX "unique_pending_email_per_user_type_where";

-- AlterTable
ALTER TABLE "folder" ADD COLUMN     "position" INTEGER NOT NULL DEFAULT 0;
