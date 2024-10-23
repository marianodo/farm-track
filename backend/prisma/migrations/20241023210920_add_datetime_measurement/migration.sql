/*
  Warnings:

  - A unique constraint covering the columns `[subject_id]` on the table `Measurement` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `updated_at` to the `Measurement` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Measurement" ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Measurement_subject_id_key" ON "Measurement"("subject_id");
