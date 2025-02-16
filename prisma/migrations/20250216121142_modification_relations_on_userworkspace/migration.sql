-- CreateIndex
CREATE INDEX "user_email_idx" ON "user"("email");

-- CreateIndex
CREATE INDEX "user_auth_id_idx" ON "user"("auth_id");

-- CreateIndex
CREATE INDEX "workspace_stripe_customer_id_idx" ON "workspace"("stripe_customer_id");

-- CreateIndex
CREATE INDEX "workspace_subscription_id_idx" ON "workspace"("subscription_id");
