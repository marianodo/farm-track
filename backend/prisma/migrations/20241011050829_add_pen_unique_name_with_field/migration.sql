/*
  Warnings:

  - A unique constraint covering the columns `[name,fieldId]` on the table `Pen` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Pen_name_key";

-- CreateIndex
CREATE UNIQUE INDEX "Pen_name_fieldId_key" ON "Pen"("name", "fieldId");
