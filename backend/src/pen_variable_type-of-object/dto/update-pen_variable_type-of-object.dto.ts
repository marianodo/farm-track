import { PartialType } from '@nestjs/mapped-types';
import { CreatePenVariableTypeOfObjectDto } from './create-pen_variable_type-of-object.dto';

export class UpdatePenVariableTypeOfObjectDto extends PartialType(CreatePenVariableTypeOfObjectDto) {}
