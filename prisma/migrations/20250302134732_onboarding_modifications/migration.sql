/*
  Warnings:

  - You are about to drop the column `company_size` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `industry` on the `user` table. All the data in the column will be lost.

*/
-- AlterEnum
ALTER TYPE "onboarding_step" ADD VALUE 'INVITED_USER';

-- AlterTable
ALTER TABLE "user" DROP COLUMN "company_size",
DROP COLUMN "industry",
ADD COLUMN     "temp_company_size" TEXT,
ADD COLUMN     "temp_industry" TEXT;

-- AlterTable
ALTER TABLE "workspace" ADD COLUMN     "company_size" TEXT,
ADD COLUMN     "industry" TEXT;

-- CreateTable
CREATE TABLE "invitation" (
    "id" SERIAL NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "email" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "used" BOOLEAN NOT NULL DEFAULT false,
    "used_at" TIMESTAMP(3),
    "workspace_id" INTEGER NOT NULL,
    "role" "user_role" NOT NULL DEFAULT 'READER',

    CONSTRAINT "invitation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "invitation_token_key" ON "invitation"("token");

-- CreateIndex
CREATE INDEX "invitation_workspace_id_idx" ON "invitation"("workspace_id");

-- CreateIndex
CREATE INDEX "invitation_token_idx" ON "invitation"("token");

-- CreateIndex
CREATE INDEX "invitation_email_idx" ON "invitation"("email");

-- AddForeignKey
ALTER TABLE "invitation" ADD CONSTRAINT "invitation_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
