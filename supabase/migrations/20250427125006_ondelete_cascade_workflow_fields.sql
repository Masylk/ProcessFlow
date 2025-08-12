-- DropForeignKey
ALTER TABLE "action" DROP CONSTRAINT "action_workflow_id_fkey";

-- AddForeignKey
ALTER TABLE "action" ADD CONSTRAINT "action_workflow_id_fkey" FOREIGN KEY ("workflow_id") REFERENCES "workflow"("id") ON DELETE CASCADE ON UPDATE CASCADE;
