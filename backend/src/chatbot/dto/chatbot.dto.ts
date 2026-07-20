import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsArray,
  ValidateNested,
  IsIn,
  ArrayMaxSize,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';

/** One previous turn of the conversation, sent by the client. */
export class ChatHistoryItemDto {
  @IsString()
  @IsIn(['user', 'assistant'])
  role: 'user' | 'assistant';

  @IsString()
  @IsNotEmpty()
  @MaxLength(8000)
  content: string;
}

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

  /** Previous turns so Claude can follow up ("¿y el corral 2?"). */
  @IsArray()
  @IsOptional()
  @ArrayMaxSize(20)
  @ValidateNested({ each: true })
  @Type(() => ChatHistoryItemDto)
  history?: ChatHistoryItemDto[];
}

export class SourceInfo {
  doc: string;
  similarity: number;
}

export class AlertInfo {
  type: string;
  message: string;
}

export class ChatResponseDto {
  response: string;
  sources?: SourceInfo[];
  alerts?: AlertInfo[];
} 