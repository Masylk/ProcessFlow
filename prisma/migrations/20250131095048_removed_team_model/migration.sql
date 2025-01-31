-- CreateEnum
CREATE TYPE "role" AS ENUM ('ADMIN', 'EDITOR', 'READER');

-- CreateEnum
CREATE TYPE "block_type" AS ENUM ('DELAY', 'STEP', 'PATH');

-- CreateEnum
CREATE TYPE "task_type" AS ENUM ('MANUAL', 'AUTOMATIC');

-- CreateTable
CREATE TABLE "user" (
    "id" SERIAL NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "full_name" TEXT NOT NULL,
    "team_tags" TEXT[],
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workspace" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "team_tags" TEXT[],

    CONSTRAINT "workspace_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_workspace" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "workspace_id" INTEGER NOT NULL,
    "role" "role" NOT NULL,

    CONSTRAINT "user_workspace_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "folder" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "workspace_id" INTEGER NOT NULL,
    "parent_id" INTEGER,
    "team_tags" TEXT[],

    CONSTRAINT "folder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workflow" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "workspace_id" INTEGER NOT NULL,
    "team_tags" TEXT[],
    "folderId" INTEGER,

    CONSTRAINT "workflow_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "path" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "path_block_id" INTEGER,
    "workflow_id" INTEGER NOT NULL,

    CONSTRAINT "path_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "block" (
    "id" SERIAL NOT NULL,
    "type" "block_type" NOT NULL,
    "position" INTEGER NOT NULL,
    "title" TEXT,
    "icon" TEXT,
    "description" TEXT,
    "image" TEXT,
    "image_description" TEXT,
    "last_modified" TIMESTAMP(3),
    "average_time" TEXT,
    "task_type" "task_type",
    "workflow_id" INTEGER NOT NULL,
    "path_id" INTEGER NOT NULL,
    "click_position" JSONB,

    CONSTRAINT "block_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "path_block" (
    "id" SERIAL NOT NULL,
    "block_id" INTEGER NOT NULL,

    CONSTRAINT "path_block_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "delay_block" (
    "id" SERIAL NOT NULL,
    "block_id" INTEGER NOT NULL,
    "seconds" INTEGER NOT NULL,

    CONSTRAINT "delay_block_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "step_block" (
    "id" SERIAL NOT NULL,
    "block_id" INTEGER NOT NULL,
    "step_details" TEXT NOT NULL,

    CONSTRAINT "step_block_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "action" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "target_id" INTEGER NOT NULL,
    "workflow_id" INTEGER NOT NULL,
    "value" INTEGER NOT NULL,

    CONSTRAINT "action_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");

-- CreateIndex
CREATE UNIQUE INDEX "user_workspace_user_id_workspace_id_key" ON "user_workspace"("user_id", "workspace_id");

-- CreateIndex
CREATE UNIQUE INDEX "workflow_name_workspace_id_key" ON "workflow"("name", "workspace_id");

-- CreateIndex
CREATE UNIQUE INDEX "path_block_block_id_key" ON "path_block"("block_id");

-- CreateIndex
CREATE UNIQUE INDEX "delay_block_block_id_key" ON "delay_block"("block_id");

-- CreateIndex
CREATE UNIQUE INDEX "step_block_block_id_key" ON "step_block"("block_id");

-- AddForeignKey
ALTER TABLE "user_workspace" ADD CONSTRAINT "user_workspace_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_workspace" ADD CONSTRAINT "user_workspace_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "folder" ADD CONSTRAINT "folder_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "folder" ADD CONSTRAINT "folder_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "folder"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workflow" ADD CONSTRAINT "workflow_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workflow" ADD CONSTRAINT "workflow_folderId_fkey" FOREIGN KEY ("folderId") REFERENCES "folder"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "path" ADD CONSTRAINT "path_path_block_id_fkey" FOREIGN KEY ("path_block_id") REFERENCES "path_block"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "path" ADD CONSTRAINT "path_workflow_id_fkey" FOREIGN KEY ("workflow_id") REFERENCES "workflow"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "block" ADD CONSTRAINT "block_workflow_id_fkey" FOREIGN KEY ("workflow_id") REFERENCES "workflow"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "block" ADD CONSTRAINT "block_path_id_fkey" FOREIGN KEY ("path_id") REFERENCES "path"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "path_block" ADD CONSTRAINT "path_block_block_id_fkey" FOREIGN KEY ("block_id") REFERENCES "block"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "delay_block" ADD CONSTRAINT "delay_block_block_id_fkey" FOREIGN KEY ("block_id") REFERENCES "block"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "step_block" ADD CONSTRAINT "step_block_block_id_fkey" FOREIGN KEY ("block_id") REFERENCES "block"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "action" ADD CONSTRAINT "action_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "action" ADD CONSTRAINT "action_target_id_fkey" FOREIGN KEY ("target_id") REFERENCES "block"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "action" ADD CONSTRAINT "action_workflow_id_fkey" FOREIGN KEY ("workflow_id") REFERENCES "workflow"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
