import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { PenVariableTypeOfObjectService } from '../service/pen_variable_type-of-object.service';
import { CreatePenVariableTypeOfObjectDto } from '../dto/create-pen_variable_type-of-object.dto';
import { UpdatePenVariableTypeOfObjectDto } from '../dto/update-pen_variable_type-of-object.dto';

@Controller('pen-variable-type-of-object')
export class PenVariableTypeOfObjectController {
  constructor(
    private readonly penVariableTypeOfObjectService: PenVariableTypeOfObjectService,
  ) {}

  @Post()
  create(
    @Body() createPenVariableTypeOfObjectDto: CreatePenVariableTypeOfObjectDto,
  ) {
    return this.penVariableTypeOfObjectService.create(
      createPenVariableTypeOfObjectDto,
    );
  }

  @Get()
  findAll() {
    return this.penVariableTypeOfObjectService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.penVariableTypeOfObjectService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updatePenVariableTypeOfObjectDto: UpdatePenVariableTypeOfObjectDto,
  ) {
    return this.penVariableTypeOfObjectService.update(
      +id,
      updatePenVariableTypeOfObjectDto,
    );
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.penVariableTypeOfObjectService.remove(+id);
  }
}
