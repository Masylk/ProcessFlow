/*
  Warnings:

  - You are about to drop the column `password` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `team_tags` on the `user` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[auth_id]` on the table `user` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `auth_id` to the `user` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "user" DROP COLUMN "password",
DROP COLUMN "team_tags",
ADD COLUMN     "auth_id" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "user_auth_id_key" ON "user"("auth_id");
