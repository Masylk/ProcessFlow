/*
  Warnings:

  - A unique constraint covering the columns `[stripe_subscription_id]` on the table `subscription` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[stripe_customer_id]` on the table `workspace` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[workspace_id]` on the table `workspace_billing_infos` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "subscription_stripe_subscription_id_key" ON "subscription"("stripe_subscription_id");

-- CreateIndex
CREATE UNIQUE INDEX "workspace_stripe_customer_id_key" ON "workspace"("stripe_customer_id");

-- CreateIndex
CREATE UNIQUE INDEX "workspace_billing_infos_workspace_id_key" ON "workspace_billing_infos"("workspace_id");
