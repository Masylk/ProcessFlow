-- CreateEnum
CREATE TYPE "email_status" AS ENUM ('PENDING', 'CANCELLED', 'PAUSED', 'SENT', 'FAILED');

-- CreateTable
CREATE TABLE "scheduled_emails" (
    "id" SERIAL NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "user_id" INTEGER NOT NULL,
    "email_type" TEXT NOT NULL,
    "scheduled_for" TIMESTAMP(3) NOT NULL,
    "status" "email_status" NOT NULL DEFAULT 'PENDING',
    "sent" BOOLEAN NOT NULL DEFAULT false,
    "sent_at" TIMESTAMP(3),
    "metadata" JSONB,
    "error" TEXT,
    "retry_count" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "scheduled_emails_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "scheduled_emails_user_id_idx" ON "scheduled_emails"("user_id");

-- CreateIndex
CREATE INDEX "scheduled_emails_scheduled_for_idx" ON "scheduled_emails"("scheduled_for");

-- CreateIndex
CREATE INDEX "scheduled_emails_status_idx" ON "scheduled_emails"("status");

-- CreateIndex
CREATE INDEX "scheduled_emails_sent_idx" ON "scheduled_emails"("sent");

-- AddForeignKey
ALTER TABLE "scheduled_emails" ADD CONSTRAINT "scheduled_emails_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
