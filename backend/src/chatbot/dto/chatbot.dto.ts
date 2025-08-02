import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class ChatMessageDto {
  @IsString()
  @IsNotEmpty()
  message: string;

  @IsString()
  @IsNotEmpty()
  fieldId: string;

  @IsString()
  @IsOptional()
  userId?: string;
}

export class ChatResponseDto {
  response: string;
  alerts?: string[];
  recommendations?: string[];
  data?: any;
} 