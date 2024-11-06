import { Module } from '@nestjs/common';
import { MeasurementService } from './service/measurement.service';
import { MeasurementController } from './controller/measurement.controller';
import { MeasurementRepository } from './repository/measurement.repository';
import { PrismaService } from 'src/prisma/prisma.service';
import { SubjectService } from 'src/subject/service/subject.service';
import { SubjectRepository } from 'src/subject/repository/subject.repository';

@Module({
  controllers: [MeasurementController],
  providers: [
    MeasurementService,
    PrismaService,
    MeasurementRepository,
    SubjectService,
    SubjectRepository,
  ],
})
export class MeasurementModule {}
