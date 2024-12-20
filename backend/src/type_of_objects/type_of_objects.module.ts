import { Module } from '@nestjs/common';
import { TypeOfObjectsService } from './service/type_of_objects.service';
import { TypeOfObjectsController } from './controller/type_of_objects.controller';
import { PrismaService } from 'src/prisma/prisma.service';
import { TypeOfObjectsRepository } from './repository/type_of_objects.repository';
import { PenVariableTypeOfObjectRepository } from 'src/pen_variable_type-of-object/repository/pen_variable_type-of-object.repository';
import { VariableModule } from 'src/variable/variable.module';

@Module({
  imports: [VariableModule],
  controllers: [TypeOfObjectsController],
  providers: [
    TypeOfObjectsService,
    TypeOfObjectsRepository,
    PenVariableTypeOfObjectRepository,
    PrismaService,
  ],
  exports: [TypeOfObjectsService],
})
export class TypeOfObjectsModule {}
