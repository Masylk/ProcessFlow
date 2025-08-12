/*
  Warnings:

  - A unique constraint covering the columns `[user_id,email_type]` on the table `scheduled_emails` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "unique_pending_email_per_user_type_where" ON "scheduled_emails"("user_id", "email_type");
