import { Module } from '@nestjs/common';
import { ChatbotController } from './controller/chatbot.controller';
import { ChatbotService } from './service/chatbot.service';
import { PrismaModule } from '../prisma/prisma.module';
import { FieldModule } from '../field/field.module';

@Module({
  imports: [PrismaModule, FieldModule],
  controllers: [ChatbotController],
  providers: [ChatbotService],
  exports: [ChatbotService],
})
export class ChatbotModule {} 