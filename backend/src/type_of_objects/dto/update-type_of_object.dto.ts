import { PartialType } from '@nestjs/mapped-types';
import { CreateTypeOfObjectDto } from './create-type_of_object.dto';

export class UpdateTypeOfObjectDto extends PartialType(CreateTypeOfObjectDto) {}
