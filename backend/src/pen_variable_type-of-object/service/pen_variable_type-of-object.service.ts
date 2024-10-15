import { Injectable } from '@nestjs/common';
import { CreatePenVariableTypeOfObjectDto } from '../dto/create-pen_variable_type-of-object.dto';
import { UpdatePenVariableTypeOfObjectDto } from '../dto/update-pen_variable_type-of-object.dto';
import { PenVariableTypeOfObjectRepository } from '../repository/pen_variable_type-of-object.repository';

@Injectable()
export class PenVariableTypeOfObjectService {
  constructor(
    private readonly penVariableTypeOfObjectRepository: PenVariableTypeOfObjectRepository,
  ) {}

  async create(
    createPenVariableTypeOfObjectDto: CreatePenVariableTypeOfObjectDto,
  ) {
    try {
      return await this.penVariableTypeOfObjectRepository.create(
        createPenVariableTypeOfObjectDto,
      );
    } catch (error) {
      throw error;
    }
  }

  async findAll() {
    try {
      return await this.penVariableTypeOfObjectRepository.findAll();
    } catch (error) {
      throw error;
    }
  }

  async findOne(penId: number, variableId: number, typeOfObjectId: number) {
    try {
      return await this.penVariableTypeOfObjectRepository.findOne(
        penId,
        variableId,
        typeOfObjectId,
      );
    } catch (error) {
      throw error;
    }
  }

  async update(
    penId: number,
    variableId: number,
    typeOfObjectId: number,
    updatePenVariableTypeOfObjectDto: UpdatePenVariableTypeOfObjectDto,
  ) {
    try {
      return await this.penVariableTypeOfObjectRepository.update(
        penId,
        variableId,
        typeOfObjectId,
        updatePenVariableTypeOfObjectDto,
      );
    } catch (error) {
      throw error;
    }
  }

  async remove(penId: number, variableId: number, typeOfObjectId: number) {
    try {
      return await this.penVariableTypeOfObjectRepository.remove(
        penId,
        variableId,
        typeOfObjectId,
      );
    } catch (error) {
      throw error;
    }
  }

  async findByTypeOfObjectId(typeOfObjectId: number, withVariableBool) {
    try {
      return await this.penVariableTypeOfObjectRepository.findByTypeOfObjectId(
        typeOfObjectId,
        withVariableBool,
      );
    } catch (error) {
      throw error;
    }
  }
}
