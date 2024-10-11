import {
  IsString,
  IsNotEmpty,
  MaxLength,
  IsArray,
  ArrayNotEmpty,
  IsNumber,
} from 'class-validator';

export class CreatePenDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(50, { message: 'Name must not exceed 50 characters' })
  name: string;

  @IsString()
  @IsNotEmpty()
  fieldId: string;

  @IsNotEmpty()
  @IsArray()
  @ArrayNotEmpty()
  @IsNumber({}, { each: true })
  type_of_object_ids: number[];
}
