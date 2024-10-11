import { Injectable } from '@nestjs/common';
import { CreatePenVariableTypeOfObjectDto } from '../dto/create-pen_variable_type-of-object.dto';
import { UpdatePenVariableTypeOfObjectDto } from '../dto/update-pen_variable_type-of-object.dto';

@Injectable()
export class PenVariableTypeOfObjectService {
  create(createPenVariableTypeOfObjectDto: CreatePenVariableTypeOfObjectDto) {
    return 'This action adds a new penVariableTypeOfObject';
  }

  findAll() {
    return `This action returns all penVariableTypeOfObject`;
  }

  findOne(id: number) {
    return `This action returns a #${id} penVariableTypeOfObject`;
  }

  update(
    id: number,
    updatePenVariableTypeOfObjectDto: UpdatePenVariableTypeOfObjectDto,
  ) {
    return `This action updates a #${id} penVariableTypeOfObject`;
  }

  remove(id: number) {
    return `This action removes a #${id} penVariableTypeOfObject`;
  }
}
