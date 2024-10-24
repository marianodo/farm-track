/*
  Warnings:

  - The primary key for the `PenVariableTypeOfObject` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - A unique constraint covering the columns `[penId,variableId,typeOfObjectId]` on the table `PenVariableTypeOfObject` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "PenVariableTypeOfObject" DROP CONSTRAINT "PenVariableTypeOfObject_pkey",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "PenVariableTypeOfObject_pkey" PRIMARY KEY ("id");

-- CreateTable
CREATE TABLE "Subject" (
    "id" SERIAL NOT NULL,
    "name" TEXT,
    "type_of_object_id" INTEGER NOT NULL,

    CONSTRAINT "Subject_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Measurement" (
    "id" SERIAL NOT NULL,
    "pen_variable_type_of_object_id" INTEGER NOT NULL,
    "value" TEXT NOT NULL,
    "report_id" INTEGER NOT NULL,
    "subject_id" INTEGER NOT NULL,

    CONSTRAINT "Measurement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Report" (
    "id" SERIAL NOT NULL,
    "name" TEXT,
    "comment" TEXT,
    "field_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Report_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PenVariableTypeOfObject_penId_variableId_typeOfObjectId_key" ON "PenVariableTypeOfObject"("penId", "variableId", "typeOfObjectId");

-- AddForeignKey
ALTER TABLE "Subject" ADD CONSTRAINT "Subject_type_of_object_id_fkey" FOREIGN KEY ("type_of_object_id") REFERENCES "TypeOfObject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Measurement" ADD CONSTRAINT "Measurement_pen_variable_type_of_object_id_fkey" FOREIGN KEY ("pen_variable_type_of_object_id") REFERENCES "PenVariableTypeOfObject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Measurement" ADD CONSTRAINT "Measurement_report_id_fkey" FOREIGN KEY ("report_id") REFERENCES "Report"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Measurement" ADD CONSTRAINT "Measurement_subject_id_fkey" FOREIGN KEY ("subject_id") REFERENCES "Subject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_field_id_fkey" FOREIGN KEY ("field_id") REFERENCES "Field"("id") ON DELETE CASCADE ON UPDATE CASCADE;
