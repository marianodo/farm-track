-- CreateTable
CREATE TABLE "PenTypeOfObject" (
    "penId" INTEGER NOT NULL,
    "typeOfObjectId" INTEGER NOT NULL,

    CONSTRAINT "PenTypeOfObject_pkey" PRIMARY KEY ("penId","typeOfObjectId")
);

-- AddForeignKey
ALTER TABLE "PenTypeOfObject" ADD CONSTRAINT "PenTypeOfObject_penId_fkey" FOREIGN KEY ("penId") REFERENCES "Pen"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PenTypeOfObject" ADD CONSTRAINT "PenTypeOfObject_typeOfObjectId_fkey" FOREIGN KEY ("typeOfObjectId") REFERENCES "TypeOfObject"("id") ON DELETE CASCADE ON UPDATE CASCADE;
