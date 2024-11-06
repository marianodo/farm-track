import { Type } from 'class-transformer';
import {
  IsInt,
  IsString,
  IsNotEmpty,
  ValidateNested,
  IsOptional,
} from 'class-validator';

export class CreateBulkMeasurementDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsNotEmpty()
  @IsInt()
  @IsOptional()
  type_of_object_id?: number;

  @IsInt()
  @IsOptional()
  subject_id?: number;

  @IsNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => MeasurementDTO)
  measurements: MeasurementDTO[];
}

class MeasurementDTO {
  @IsInt()
  @IsOptional()
  subject_id?: number;

  @IsInt()
  pen_variable_type_of_object_id: number;

  @IsString()
  value: string;

  @IsInt()
  report_id: number;
}
