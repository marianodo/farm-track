-- CreateTable
CREATE TABLE "PenVariableTypeOfObject" (
    "penId" INTEGER NOT NULL,
    "variableId" INTEGER NOT NULL,
    "typeOfObjectId" INTEGER NOT NULL,
    "custom_parameters" JSONB NOT NULL,

    CONSTRAINT "PenVariableTypeOfObject_pkey" PRIMARY KEY ("penId","variableId","typeOfObjectId")
);

-- AddForeignKey
ALTER TABLE "PenVariableTypeOfObject" ADD CONSTRAINT "PenVariableTypeOfObject_penId_fkey" FOREIGN KEY ("penId") REFERENCES "Pen"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PenVariableTypeOfObject" ADD CONSTRAINT "PenVariableTypeOfObject_variableId_fkey" FOREIGN KEY ("variableId") REFERENCES "Variable"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PenVariableTypeOfObject" ADD CONSTRAINT "PenVariableTypeOfObject_typeOfObjectId_fkey" FOREIGN KEY ("typeOfObjectId") REFERENCES "TypeOfObject"("id") ON DELETE CASCADE ON UPDATE CASCADE;
