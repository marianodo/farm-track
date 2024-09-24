import { IsString, IsArray, IsOptional } from 'class-validator';

export class CreateTypeOfObjectDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsArray()
  variables?: number[];
}
