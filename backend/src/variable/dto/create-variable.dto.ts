import {
  ArrayNotEmpty,
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsString,
  Length,
} from 'class-validator';

enum VariableType {
  NUMBER = 'NUMBER',
  CATEGORICAL = 'CATEGORICAL',
}

export class CreateVariableDto {
  @IsNotEmpty()
  @Length(1, 36)
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsEnum(VariableType)
  type: VariableType;

  @IsNotEmpty()
  @IsObject()
  defaultValue: object;

  @IsNotEmpty()
  @IsArray()
  @ArrayNotEmpty()
  @IsNumber({}, { each: true })
  type_of_object_ids: number[];
}
