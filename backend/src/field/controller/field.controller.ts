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
import { FieldService } from '../service/field.service';
// import { CreateFieldDto } from '../dto/create-field.dto';
import { UpdateFieldDto } from '../dto/update-field.dto';

@Controller('fields')
export class FieldController {
  constructor(private readonly fieldService: FieldService) {}

  @HttpCode(HttpStatus.CREATED)
  @Post()
  async create(@Body() body: any) {
    const { ...createFieldDto } = body;
    try {
      return await this.fieldService.create(createFieldDto);
    } catch (error) {
      console.log('ERROR CONTROLLER: ' + error);
      throw error;
    }
  }

  @HttpCode(HttpStatus.OK)
  @Get()
  async findAll() {
    try {
      return await this.fieldService.findAll();
    } catch (error) {
      throw error;
    }
  }

  @HttpCode(HttpStatus.OK)
  @Get('byUserId/:id')
  async findFieldByUserId(@Param('id') userId: string) {
    try {
      return await this.fieldService.findFieldByUserId(userId);
    } catch (error) {
      throw error;
    }
  }
  @HttpCode(HttpStatus.OK)
  @Get(':id')
  async findOne(@Param('id') id: string) {
    try {
      return await this.fieldService.findOne(id);
    } catch (error) {
      throw error;
    }
  }

  @HttpCode(HttpStatus.OK)
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateFieldDto: UpdateFieldDto,
  ) {
    try {
      return await this.fieldService.update(id, updateFieldDto);
    } catch (error) {
      throw error;
    }
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  async remove(@Param('id') id: string) {
    try {
      return await this.fieldService.remove(id);
    } catch (error) {
      throw error;
    }
  }
}
