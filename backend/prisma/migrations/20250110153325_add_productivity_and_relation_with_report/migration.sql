-- CreateTable
CREATE TABLE "Productivity" (
    "id" SERIAL NOT NULL,
    "total_cows" INTEGER,
    "milking_cows" INTEGER,
    "average_production" DECIMAL(65,30),
    "somatic_cells" INTEGER,
    "percentage_of_fat" DECIMAL(65,30),
    "percentage_of_protein" DECIMAL(65,30),
    "userId" TEXT NOT NULL,
    "reportId" INTEGER NOT NULL,

    CONSTRAINT "Productivity_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Productivity_reportId_key" ON "Productivity"("reportId");

-- AddForeignKey
ALTER TABLE "Productivity" ADD CONSTRAINT "Productivity_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Productivity" ADD CONSTRAINT "Productivity_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "Report"("id") ON DELETE CASCADE ON UPDATE CASCADE;
