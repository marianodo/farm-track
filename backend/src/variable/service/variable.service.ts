import { CreateVariableDto } from '../dto/create-variable.dto';
import { Injectable } from '@nestjs/common';
import { UpdateVariableDto } from '../dto/update-variable.dto';
import { VariableRepository } from '../repository/variable.repository';

@Injectable()
export class VariableService {
  constructor(private readonly variableRepository: VariableRepository) {}
  async create(createVariableDto: CreateVariableDto) {
    try {
      return await this.variableRepository.create(createVariableDto);
    } catch (error) {
      throw error;
    }
  }

  async findVariablesByTypeObjectId(id: number) {
    try {
      return await this.variableRepository.findVariablesByTypeObjectId(id);
    } catch (error) {
      throw error;
    }
  }

  async findAll() {
    try {
      return await this.variableRepository.findAll();
    } catch (error) {
      throw error;
    }
  }

  async findOne(id: number) {
    try {
      return await this.variableRepository.findOne(id);
    } catch (error) {
      throw error;
    }
  }

  async update(id: number, updateVariableDto: UpdateVariableDto) {
    try {
      return await this.variableRepository.update(id, updateVariableDto);
    } catch (error) {
      throw error;
    }
  }

  async remove(id: number) {
    try {
      return await this.variableRepository.remove(id);
    } catch (error) {
      throw error;
    }
  }
}
