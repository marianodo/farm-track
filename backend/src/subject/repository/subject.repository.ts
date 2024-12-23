import { PrismaService } from 'src/prisma/prisma.service';
import { Subject, Prisma } from '@prisma/client';
import { CreateSubjectDto } from '../dto/create-subject.dto';
import { UpdateSubjectDto } from '../dto/update-subject.dto';
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';

@Injectable()
export class SubjectRepository {
  constructor(private readonly db: PrismaService) {}

  async create(
    createSubjectDto: CreateSubjectDto,
    field_id: string,
  ): Promise<Subject> {
    try {
      return await this.db.$transaction(async (prisma) => {
        //consultar ultimo reporte por id de campo
        const lastSubject = await prisma.subject.findFirst({
          where: { field_id: field_id },
          orderBy: { correlative_id: 'desc' },
        });
        // Calcular el siguiente ID
        const nextId = lastSubject ? lastSubject.correlative_id + 1 : 1;
        const newSubject = {
          ...createSubjectDto,
          correlative_id: nextId,
          field_id: field_id,
        };
        return await this.db.subject.create({
          data: newSubject,
        });
      });
    } catch (error) {
      console.log('ERROR:', error);
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          // Código de error para violaciones de restricciones únicas
          throw new BadRequestException(
            'A report with this ID already exists for the field.',
          );
        }
      }

      throw new InternalServerErrorException(
        'An unexpected error occurred while creating the report.',
      );
    }
  }

  async findAll(): Promise<Subject[]> {
    try {
      const subjects = await this.db.subject.findMany();
      if (subjects.length === 0)
        throw new NotFoundException('Subjects not found');
      return subjects;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'An unexpected error occurred while retrieving subjects.',
      );
    }
  }

  async findOne(id: number): Promise<Subject> {
    try {
      const subject = await this.db.subject.findUnique({
        where: { id },
      });
      if (!subject) {
        throw new NotFoundException(`Subject with ID ${id} not found`);
      }
      return subject;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'An unexpected error occurred while retrieving the subject.',
      );
    }
  }

  async update(
    id: number,
    updateSubjectDto: UpdateSubjectDto,
  ): Promise<Subject> {
    try {
      const updatedSubject = await this.db.subject.update({
        where: { id },
        data: updateSubjectDto,
      });
      return updatedSubject;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException(`Subject with ID ${id} not found.`);
        }
      }
      throw new InternalServerErrorException(
        'An unexpected error occurred while updating the subject.',
      );
    }
  }

  async remove(id: number): Promise<Subject> {
    try {
      return await this.db.subject.delete({
        where: { id },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException(`Subject with ID ${id} not found`);
        }
      }
      throw new InternalServerErrorException(
        'An unexpected error occurred while deleting the subject.',
      );
    }
  }
}
