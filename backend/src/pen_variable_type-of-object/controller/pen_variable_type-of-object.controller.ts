import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { PenVariableTypeOfObjectService } from '../service/pen_variable_type-of-object.service';
import { CreatePenVariableTypeOfObjectDto } from '../dto/create-pen_variable_type-of-object.dto';
import { UpdatePenVariableTypeOfObjectDto } from '../dto/update-pen_variable_type-of-object.dto';

@Controller('pens-variables-type-of-objects')
export class PenVariableTypeOfObjectController {
  constructor(
    private readonly penVariableTypeOfObjectService: PenVariableTypeOfObjectService,
  ) {}

  @HttpCode(HttpStatus.CREATED)
  @Post()
  async create(
    @Body() createPenVariableTypeOfObjectDto: CreatePenVariableTypeOfObjectDto,
  ) {
    try {
      return await this.penVariableTypeOfObjectService.create(
        createPenVariableTypeOfObjectDto,
      );
    } catch (error) {
      throw error;
    }
  }

  @HttpCode(HttpStatus.OK)
  @Get()
  async findAll() {
    try {
      return await this.penVariableTypeOfObjectService.findAll();
    } catch (error) {
      throw error;
    }
  }
  @HttpCode(HttpStatus.OK)
  @Get('type-of-object/:typeOfObjectId/:penId')
  async findByTypeOfObjectIdAndPen(
    @Param('typeOfObjectId') typeOfObjectId: string,
    @Param('penId') penId: string,
    @Query('withVariable') withVariable: string,
  ) {
    try {
      const withVariableBool = withVariable === 'false' ? false : true;
      return await this.penVariableTypeOfObjectService.findByTypeOfObjectIdAndPen(
        +typeOfObjectId,
        +penId,
        withVariableBool,
      );
    } catch (error) {
      throw error;
    }
  }

  @HttpCode(HttpStatus.OK)
  @Get(':penId/:variableId/:typeOfObjectId')
  async findOne(
    @Param('penId') penId: string,
    @Param('variableId') variableId: string,
    @Param('typeOfObjectId') typeOfObjectId: string,
  ) {
    try {
      return await this.penVariableTypeOfObjectService.findOne(
        +penId,
        +variableId,
        +typeOfObjectId,
      );
    } catch (error) {
      throw error;
    }
  }

  @HttpCode(HttpStatus.OK)
  @Patch(':penId/:variableId/:typeOfObjectId')
  async update(
    @Param('penId') penId: string,
    @Param('variableId') variableId: string,
    @Param('typeOfObjectId') typeOfObjectId: string,
    @Body() updatePenVariableTypeOfObjectDto: UpdatePenVariableTypeOfObjectDto,
  ) {
    try {
      return await this.penVariableTypeOfObjectService.update(
        +penId,
        +variableId,
        +typeOfObjectId,
        updatePenVariableTypeOfObjectDto,
      );
    } catch (error) {
      throw error;
    }
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':penId/:variableId/:typeOfObjectId')
  async remove(
    @Param('penId') penId: string,
    @Param('variableId') variableId: string,
    @Param('typeOfObjectId') typeOfObjectId: string,
  ) {
    try {
      return await this.penVariableTypeOfObjectService.remove(
        +penId,
        +variableId,
        +typeOfObjectId,
      );
    } catch (error) {
      throw error;
    }
  }

  @HttpCode(HttpStatus.OK)
  @Get('type-of-object/:typeOfObjectId')
  async findByTypeOfObjectId(
    @Param('typeOfObjectId') typeOfObjectId: string,
    @Query('withVariable') withVariable: string,
  ) {
    try {
      const withVariableBool = withVariable === 'false' ? false : true;
      return await this.penVariableTypeOfObjectService.findByTypeOfObjectId(
        +typeOfObjectId,
        withVariableBool,
      );
    } catch (error) {
      throw error;
    }
  }
}
