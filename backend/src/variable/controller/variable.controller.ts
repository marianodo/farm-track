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
import { VariableService } from '../service/variable.service';
import { CreateVariableDto } from '../dto/create-variable.dto';
import { UpdateVariableDto } from '../dto/update-variable.dto';

@Controller('variables')
export class VariableController {
  constructor(private readonly variableService: VariableService) {}

  @HttpCode(HttpStatus.CREATED)
  @Post(':userId')
  async create(
    @Param('userId') userId: string,
    @Body() createVariableDto: CreateVariableDto,
  ) {
    try {
      return await this.variableService.create(userId, createVariableDto);
    } catch (error) {
      throw error;
    }
  }

  @HttpCode(HttpStatus.OK)
  @Get('uniqueCombinations')
  async findUniqueCombinations(
    @Body('typeOfObjectIds') typeOfObjectIds: number[],
  ) {
    try {
      const result =
        await this.variableService.findUniqueCombinations(typeOfObjectIds);

      return result;
    } catch (error) {
      throw error;
    }
  }

  @HttpCode(HttpStatus.OK)
  @Get()
  async findAll() {
    try {
      return await this.variableService.findAll();
    } catch (error) {
      throw error;
    }
  }

  @HttpCode(HttpStatus.OK)
  @Get('byUser/:byUserId')
  async findAllByUserId(@Param('byUserId') byUserId: string) {
    try {
      return await this.variableService.findAllByUserId(byUserId);
    } catch (error) {
      throw error;
    }
  }

  @HttpCode(HttpStatus.OK)
  @Get('byObjectId/:id')
  async findVariablesByTypeObjectId(@Param('id') id: string) {
    try {
      return await this.variableService.findVariablesByTypeObjectId(+id);
    } catch (error) {
      throw error;
    }
  }

  @HttpCode(HttpStatus.OK)
  @Get(':id')
  async findOne(@Param('id') id: string) {
    try {
      return await this.variableService.findOne(+id);
    } catch (error) {
      throw error;
    }
  }

  @HttpCode(HttpStatus.OK)
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateVariableDto: UpdateVariableDto,
  ) {
    try {
      return await this.variableService.update(+id, updateVariableDto);
    } catch (error) {
      throw error;
    }
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  async remove(@Param('id') id: string) {
    try {
      return await this.variableService.remove(+id);
    } catch (error) {
      throw error;
    }
  }
}
