import { Module } from '@nestjs/common';
import { ChatbotController } from './controller/chatbot.controller';
import { ChatbotService } from './service/chatbot.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ChatbotController],
  providers: [ChatbotService],
  exports: [ChatbotService],
})
export class ChatbotModule {} 