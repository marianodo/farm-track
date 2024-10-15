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
  Query,
} from '@nestjs/common';
import { PenService } from '../service/pen.service';
import { CreatePenDto } from '../dto/create-pen.dto';
import { UpdatePenDto } from '../dto/update-pen.dto';

@Controller('pens')
export class PenController {
  constructor(private readonly penService: PenService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createPenDto: CreatePenDto) {
    try {
      return await this.penService.create(createPenDto);
    } catch (error) {
      throw error;
    }
  }

  @Get('byField/:fieldId')
  @HttpCode(HttpStatus.OK)
  async findAll(
    @Param('fieldId') fieldId: string,
    @Query('withFields') withFields: string,
    @Query('withObjects') withObjects: string,
  ) {
    try {
      const withFieldsBool = withFields === 'false' ? false : true;
      const withObjectsBool = withObjects === 'false' ? false : true;
      return await this.penService.findAllByFieldId(
        fieldId,
        withFieldsBool,
        withObjectsBool,
      );
    } catch (error) {
      throw error;
    }
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async findOne(
    @Param('id') id: string,
    @Query('withFields') withFields: string,
    @Query('withObjects') withObjects: string,
  ) {
    try {
      const withFieldsBool = withFields === 'false' ? false : true;
      const withObjectsBool = withObjects === 'false' ? false : true;
      return await this.penService.findOne(
        +id,
        withFieldsBool,
        withObjectsBool,
      );
    } catch (error) {
      throw error;
    }
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  async update(@Param('id') id: string, @Body() updatePenDto: UpdatePenDto) {
    try {
      return await this.penService.update(+id, updatePenDto);
    } catch (error) {
      throw error;
    }
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    try {
      return await this.penService.remove(+id);
    } catch (error) {
      throw error;
    }
  }
}
