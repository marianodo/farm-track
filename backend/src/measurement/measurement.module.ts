import { Module } from '@nestjs/common';
import { MeasurementService } from './service/measurement.service';
import { MeasurementController } from './controller/measurement.controller';
import { MeasurementRepository } from './repository/measurement.repository';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  controllers: [MeasurementController],
  providers: [MeasurementService, PrismaService, MeasurementRepository],
})
export class MeasurementModule {}
