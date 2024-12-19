/*
  Warnings:

  - A unique constraint covering the columns `[name,userId]` on the table `TypeOfObject` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name,userId]` on the table `Variable` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `correlative_id` to the `Report` table without a default value. This is not possible if the table is not empty.
  - Added the required column `correlative_id` to the `Subject` table without a default value. This is not possible if the table is not empty.
  - Added the required column `field_id` to the `Subject` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `TypeOfObject` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `Variable` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Report" ADD COLUMN     "correlative_id" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Subject" ADD COLUMN     "correlative_id" INTEGER NOT NULL,
ADD COLUMN     "field_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "TypeOfObject" ADD COLUMN     "userId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Variable" ADD COLUMN     "userId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "TypeOfObject_name_userId_key" ON "TypeOfObject"("name", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "Variable_name_userId_key" ON "Variable"("name", "userId");

-- AddForeignKey
ALTER TABLE "Variable" ADD CONSTRAINT "Variable_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TypeOfObject" ADD CONSTRAINT "TypeOfObject_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subject" ADD CONSTRAINT "Subject_field_id_fkey" FOREIGN KEY ("field_id") REFERENCES "Field"("id") ON DELETE CASCADE ON UPDATE CASCADE;
