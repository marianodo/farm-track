import { Injectable } from '@nestjs/common';
import { CreateTypeOfObjectDto } from '../dto/create-type_of_object.dto';
import { UpdateTypeOfObjectDto } from '../dto/update-type_of_object.dto';
import { TypeOfObjectsRepository } from '../repository/type_of_objects.repository';

@Injectable()
export class TypeOfObjectsService {
  constructor(
    private readonly typeOfObjectsRepository: TypeOfObjectsRepository,
  ) {}
  async create(userId: string, createTypeOfObjectDto: CreateTypeOfObjectDto) {
    return await this.typeOfObjectsRepository.create(
      userId,
      createTypeOfObjectDto,
    );
  }

  async findAll() {
    try {
      return await this.typeOfObjectsRepository.findAll();
    } catch (error) {
      throw error;
    }
  }

  async findAllByUserId(byUserId: string) {
    try {
      return await this.typeOfObjectsRepository.findAllByUserId(byUserId);
    } catch (error) {
      throw error;
    }
  }

  async findOne(id: number) {
    try {
      return await this.typeOfObjectsRepository.findOne(id);
    } catch (error) {
      throw error;
    }
  }

  async update(id: number, updateTypeOfObjectDto: UpdateTypeOfObjectDto) {
    try {
      return await this.typeOfObjectsRepository.update(
        id,
        updateTypeOfObjectDto,
      );
    } catch (error) {
      throw error;
    }
  }

  async remove(id: number) {
    try {
      return await this.typeOfObjectsRepository.remove(id);
    } catch (error) {
      throw error;
    }
  }
}
