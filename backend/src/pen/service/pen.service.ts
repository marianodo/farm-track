import { Injectable } from '@nestjs/common';
import { CreatePenDto } from '../dto/create-pen.dto';
import { UpdatePenDto } from '../dto/update-pen.dto';
import { PenRepository } from '../repository/pen.repository';

@Injectable()
export class PenService {
  constructor(private readonly penRepository: PenRepository) {}

  async create(createPenDto: CreatePenDto) {
    try {
      return await this.penRepository.create(createPenDto);
    } catch (error) {
      throw error;
    }
  }

  async findAll(withFieldsBool: boolean, withObjectsBool: boolean) {
    try {
      return await this.penRepository.findAll(withFieldsBool, withObjectsBool);
    } catch (error) {
      throw error;
    }
  }

  async findOne(id: number, withFieldsBool: boolean, withObjectsBool: boolean) {
    try {
      return await this.penRepository.findOne(
        id,
        withFieldsBool,
        withObjectsBool,
      );
    } catch (error) {
      throw error;
    }
  }

  async update(id: number, updatePenDto: UpdatePenDto) {
    try {
      return await this.penRepository.update(id, updatePenDto);
    } catch (error) {
      throw error;
    }
  }

  async remove(id: number) {
    try {
      return await this.penRepository.remove(id);
    } catch (error) {
      throw error;
    }
  }
}
