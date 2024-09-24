import { Module } from '@nestjs/common';
import { TypeOfObjectsService } from './service/type_of_objects.service';
import { TypeOfObjectsController } from './controller/type_of_objects.controller';
import { PrismaService } from 'src/prisma/prisma.service';
import { TypeOfObjectsRepository } from './repository/type_of_objects.repository';

@Module({
  controllers: [TypeOfObjectsController],
  providers: [TypeOfObjectsService, TypeOfObjectsRepository, PrismaService],
})
export class TypeOfObjectsModule {}
