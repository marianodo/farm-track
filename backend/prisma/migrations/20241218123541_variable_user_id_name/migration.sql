/*
  Warnings:

  - A unique constraint covering the columns `[name,userId]` on the table `Variable` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Variable_name_userId_key" ON "Variable"("name", "userId");
