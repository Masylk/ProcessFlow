-- DropForeignKey
ALTER TABLE "block" DROP CONSTRAINT "block_path_id_fkey";

-- DropForeignKey
ALTER TABLE "block" DROP CONSTRAINT "block_workflow_id_fkey";

-- DropForeignKey
ALTER TABLE "delay_block" DROP CONSTRAINT "delay_block_block_id_fkey";

-- DropForeignKey
ALTER TABLE "path" DROP CONSTRAINT "path_path_block_id_fkey";

-- DropForeignKey
ALTER TABLE "path_block" DROP CONSTRAINT "path_block_block_id_fkey";

-- DropForeignKey
ALTER TABLE "step_block" DROP CONSTRAINT "step_block_block_id_fkey";

-- AddForeignKey
ALTER TABLE "path" ADD CONSTRAINT "path_path_block_id_fkey" FOREIGN KEY ("path_block_id") REFERENCES "path_block"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "block" ADD CONSTRAINT "block_workflow_id_fkey" FOREIGN KEY ("workflow_id") REFERENCES "workflow"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "block" ADD CONSTRAINT "block_path_id_fkey" FOREIGN KEY ("path_id") REFERENCES "path"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "step_block" ADD CONSTRAINT "step_block_block_id_fkey" FOREIGN KEY ("block_id") REFERENCES "block"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "path_block" ADD CONSTRAINT "path_block_block_id_fkey" FOREIGN KEY ("block_id") REFERENCES "block"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "delay_block" ADD CONSTRAINT "delay_block_block_id_fkey" FOREIGN KEY ("block_id") REFERENCES "block"("id") ON DELETE CASCADE ON UPDATE CASCADE;
