-- CreateEnum
CREATE TYPE "VariableType" AS ENUM ('NUMBER', 'CATEGORICAL');

-- CreateTable
CREATE TABLE "Variable" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "type" "VariableType" NOT NULL,
    "defaultValue" JSONB NOT NULL,

    CONSTRAINT "Variable_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TypeOfObject" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "TypeOfObject_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TypeOfObject_Variable" (
    "type_of_object_id" INTEGER NOT NULL,
    "variable_id" INTEGER NOT NULL,

    CONSTRAINT "TypeOfObject_Variable_pkey" PRIMARY KEY ("type_of_object_id","variable_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Variable_name_key" ON "Variable"("name");

-- CreateIndex
CREATE UNIQUE INDEX "TypeOfObject_name_key" ON "TypeOfObject"("name");

-- AddForeignKey
ALTER TABLE "TypeOfObject_Variable" ADD CONSTRAINT "TypeOfObject_Variable_type_of_object_id_fkey" FOREIGN KEY ("type_of_object_id") REFERENCES "TypeOfObject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TypeOfObject_Variable" ADD CONSTRAINT "TypeOfObject_Variable_variable_id_fkey" FOREIGN KEY ("variable_id") REFERENCES "Variable"("id") ON DELETE CASCADE ON UPDATE CASCADE;
