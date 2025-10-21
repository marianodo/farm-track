import { Module } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AnalyticsController } from './controller/analytics.controller';
import { AnalyticsService } from './service/analytics.service';
import { AnalyticsRepository } from './repository/analytics.repository';

@Module({
  controllers: [AnalyticsController],
  providers: [AnalyticsService, AnalyticsRepository, PrismaService],
  exports: [AnalyticsService],
})
export class AnalyticsModule {}
