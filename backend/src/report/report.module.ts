import { Module } from '@nestjs/common';
import { ReportService } from './service/report.service';
import { ReportController } from './controller/report.controller';
import { ReportRepository } from './repository/report.repository';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  controllers: [ReportController],
  providers: [ReportService, ReportRepository, PrismaService],
})
export class ReportModule {}
