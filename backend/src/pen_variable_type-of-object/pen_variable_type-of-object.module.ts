import { Module } from '@nestjs/common';
import { PenVariableTypeOfObjectService } from './service/pen_variable_type-of-object.service';
import { PenVariableTypeOfObjectController } from './controller/pen_variable_type-of-object.controller';
import { PenVariableTypeOfObjectRepository } from './repository/pen_variable_type-of-object.repository';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  controllers: [PenVariableTypeOfObjectController],
  providers: [
    PenVariableTypeOfObjectService,
    PenVariableTypeOfObjectRepository,
    PrismaService,
  ],
})
export class PenVariableTypeOfObjectModule {}
