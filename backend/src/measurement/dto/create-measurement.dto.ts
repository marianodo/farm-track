import { IsInt, IsString, IsNotEmpty } from 'class-validator';

export class CreateMeasurementDto {
  @IsInt()
  @IsNotEmpty()
  pen_variable_type_of_object_id: number;

  @IsString()
  @IsNotEmpty()
  value: string;

  @IsInt()
  @IsNotEmpty()
  report_id: number;

  @IsInt()
  @IsNotEmpty()
  subject_id: number;
}
