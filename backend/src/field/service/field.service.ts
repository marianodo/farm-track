import { CreateFieldDto } from '../dto/create-field.dto';
import { Injectable } from '@nestjs/common';
import { UpdateFieldDto } from '../dto/update-field.dto';
import { FieldRepository } from '../repository/field.repository';
import { Field } from '@prisma/client';
import { FieldWithoutMeta } from '../types/field.types';

@Injectable()
export class FieldService {
  constructor(private readonly fieldRepository: FieldRepository) {}

  async create(createFieldDto: CreateFieldDto): Promise<Field> {
    try {
      return await this.fieldRepository.create(createFieldDto);
    } catch (error) {
      throw error;
    }
  }

  async findAll(): Promise<Field[]> {
    try {
      return await this.fieldRepository.findAll();
    } catch (error) {
      throw error;
    }
  }

  async findFieldByUserId(userId: string): Promise<FieldWithoutMeta[]> {
    try {
      const field = await this.fieldRepository.findFieldByUserId(userId);
      return field;
    } catch (error) {
      throw error;
    }
  }
  async findOne(
    id: string,
  ): Promise<Omit<Field, 'id' | 'userId' | 'created_at' | 'updated_at'>> {
    try {
      const field = await this.fieldRepository.findOne(id);
      return field;
    } catch (error) {
      throw error;
    }
  }

  async update(
    id: string,
    updateFieldDto: UpdateFieldDto,
  ): Promise<Omit<Field, 'id' | 'userId' | 'created_at' | 'updated_at'>> {
    try {
      return await this.fieldRepository.update(id, updateFieldDto);
    } catch (error) {
      throw error;
    }
  }

  async remove(id: string) {
    try {
      return await this.fieldRepository.remove(id);
    } catch (error) {
      throw error;
    }
  }
}
