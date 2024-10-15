import { PartialType, PickType } from '@nestjs/mapped-types';
import { CreatePenDto } from './create-pen.dto';

export class UpdatePenDto extends PartialType(
  PickType(CreatePenDto, ['name', 'type_of_object_ids'] as const),
) {}
