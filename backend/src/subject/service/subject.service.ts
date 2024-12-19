import { Injectable } from '@nestjs/common';
import { CreateSubjectDto } from '../dto/create-subject.dto';
import { UpdateSubjectDto } from '../dto/update-subject.dto';
import { Subject } from '@prisma/client';
import { SubjectRepository } from '../repository/subject.repository';

@Injectable()
export class SubjectService {
  constructor(private readonly subjectRepository: SubjectRepository) {}

  async create(
    createSubjectDto: CreateSubjectDto,
    field_id: string,
  ): Promise<Subject> {
    try {
      return await this.subjectRepository.create(createSubjectDto, field_id);
    } catch (error) {
      throw error;
    }
  }

  async findAll(): Promise<Subject[]> {
    try {
      return await this.subjectRepository.findAll();
    } catch (error) {
      throw error;
    }
  }

  async findOne(id: number): Promise<Subject> {
    try {
      return await this.subjectRepository.findOne(id);
    } catch (error) {
      throw error;
    }
  }

  async update(
    id: number,
    updateSubjectDto: UpdateSubjectDto,
  ): Promise<Subject> {
    try {
      return await this.subjectRepository.update(id, updateSubjectDto);
    } catch (error) {
      throw error;
    }
  }

  async remove(id: number): Promise<Subject> {
    try {
      return await this.subjectRepository.remove(id);
    } catch (error) {
      throw error;
    }
  }
}
