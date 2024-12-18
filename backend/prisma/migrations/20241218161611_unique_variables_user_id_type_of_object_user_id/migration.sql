-- Eliminar los índices únicos existentes
DROP INDEX IF EXISTS "Variable_name_key";
DROP INDEX IF EXISTS "TypeOfObject_name_key";

-- Crear nuevos índices únicos
CREATE UNIQUE INDEX "Variable_name_userId_key" ON "Variable" ("name", "userId");
CREATE UNIQUE INDEX "TypeOfObject_name_userId_key" ON "TypeOfObject" ("name", "userId");