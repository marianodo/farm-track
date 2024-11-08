import { Module } from '@nestjs/common';
import { SubjectService } from './service/subject.service';
import { SubjectController } from './controller/subject.controller';
import { SubjectRepository } from './repository/subject.repository';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  controllers: [SubjectController],
  providers: [SubjectService, SubjectRepository, PrismaService],
  exports: [SubjectService],
})
export class SubjectModule {}
