/*
  Warnings:

  - Added the required column `userId` to the `TypeOfObject` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `Variable` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "TypeOfObject" ADD COLUMN     "userId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Variable" ADD COLUMN     "userId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Variable" ADD CONSTRAINT "Variable_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TypeOfObject" ADD CONSTRAINT "TypeOfObject_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
