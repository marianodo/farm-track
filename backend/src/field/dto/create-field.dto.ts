import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Length,
} from 'class-validator';

export class CreateFieldDto {
  @IsNotEmpty()
  @Length(1, 36)
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  description: string;

  @IsString()
  @IsOptional()
  location: string;

  @IsNumber()
  @IsOptional()
  latitude: number;

  @IsNumber()
  @IsOptional()
  longitude: number;

  @IsString()
  @IsOptional()
  production_type: string;

  @IsString()
  @IsOptional()
  breed: string;

  @IsString()
  @IsOptional()
  installation: string;

  @IsNumber()
  @IsOptional()
  number_of_animals: number;

  @IsNotEmpty()
  @IsString()
  userId: string;
}
