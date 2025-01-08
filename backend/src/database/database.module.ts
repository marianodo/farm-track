import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { DatabaseService } from '../database/service/database.service';
import { DatabaseController } from '../database/controller/database.controller';
import { DatabaseRepository } from '../database/repository/database.repository';

@Module({
  providers: [DatabaseService, DatabaseRepository, PrismaService],
  controllers: [DatabaseController],
  exports: [DatabaseService],
})
export class DatabaseModule {}
