-- CreateIndex
CREATE INDEX "action_user_id_workflow_id_idx" ON "action"("user_id", "workflow_id");

-- CreateIndex
CREATE INDEX "action_target_id_type_idx" ON "action"("target_id", "type");

-- CreateIndex
CREATE INDEX "block_workflow_id_path_id_idx" ON "block"("workflow_id", "path_id");

-- CreateIndex
CREATE INDEX "block_path_id_position_idx" ON "block"("path_id", "position");

-- CreateIndex
CREATE INDEX "block_type_workflow_id_idx" ON "block"("type", "workflow_id");

-- CreateIndex
CREATE INDEX "folder_workspace_id_parent_id_idx" ON "folder"("workspace_id", "parent_id");

-- CreateIndex
CREATE INDEX "path_workflow_id_idx" ON "path"("workflow_id");

-- CreateIndex
CREATE INDEX "path_path_block_id_workflow_id_idx" ON "path"("path_block_id", "workflow_id");

-- CreateIndex
CREATE INDEX "workflow_folder_id_last_opened_idx" ON "workflow"("folder_id", "last_opened");
