import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { ChatbotService } from '../service/chatbot.service';
import { ChatMessageDto, ChatResponseDto } from '../dto/chatbot.dto';
import { JwtAuthGuard } from '../../auth/guard/jwt-auth.guard';

@Controller('chatbot')
@UseGuards(JwtAuthGuard)
export class ChatbotController {
  constructor(private readonly chatbotService: ChatbotService) {}

  @Post('message')
  async processMessage(
    @Body() chatMessageDto: ChatMessageDto,
    @Request() req: any
  ): Promise<ChatResponseDto> {
    console.log('Chatbot request received:', {
      message: chatMessageDto.message,
      fieldId: chatMessageDto.fieldId,
      user: req.user,
      headers: req.headers.authorization ? 'Present' : 'Missing'
    });
    
    const userId = req.user?.userId || req.user?.id;
    console.log('Extracted userId:', userId);
    
    if (!userId) {
      throw new Error('User ID not found in request');
    }
    
    return this.chatbotService.processMessage(chatMessageDto, userId);
  }
} 