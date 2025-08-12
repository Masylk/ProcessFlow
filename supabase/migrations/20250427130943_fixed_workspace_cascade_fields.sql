-- DropForeignKey
ALTER TABLE "ai_embeddings" DROP CONSTRAINT "ai_embeddings_workspace_id_fkey";

-- DropForeignKey
ALTER TABLE "billing" DROP CONSTRAINT "billing_workspace_id_fkey";

-- DropForeignKey
ALTER TABLE "folder" DROP CONSTRAINT "folder_workspace_id_fkey";

-- DropForeignKey
ALTER TABLE "invitation" DROP CONSTRAINT "invitation_workspace_id_fkey";

-- DropForeignKey
ALTER TABLE "workflow_template" DROP CONSTRAINT "workflow_template_workspace_id_fkey";

-- DropForeignKey
ALTER TABLE "workspace_billing_infos" DROP CONSTRAINT "workspace_billing_infos_workspace_id_fkey";

-- AddForeignKey
ALTER TABLE "workspace_billing_infos" ADD CONSTRAINT "workspace_billing_infos_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "billing" ADD CONSTRAINT "billing_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invitation" ADD CONSTRAINT "invitation_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "folder" ADD CONSTRAINT "folder_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workflow_template" ADD CONSTRAINT "workflow_template_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_embeddings" ADD CONSTRAINT "ai_embeddings_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;
