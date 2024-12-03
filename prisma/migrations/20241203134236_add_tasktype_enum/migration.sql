-- CreateEnum
CREATE TYPE "TaskType" AS ENUM ('MANUAL', 'AUTOMATIC');

-- AlterTable
ALTER TABLE "Block" ADD COLUMN     "averageTime" INTEGER,
ADD COLUMN     "lastModified" TIMESTAMP(3),
ADD COLUMN     "taskType" "TaskType";
