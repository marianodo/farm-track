import { Module } from '@nestjs/common';
import { PenService } from './service/pen.service';
import { PenController } from './controller/pen.controller';
import { PenRepository } from './repository/pen.repository';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  controllers: [PenController],
  providers: [PenService, PenRepository, PrismaService],
})
export class PenModule {}
