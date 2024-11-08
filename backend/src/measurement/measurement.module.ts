import { Module } from '@nestjs/common';
import { MeasurementService } from './service/measurement.service';
import { MeasurementController } from './controller/measurement.controller';
import { MeasurementRepository } from './repository/measurement.repository';
import { PrismaService } from 'src/prisma/prisma.service';
import { SubjectModule } from 'src/subject/subject.module';

@Module({
  imports: [SubjectModule],
  controllers: [MeasurementController],
  providers: [MeasurementService, PrismaService, MeasurementRepository],
})
export class MeasurementModule {}
