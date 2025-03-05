-- CreateEnum
CREATE TYPE "delay_type" AS ENUM ('FIXED_DURATION', 'WAIT_FOR_EVENT');

-- CreateEnum
CREATE TYPE "workflow_status" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- AlterTable
ALTER TABLE "block" ADD COLUMN     "delay_event" TEXT,
ADD COLUMN     "delay_type" "delay_type";

-- AlterTable
ALTER TABLE "workflow" ADD COLUMN     "is_template" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "status" "workflow_status" NOT NULL DEFAULT 'DRAFT',
ADD COLUMN     "template_id" INTEGER,
ADD COLUMN     "version_number" INTEGER NOT NULL DEFAULT 1;

-- CreateTable
CREATE TABLE "workflow_version" (
    "id" SERIAL NOT NULL,
    "workflow_id" INTEGER NOT NULL,
    "version_number" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by_id" INTEGER NOT NULL,
    "change_summary" TEXT,
    "snapshot" JSONB NOT NULL,

    CONSTRAINT "workflow_version_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workflow_template" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "workspace_id" INTEGER NOT NULL,
    "category" TEXT NOT NULL,
    "tags" TEXT[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "structure" JSONB NOT NULL,
    "rating" DOUBLE PRECISION,
    "rating_count" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "workflow_template_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "saved_search" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "query" TEXT NOT NULL,
    "filters" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "saved_search_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stroke_line" (
    "id" SERIAL NOT NULL,
    "source_block_id" INTEGER NOT NULL,
    "target_block_id" INTEGER NOT NULL,
    "workflow_id" INTEGER NOT NULL,
    "label" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "is_loop" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "stroke_line_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "workflow_version_workflow_id_idx" ON "workflow_version"("workflow_id");

-- CreateIndex
CREATE INDEX "workflow_version_created_by_id_idx" ON "workflow_version"("created_by_id");

-- CreateIndex
CREATE UNIQUE INDEX "workflow_version_workflow_id_version_number_key" ON "workflow_version"("workflow_id", "version_number");

-- CreateIndex
CREATE INDEX "workflow_template_workspace_id_idx" ON "workflow_template"("workspace_id");

-- CreateIndex
CREATE INDEX "workflow_template_category_idx" ON "workflow_template"("category");

-- CreateIndex
CREATE INDEX "saved_search_user_id_idx" ON "saved_search"("user_id");

-- CreateIndex
CREATE INDEX "stroke_line_source_block_id_idx" ON "stroke_line"("source_block_id");

-- CreateIndex
CREATE INDEX "stroke_line_target_block_id_idx" ON "stroke_line"("target_block_id");

-- CreateIndex
CREATE INDEX "stroke_line_workflow_id_idx" ON "stroke_line"("workflow_id");

-- AddForeignKey
ALTER TABLE "workflow" ADD CONSTRAINT "workflow_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "workflow_template"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workflow_version" ADD CONSTRAINT "workflow_version_workflow_id_fkey" FOREIGN KEY ("workflow_id") REFERENCES "workflow"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workflow_version" ADD CONSTRAINT "workflow_version_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workflow_template" ADD CONSTRAINT "workflow_template_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "saved_search" ADD CONSTRAINT "saved_search_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stroke_line" ADD CONSTRAINT "stroke_line_source_block_id_fkey" FOREIGN KEY ("source_block_id") REFERENCES "block"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stroke_line" ADD CONSTRAINT "stroke_line_target_block_id_fkey" FOREIGN KEY ("target_block_id") REFERENCES "block"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stroke_line" ADD CONSTRAINT "stroke_line_workflow_id_fkey" FOREIGN KEY ("workflow_id") REFERENCES "workflow"("id") ON DELETE CASCADE ON UPDATE CASCADE;
