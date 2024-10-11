-- CreateTable
CREATE TABLE "Pen" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "fieldId" TEXT NOT NULL,

    CONSTRAINT "Pen_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Pen_name_key" ON "Pen"("name");

-- AddForeignKey
ALTER TABLE "Pen" ADD CONSTRAINT "Pen_fieldId_fkey" FOREIGN KEY ("fieldId") REFERENCES "Field"("id") ON DELETE CASCADE ON UPDATE CASCADE;
