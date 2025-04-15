import { CreateFieldDto } from '../dto/create-field.dto';
import { Injectable, NotFoundException } from '@nestjs/common';
import { UpdateFieldDto } from '../dto/update-field.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Field, Prisma } from '@prisma/client';
import {
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { FieldWithoutMeta } from '../types/field.types';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import { Transactional, TransactionHost } from '@nestjs-cls/transactional';
import { autoConfigField } from 'src/utils/autoConfigField';

@Injectable()
export class FieldRepository {
  constructor(
    private readonly db: PrismaService,
    private readonly txHost: TransactionHost<TransactionalAdapterPrisma>,
  ) {}

  @Transactional<TransactionalAdapterPrisma>({
    isolationLevel: 'Serializable',
    maxWait: 5000,
    timeout: 10000,
  })
  async create(
    createFieldDto: CreateFieldDto,
    // autoConfig: boolean,
  ): Promise<Field> {
    if (
      createFieldDto.production_type === 'bovine_of_milk' ||
      createFieldDto.production_type === 'bovine_of_meat'
    ) {
      return autoConfigField(createFieldDto, this.txHost);
    }
    return this.createFieldWithoutAutoConfig(createFieldDto);
  }

  async createFieldWithoutAutoConfig(
    createFieldDto: CreateFieldDto,
  ): Promise<Field> {
    try {
      const newField = await this.db.field.create({
        data: createFieldDto,
      });
      return newField;
    } catch (error) {
      console.log('ERROR: ' + error);
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new BadRequestException(
            'A field name with this userId already exists.',
          );
        }
        if (error.code === 'P2025') {
          throw new BadRequestException('User not found.');
        }
        if (error.code === 'P2003') {
          throw new BadRequestException('User Id not found.');
        }
      }
      throw new InternalServerErrorException(
        'An unexpected error occurred while creating the field.',
      );
    }
  }

  async findAll(): Promise<Field[]> {
    try {
      const fields = await this.db.field.findMany();
      if (fields.length === 0) throw new NotFoundException('Fields not found');
      return fields;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'An unexpected error occurred while retrieving fields.',
      );
    }
  }

  async findFieldByUserId(userId: string): Promise<FieldWithoutMeta[]> {
    try {
      const fieldsFound = await this.db.field.findMany({
        where: { userId },
        select: {
          id: true,
          name: true,
          description: true,
          location: true,
          latitude: true,
          longitude: true,
          breed: true,
          installation: true,
          production_type: true,
          number_of_animals: true,
        },
      });
      return fieldsFound;
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(
        'An unexpected error occurred while retrieving field.',
      );
    }
  }

  async findOne(
    id: string,
  ): Promise<Omit<Field, 'id' | 'userId' | 'created_at' | 'updated_at'>> {
    try {
      const fieldFound = await this.db.field.findUnique({
        where: { id },
        select: {
          name: true,
          description: true,
          location: true,
          latitude: true,
          longitude: true,
          breed: true,
          installation: true,
          production_type: true,
          number_of_animals: true,
        },
      });
      if (!fieldFound) {
        throw new NotFoundException(`Field with ID ${id} not found`);
      }
      return fieldFound;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'An unexpected error occurred while retrieving field.',
      );
    }
  }

  async update(
    id: string,
    updateFieldDto: UpdateFieldDto,
  ): Promise<Omit<Field, 'id' | 'userId' | 'created_at' | 'updated_at'>> {
    try {
      const updatedField = await this.db.field.update({
        where: { id },
        data: updateFieldDto,
        select: {
          name: true,
          description: true,
          location: true,
          latitude: true,
          longitude: true,
          production_type: true,
          breed: true,
          installation: true,
          number_of_animals: true,
        },
      });
      return updatedField;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        // Registro no encontrado
        if (error.code === 'P2025') {
          throw new NotFoundException(`Field with ID ${id} not found.`);
        }
      }
      throw new InternalServerErrorException(
        'An unexpected error occurred while updating the field.',
      );
    }
  }

  async remove(id: string): Promise<Field> {
    try {
      return await this.db.field.delete({
        where: { id },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException(`Field with ID ${id} not found`);
        }
      }
      throw new InternalServerErrorException(
        'An unexpected error occurred while updating the field.',
      );
    }
  }
}
