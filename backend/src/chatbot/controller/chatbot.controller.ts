import { Controller, Post, Get, Body, UseGuards, Request } from '@nestjs/common';
import { ChatbotService } from '../service/chatbot.service';
import { ChatMessageDto, ChatResponseDto } from '../dto/chatbot.dto';
import { JwtAuthGuard } from '../../auth/guard/jwt-auth.guard';

@Controller('chatbot')
export class ChatbotController {
  constructor(private readonly chatbotService: ChatbotService) {}

  @Get('health')
  async healthCheck() {
    const requiredVars = ['ANTHROPIC_API_KEY', 'DATABASE_URL', 'JWT_SECRET'];
    const missingVars = requiredVars.filter((varName) => !process.env[varName]);

    return {
      status: missingVars.length > 0 ? 'error' : 'ok',
      timestamp: new Date().toISOString(),
      anthropicConfigured: !!process.env.ANTHROPIC_API_KEY,
      model: process.env.ANTHROPIC_MODEL || 'claude-opus-4-8',
      databaseConfigured: !!process.env.DATABASE_URL,
      jwtConfigured: !!process.env.JWT_SECRET,
      missingVariables: missingVars,
    };
  }

  @Post('message')
  @UseGuards(JwtAuthGuard)
  async processMessage(
    @Body() chatMessageDto: ChatMessageDto,
    @Request() req: any
  ): Promise<ChatResponseDto> {
    const userId = req.user?.userId || req.user?.id;

    if (!userId) {
      throw new Error('User ID not found in request');
    }
    
    return this.chatbotService.processMessage(chatMessageDto, userId);
  }
} 