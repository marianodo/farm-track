import { Module } from '@nestjs/common';
import { VariableController } from './controller/variable.controller';
import { VariableService } from './service/variable.service';
import { VariableRepository } from './repository/variable.repository';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  controllers: [VariableController],
  providers: [VariableService, VariableRepository, PrismaService],
})
export class VariableModule {}
