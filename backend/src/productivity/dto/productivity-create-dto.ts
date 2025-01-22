import {
  IsInt,
  IsOptional,
  IsPositive,
  IsNumber,
  IsNotEmpty,
  IsUUID,
} from 'class-validator';

export class CreateProductivityDto {
  @IsOptional() // Hace que este campo sea opcional
  @IsInt()
  @IsPositive()
  total_cows?: number;

  @IsOptional()
  @IsInt()
  @IsPositive()
  milking_cows?: number;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  average_production?: number;

  @IsOptional()
  @IsInt()
  @IsPositive()
  somatic_cells?: number;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  percentage_of_fat?: number;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  percentage_of_protein?: number;

  // Asegurarse de que el userId esté presente si es necesario
  @IsNotEmpty({
    message: 'UserId es requerido para crear un reporte de productividad.',
  })
  @IsUUID('4', { message: 'El UserId debe ser un UUID válido.' })
  userId: string;
}
