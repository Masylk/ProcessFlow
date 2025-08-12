-- DropForeignKey
ALTER TABLE "user_workspace" DROP CONSTRAINT "user_workspace_user_id_fkey";

-- DropForeignKey
ALTER TABLE "user_workspace" DROP CONSTRAINT "user_workspace_workspace_id_fkey";

-- DropForeignKey
ALTER TABLE "workflow" DROP CONSTRAINT "workflow_workspace_id_fkey";

-- AlterTable
ALTER TABLE "workflow" ALTER COLUMN "is_public" SET DEFAULT true;

-- AddForeignKey
ALTER TABLE "user_workspace" ADD CONSTRAINT "user_workspace_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_workspace" ADD CONSTRAINT "user_workspace_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workflow" ADD CONSTRAINT "workflow_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;
