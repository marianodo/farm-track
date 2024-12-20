import { PrismaService } from 'src/prisma/prisma.service';
import { FieldController } from './controller/field.controller';
import { FieldRepository } from './repository/field.repository';
import { FieldService } from './service/field.service';
import { Module } from '@nestjs/common';
import { TypeOfObjectsModule } from 'src/type_of_objects/type_of_objects.module';

@Module({
  imports: [TypeOfObjectsModule],
  controllers: [FieldController],
  providers: [FieldService, FieldRepository, PrismaService],
})
export class FieldModule {}
