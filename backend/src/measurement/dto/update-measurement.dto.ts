import { PartialType } from '@nestjs/mapped-types';
import { CreateMeasurementDto } from './create-measurement.dto';

export class UpdateMeasurementDto extends PartialType(CreateMeasurementDto) {}
