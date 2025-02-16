/*
  Warnings:

  - You are about to alter the column `amount_net` on the `billing` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Integer`.
  - You are about to alter the column `tax_amount` on the `billing` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Integer`.
  - You are about to alter the column `amount_gross` on the `billing` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Integer`.
  - You are about to alter the column `currency` on the `billing` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(3)`.
  - You are about to alter the column `tax_rate` on the `workspace_billing_infos` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(5,2)`.
  - A unique constraint covering the columns `[stripe_invoice_id]` on the table `billing` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "billing" ALTER COLUMN "amount_net" SET DATA TYPE INTEGER,
ALTER COLUMN "tax_amount" SET DATA TYPE INTEGER,
ALTER COLUMN "amount_gross" SET DATA TYPE INTEGER,
ALTER COLUMN "currency" SET DATA TYPE VARCHAR(3);

-- AlterTable
ALTER TABLE "user_workspace" ALTER COLUMN "role" SET DEFAULT 'ADMIN';

-- AlterTable
ALTER TABLE "workspace_billing_infos" ALTER COLUMN "tax_rate" SET DATA TYPE DECIMAL(5,2);

-- CreateIndex
CREATE UNIQUE INDEX "billing_stripe_invoice_id_key" ON "billing"("stripe_invoice_id");

-- CreateIndex
CREATE INDEX "billing_subscription_id_idx" ON "billing"("subscription_id");

-- CreateIndex
CREATE INDEX "billing_stripe_invoice_id_idx" ON "billing"("stripe_invoice_id");

-- CreateIndex
CREATE INDEX "user_workspace_user_id_idx" ON "user_workspace"("user_id");

-- CreateIndex
CREATE INDEX "user_workspace_workspace_id_idx" ON "user_workspace"("workspace_id");

-- CreateIndex
CREATE INDEX "workspace_billing_infos_workspace_id_idx" ON "workspace_billing_infos"("workspace_id");
