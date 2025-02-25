-- CreateEnum
CREATE TYPE "OnboardingStep" AS ENUM ('PERSONAL_INFO', 'PROFESSIONAL_INFO', 'WORKSPACE_SETUP', 'COMPLETED');

-- CreateEnum
CREATE TYPE "role" AS ENUM ('ADMIN', 'EDITOR', 'READER');

-- CreateEnum
CREATE TYPE "block_type" AS ENUM ('DELAY', 'STEP', 'PATH');

-- CreateEnum
CREATE TYPE "subscription_status" AS ENUM ('ACTIVE', 'TRIALING', 'CANCELED');

-- CreateEnum
CREATE TYPE "plan_type" AS ENUM ('FREE', 'STARTER', 'PROFESSIONAL', 'ENTERPRISE');

-- CreateEnum
CREATE TYPE "task_type" AS ENUM ('MANUAL', 'AUTOMATIC');

-- CreateTable
CREATE TABLE "user" (
    "id" SERIAL NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "archived_at" TIMESTAMP(3),
    "auth_id" TEXT NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "full_name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "avatar_url" TEXT,
    "active_workspace_id" INTEGER,
    "hubspot_contact_id" TEXT,
    "sentry_id" TEXT,
    "post_hog_id" TEXT,
    "phone" TEXT,
    "last_login_at" TIMESTAMP(3),
    "onboarding_step" "OnboardingStep" DEFAULT 'PERSONAL_INFO',
    "onboarding_completed_at" TIMESTAMP(3),

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workspace" (
    "id" SERIAL NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "archived_at" TIMESTAMP(3),
    "name" TEXT NOT NULL,
    "slug" TEXT,
    "team_tags" TEXT[],
    "icon_url" TEXT,
    "background_colour" TEXT,
    "linear_customer_id" TEXT,
    "stripe_customer_id" TEXT,
    "hubspot_company_id" TEXT,
    "subscription_id" INTEGER,

    CONSTRAINT "workspace_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workspace_billing_infos" (
    "id" SERIAL NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "billing_email" TEXT NOT NULL,
    "billing_address" TEXT NOT NULL,
    "tax_rate" DECIMAL(5,2) NOT NULL,
    "vat_number" TEXT,
    "workspace_id" INTEGER NOT NULL,

    CONSTRAINT "workspace_billing_infos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subscription" (
    "id" SERIAL NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "canceled_at" TIMESTAMP(3),
    "workspace_id" INTEGER NOT NULL,
    "stripe_subscription_id" TEXT NOT NULL,
    "trial_end_date" TIMESTAMP(3),
    "plan_type" "plan_type" NOT NULL,
    "quantity_seats" INTEGER NOT NULL,
    "current_period_start" TIMESTAMP(3) NOT NULL,
    "current_period_end" TIMESTAMP(3) NOT NULL,
    "status" "subscription_status" NOT NULL,

    CONSTRAINT "subscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "billing" (
    "id" SERIAL NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "paid_at" TIMESTAMP(3),
    "subscription_id" INTEGER NOT NULL,
    "stripe_invoice_id" TEXT NOT NULL,
    "amount_net" INTEGER NOT NULL,
    "tax_amount" INTEGER NOT NULL,
    "amount_gross" INTEGER NOT NULL,
    "currency" VARCHAR(3) NOT NULL,
    "invoice_date" TIMESTAMP(3) NOT NULL,
    "due_date" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "billing_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_workspace" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "workspace_id" INTEGER NOT NULL,
    "role" "role" NOT NULL DEFAULT 'ADMIN',

    CONSTRAINT "user_workspace_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "folder" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "workspace_id" INTEGER NOT NULL,
    "parent_id" INTEGER,
    "icon_url" TEXT,
    "emote" TEXT,
    "team_tags" TEXT[],

    CONSTRAINT "folder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workflow" (
    "id" SERIAL NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_opened" TIMESTAMP(3),
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "workspace_id" INTEGER NOT NULL,
    "team_tags" TEXT[],
    "folder_id" INTEGER,

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
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_modified" TIMESTAMP(3),
    "type" "block_type" NOT NULL,
    "position" INTEGER NOT NULL,
    "title" TEXT,
    "icon" TEXT,
    "description" TEXT,
    "image" TEXT,
    "image_description" TEXT,
    "average_time" TEXT,
    "task_type" "task_type",
    "workflow_id" INTEGER NOT NULL,
    "path_id" INTEGER NOT NULL,
    "click_position" JSONB,

    CONSTRAINT "block_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "step_block" (
    "id" SERIAL NOT NULL,
    "block_id" INTEGER NOT NULL,
    "step_details" TEXT NOT NULL,

    CONSTRAINT "step_block_pkey" PRIMARY KEY ("id")
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
CREATE UNIQUE INDEX "user_auth_id_key" ON "user"("auth_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");

-- CreateIndex
CREATE INDEX "user_active_workspace_id_idx" ON "user"("active_workspace_id");

-- CreateIndex
CREATE INDEX "user_email_idx" ON "user"("email");

-- CreateIndex
CREATE INDEX "user_auth_id_idx" ON "user"("auth_id");

-- CreateIndex
CREATE INDEX "auth_id_cover_idx" ON "user"("auth_id");

-- CreateIndex
CREATE UNIQUE INDEX "workspace_slug_key" ON "workspace"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "workspace_subscription_id_key" ON "workspace"("subscription_id");

-- CreateIndex
CREATE INDEX "workspace_stripe_customer_id_idx" ON "workspace"("stripe_customer_id");

-- CreateIndex
CREATE INDEX "workspace_subscription_id_idx" ON "workspace"("subscription_id");

-- CreateIndex
CREATE INDEX "workspace_billing_infos_workspace_id_idx" ON "workspace_billing_infos"("workspace_id");

-- CreateIndex
CREATE UNIQUE INDEX "subscription_workspace_id_key" ON "subscription"("workspace_id");

-- CreateIndex
CREATE UNIQUE INDEX "billing_stripe_invoice_id_key" ON "billing"("stripe_invoice_id");

-- CreateIndex
CREATE INDEX "billing_subscription_id_idx" ON "billing"("subscription_id");

-- CreateIndex
CREATE INDEX "billing_stripe_invoice_id_idx" ON "billing"("stripe_invoice_id");

-- CreateIndex
CREATE INDEX "user_workspace_composite_idx" ON "user_workspace"("user_id", "workspace_id");

-- CreateIndex
CREATE INDEX "user_workspace_user_id_idx" ON "user_workspace"("user_id");

-- CreateIndex
CREATE INDEX "user_workspace_workspace_id_idx" ON "user_workspace"("workspace_id");

-- CreateIndex
CREATE UNIQUE INDEX "workflow_name_workspace_id_key" ON "workflow"("name", "workspace_id");

-- CreateIndex
CREATE UNIQUE INDEX "step_block_block_id_key" ON "step_block"("block_id");

-- CreateIndex
CREATE UNIQUE INDEX "path_block_block_id_key" ON "path_block"("block_id");

-- CreateIndex
CREATE UNIQUE INDEX "delay_block_block_id_key" ON "delay_block"("block_id");

-- AddForeignKey
ALTER TABLE "user" ADD CONSTRAINT "user_active_workspace_id_fkey" FOREIGN KEY ("active_workspace_id") REFERENCES "workspace"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workspace" ADD CONSTRAINT "workspace_subscription_id_fkey" FOREIGN KEY ("subscription_id") REFERENCES "subscription"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workspace_billing_infos" ADD CONSTRAINT "workspace_billing_infos_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "billing" ADD CONSTRAINT "billing_subscription_id_fkey" FOREIGN KEY ("subscription_id") REFERENCES "subscription"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

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
ALTER TABLE "workflow" ADD CONSTRAINT "workflow_folder_id_fkey" FOREIGN KEY ("folder_id") REFERENCES "folder"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "path" ADD CONSTRAINT "path_path_block_id_fkey" FOREIGN KEY ("path_block_id") REFERENCES "path_block"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "path" ADD CONSTRAINT "path_workflow_id_fkey" FOREIGN KEY ("workflow_id") REFERENCES "workflow"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

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

-- AddForeignKey
ALTER TABLE "action" ADD CONSTRAINT "action_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "action" ADD CONSTRAINT "action_target_id_fkey" FOREIGN KEY ("target_id") REFERENCES "block"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "action" ADD CONSTRAINT "action_workflow_id_fkey" FOREIGN KEY ("workflow_id") REFERENCES "workflow"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
