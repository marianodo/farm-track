/*
  Warnings:

  - A unique constraint covering the columns `[name,userId]` on the table `TypeOfObject` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name,userId]` on the table `Variable` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `userId` to the `TypeOfObject` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `Variable` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "TypeOfObject_name_key";

-- DropIndex
DROP INDEX "Variable_name_key";

-- CreateIndex
CREATE UNIQUE INDEX "TypeOfObject_name_userId_key" ON "TypeOfObject"("name", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "Variable_name_userId_key" ON "Variable"("name", "userId");
