-- CreateTable
CREATE TABLE "PopularIcon" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,

    CONSTRAINT "PopularIcon_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PopularIcon_name_key" ON "PopularIcon"("name");
