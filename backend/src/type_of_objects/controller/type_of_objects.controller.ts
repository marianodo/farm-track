import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { TypeOfObjectsService } from '../service/type_of_objects.service';
import { CreateTypeOfObjectDto } from '../dto/create-type_of_object.dto';
import { UpdateTypeOfObjectDto } from '../dto/update-type_of_object.dto';

@Controller('type-of-objects')
export class TypeOfObjectsController {
  constructor(private readonly typeOfObjectsService: TypeOfObjectsService) {}

  @HttpCode(HttpStatus.CREATED)
  @Post()
  async create(@Body() createTypeOfObjectDto: CreateTypeOfObjectDto) {
    try {
      return await this.typeOfObjectsService.create(createTypeOfObjectDto);
    } catch (error) {
      throw error;
    }
  }

  @HttpCode(HttpStatus.OK)
  @Get()
  async findAll() {
    try {
      return await this.typeOfObjectsService.findAll();
    } catch (error) {
      throw error;
    }
  }

  @HttpCode(HttpStatus.OK)
  @Get(':id')
  async findOne(@Param('id') id: string) {
    try {
      return await this.typeOfObjectsService.findOne(+id);
    } catch (error) {
      throw error;
    }
  }

  @HttpCode(HttpStatus.OK)
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateTypeOfObjectDto: UpdateTypeOfObjectDto,
  ) {
    try {
      return await this.typeOfObjectsService.update(+id, updateTypeOfObjectDto);
    } catch (error) {
      throw error;
    }
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  async remove(@Param('id') id: string) {
    try {
      return await this.typeOfObjectsService.remove(+id);
    } catch (error) {
      throw error;
    }
  }
}
