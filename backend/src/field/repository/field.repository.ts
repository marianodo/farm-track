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
          dashboard_url: true,
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

  async getFieldDataset(fieldId: string) {
    console.log(`[FieldRepository] Getting dataset for field ID: ${fieldId}`);
    
    try {
      // First verify the field exists
      console.log('[FieldRepository] Verifying field exists...');
      const fieldExists = await this.db.field.findUnique({
        where: { id: fieldId },
        select: { id: true },
      });

      if (!fieldExists) {
        console.log(`[FieldRepository] Field with ID ${fieldId} not found`);
        throw new NotFoundException(`Field with ID ${fieldId} not found`);
      }

      console.log('[FieldRepository] Field exists, executing query...');
      
      // Execute the raw SQL query
      const query = `
        SELECT
          m.subject_id as "subjectId",
          too.name as "typeOfObject",
          v.name as variable,
          m.value as "measuredValue",
          p.name as "penName",
          f.name as "fieldName",
          m.report_id as "reportId",
          r.name as "reportName",
          r.created_at as "reportDate",
          m.created_at as "measureDate"
        FROM "Measurement" m
        JOIN "PenVariableTypeOfObject" pvtoo ON pvtoo.id = m.pen_variable_type_of_object_id
        JOIN "Variable" v ON pvtoo."variableId" = v.id
        JOIN "Report" r ON m.report_id = r.id
        JOIN "Pen" p ON pvtoo."penId" = p.id
        JOIN "TypeOfObject" too ON pvtoo."typeOfObjectId" = too.id
        JOIN "Field" f ON f.id = r.field_id
        WHERE r.field_id = $1
        ORDER BY m.created_at DESC
      `;
      console.log('[FieldRepository] Executing query:', query);
      const measurements = await this.db.$queryRawUnsafe(query, fieldId);
      return measurements;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'An unexpected error occurred while retrieving field dataset.',
      );
    }
  }

  async getCategoricalMeasurementsByFieldId(fieldId: string) {
    console.log(`[FieldRepository] Getting dataset for field ID: ${fieldId}`);
    
    try {
      // First verify the field exists
      console.log('[FieldRepository] Verifying field exists...');
      const fieldExists = await this.db.field.findUnique({
        where: { id: fieldId },
        select: { id: true },
      });

      if (!fieldExists) {
        console.log(`[FieldRepository] Field with ID ${fieldId} not found`);
        throw new NotFoundException(`Field with ID ${fieldId} not found`);
      }

      console.log('[FieldRepository] Field exists, executing query...');
      
      // Execute the raw SQL query
      const query = `
        SELECT
        m.subject_id,
        too.name AS type_of_object,
        v.name AS variable,
        m.value AS measured_value,
        p.name AS pen_name,
        f.name AS field_name,
        m.report_id AS report_id,
        r.name AS report_name,
        r.created_at AS report_date,
        string_to_array(TRIM(BOTH '[]' FROM (pvtoo.custom_parameters -> 'value' ->> 'categories')), ',') AS categories,
        string_to_array(TRIM(BOTH '[]' FROM REPLACE((pvtoo.custom_parameters -> 'value' ->> 'optimal_values'), '"', '')), ',') AS optimal_values,
        CASE
          WHEN LOWER(TRIM(m.value)) IN (SELECT TRIM(LOWER(unnest(string_to_array(TRIM(BOTH '[]' FROM REPLACE((pvtoo.custom_parameters -> 'value' ->> 'optimal_values'), '"', '')), ','))))) THEN 1
          ELSE 0
        END AS correct
      FROM "Measurement" m
      JOIN "PenVariableTypeOfObject" pvtoo ON pvtoo.id = m.pen_variable_type_of_object_id
      JOIN "Variable" v ON pvtoo."variableId" = v.id
      JOIN "Report" r ON m.report_id = r.id
      JOIN "Pen" p ON pvtoo."penId" = p.id
      JOIN "TypeOfObject" too ON pvtoo."typeOfObjectId" = too.id
      JOIN "Field" f ON f.id = r.field_id
      WHERE v.type = 'CATEGORICAL'
      AND r.field_id = $1;
      `;
      console.log('[FieldRepository] Executing query:', query);
      const measurements = await this.db.$queryRawUnsafe(query, fieldId);
      return measurements;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'An unexpected error occurred while retrieving field dataset.',
      );
    }
  }

  async getNumericalMeasurementsByFieldId(fieldId: string) {
    console.log(`[FieldRepository] Getting dataset for field ID: ${fieldId}`);
    
    try {
      // First verify the field exists
      const fieldExists = await this.db.field.findUnique({
        where: { id: fieldId },
        select: { id: true },
      });

      if (!fieldExists) {
        console.log(`[FieldRepository] Field with ID ${fieldId} not found`);
        throw new NotFoundException(`Field with ID ${fieldId} not found`);
      }

      console.log('[FieldRepository] Field exists, executing query...');
      
      // Execute the raw SQL query
      const query = `
        SELECT 
        m.subject_id ,
        too.name as type_of_object,
        v.name as variable,
        m.value as measured_value,
        p.name as pen_name,
        f.name as field_name,
        m.report_id as report_id,
        r.name as report_name,
        r.created_at as report_date,
        pvtoo.custom_parameters -> 'value' ->> 'max' AS max_value,
        pvtoo.custom_parameters -> 'value' ->> 'min' AS min_value,
        pvtoo.custom_parameters -> 'value' ->> 'optimal_max' AS optimo_max,
        pvtoo.custom_parameters -> 'value' ->> 'optimal_min' AS optimo_min
        FROM "Measurement" m 
        join "PenVariableTypeOfObject" pvtoo on pvtoo.id = m.pen_variable_type_of_object_id
        join "Variable" v on pvtoo."variableId" = v.id
        join "Report" r on m.report_id = r.id
        join "Pen" p on pvtoo."penId" = p.id
        join "TypeOfObject" too on pvtoo."typeOfObjectId" = too.id
        join "Field" f on f.id = r.field_id
        where r.field_id = $1
      `;
      console.log('[FieldRepository] Executing query:', query);
      const measurements = await this.db.$queryRawUnsafe(query, fieldId);
      return measurements;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'An unexpected error occurred while retrieving field dataset.',
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
          dashboard_url: true,
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
          dashboard_url: true,
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
