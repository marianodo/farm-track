import { IsString, IsInt, IsOptional, IsNotEmpty } from 'class-validator';

export class CreateSubjectDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsInt()
  @IsNotEmpty()
  type_of_object_id: number;
}
