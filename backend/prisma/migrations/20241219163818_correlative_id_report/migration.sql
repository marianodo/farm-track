/*
  Warnings:

  - Added the required column `correlative_id` to the `Report` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Report" ADD COLUMN     "correlative_id" INTEGER NOT NULL;
