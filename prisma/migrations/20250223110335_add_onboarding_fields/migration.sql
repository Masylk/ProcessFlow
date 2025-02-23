-- CreateEnum
CREATE TYPE "OnboardingStep" AS ENUM ('PERSONAL_INFO', 'PROFESSIONAL_INFO', 'WORKSPACE_SETUP', 'COMPLETED');

-- AlterTable
ALTER TABLE "user" ADD COLUMN     "onboarding_completed_at" TIMESTAMP(3),
ADD COLUMN     "onboarding_step" "OnboardingStep" DEFAULT 'PERSONAL_INFO';
