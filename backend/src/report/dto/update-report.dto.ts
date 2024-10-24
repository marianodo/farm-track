import { OmitType, PartialType } from '@nestjs/mapped-types';
import { CreateReportDto } from './create-report.dto';

export class UpdateReportDto extends PartialType(
  OmitType(CreateReportDto, ['field_id'] as const),
) {}
