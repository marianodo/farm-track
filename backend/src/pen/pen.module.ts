import { Module } from '@nestjs/common';
import { PenService } from './service/pen.service';
import { PenController } from './controller/pen.controller';
import { PenRepository } from './repository/pen.repository';
import { PrismaService } from 'src/prisma/prisma.service';
import { PenVariableTypeOfObjectRepository } from 'src/pen_variable_type-of-object/repository/pen_variable_type-of-object.repository';

@Module({
  controllers: [PenController],
  providers: [
    PenService,
    PenRepository,
    PenVariableTypeOfObjectRepository,
    PrismaService,
  ],
})
export class PenModule {}
