import { PartialType, OmitType } from '@nestjs/mapped-types';
import { CreateFieldDto } from './create-field.dto';

export class UpdateFieldDto extends PartialType(
  OmitType(CreateFieldDto, ['userId'] as const),
) {}
