-- CreateTable
CREATE TABLE "ai_conversations" (
    "id" SERIAL NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "user_id" INTEGER NOT NULL,
    "workflow_id" INTEGER,
    "conversation_id" TEXT NOT NULL,
    "messages" JSONB NOT NULL,

    CONSTRAINT "ai_conversations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_embeddings" (
    "id" SERIAL NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "content_type" TEXT NOT NULL,
    "content_id" TEXT NOT NULL,
    "content_text" TEXT NOT NULL,
    "embedding_id" TEXT NOT NULL,
    "workspace_id" INTEGER NOT NULL,

    CONSTRAINT "ai_embeddings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ai_conversations_conversation_id_key" ON "ai_conversations"("conversation_id");

-- CreateIndex
CREATE INDEX "ai_conversations_user_id_idx" ON "ai_conversations"("user_id");

-- CreateIndex
CREATE INDEX "ai_conversations_workflow_id_idx" ON "ai_conversations"("workflow_id");

-- CreateIndex
CREATE INDEX "ai_embeddings_workspace_id_idx" ON "ai_embeddings"("workspace_id");

-- CreateIndex
CREATE INDEX "ai_embeddings_content_type_content_id_idx" ON "ai_embeddings"("content_type", "content_id");

-- AddForeignKey
ALTER TABLE "ai_conversations" ADD CONSTRAINT "ai_conversations_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_conversations" ADD CONSTRAINT "ai_conversations_workflow_id_fkey" FOREIGN KEY ("workflow_id") REFERENCES "workflow"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_embeddings" ADD CONSTRAINT "ai_embeddings_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
