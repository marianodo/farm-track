import { IsString, IsOptional, IsNotEmpty } from 'class-validator';

export class CreateReportDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  comment?: string;

  @IsString()
  @IsNotEmpty()
  field_id: string;
}