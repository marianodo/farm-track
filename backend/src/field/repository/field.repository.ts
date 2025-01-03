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
import { fieldConfigurations } from 'src/utils/field-config';
import { TypeOfObjectsService } from 'src/type_of_objects/service/type_of_objects.service';

@Injectable()
export class FieldRepository {
  constructor(
    private readonly db: PrismaService,
    private readonly typeOfObjectService: TypeOfObjectsService,
  ) {}

  async create(
    createFieldDto: CreateFieldDto,
    autoConfig: boolean,
  ): Promise<Field> {
    console.log('autoConfig: ' + autoConfig);
    if (autoConfig) {
      return this.createFieldWithAutoConfig(createFieldDto);
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

  async createFieldWithAutoConfig(createFieldDto: CreateFieldDto) {
    const { production_type, userId } = createFieldDto;
    const fieldType = fieldConfigurations[production_type.toLowerCase()];

    if (!fieldType) {
      throw new BadRequestException(
        `No configuration found for field type: ${production_type}`,
      );
    }

    try {
      return this.db.$transaction(async (transaction) => {
        // Crear el campo
        const newField = await transaction.field.create({
          data: createFieldDto,
        });

        const typeOfObjectsPromise =
          this.typeOfObjectService.createTypesOfObjects(
            fieldType,
            userId,
            transaction,
          );

        await Promise.all([typeOfObjectsPromise]);

        return newField;
      });
    } catch (error) {
      // Manejo de errores por tipo de código de error de Prisma
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

  // async create(createFieldDto: CreateFieldDto): Promise<Field> {
  //   const { name, userId, autoConfig } = createFieldDto;
  //   if (autoConfig) {
  //     const config = fieldConfigurations[name.toLowerCase()];
  //     if (!config) {
  //       throw new BadRequestException(
  //         `No configuration found for field type: ${name}`,
  //       );
  //     }
  //     try {
  //       // 1. Crear el campo
  //       const newField = await this.db.field.create({
  //         data: createFieldDto,
  //       });

  //       // 2. Crear los tipos de objetos
  //       const createdTypesOfObjects = {};
  //       for (const type of config.typesOfObjects) {
  //         const createdType = await this.db.typeOfObject.create({
  //           data: {
  //             name: type.name,
  //             user: { connect: { id: userId } },
  //           },
  //         });
  //         createdTypesOfObjects[type.name] = createdType.id; // Mapear nombre a ID
  //       }

  //       // 3. Crear las variables
  //       for (const variable of config.variables) {
  //         const associatedTypeOfObjectId =
  //           createdTypesOfObjects[variable.associatedTypeOfObject];
  //         if (!associatedTypeOfObjectId) {
  //           throw new InternalServerErrorException(
  //             `Associated type of object ${variable.associatedTypeOfObject} not found.`,
  //           );
  //         }

  //         const createdVariable = await this.db.variable.create({
  //           data: {
  //             name: variable.name,
  //             type: variable.type,
  //             defaultValue: variable.defaultValue,
  //             user: { connect: { id: userId } },
  //             type_of_objects: {
  //               create: [
  //                 {
  //                   type_of_object: {
  //                     connect: { id: associatedTypeOfObjectId },
  //                   },
  //                 },
  //               ],
  //             },
  //           },
  //         });

  //         // Crear combinaciones únicas de PenVariableTypeOfObject
  //         const uniqueCombinations = await this.findUniqueCombinations([
  //           associatedTypeOfObjectId,
  //         ]);

  //         for (const combination of uniqueCombinations) {
  //           await this.db.penVariableTypeOfObject.create({
  //             data: {
  //               penId: combination.penId,
  //               variableId: createdVariable.id,
  //               typeOfObjectId: associatedTypeOfObjectId,
  //               custom_parameters: createdVariable.defaultValue,
  //             },
  //           });
  //         }
  //       }

  //       return newField;
  //     } catch (error) {
  //       if (error instanceof Prisma.PrismaClientKnownRequestError) {
  //         // Manejar error de unicidad (código P2002)
  //         if (error.code === 'P2002') {
  //           throw new BadRequestException(
  //             'A field name with this userId already exists.',
  //           );
  //         }

  //         // Error de referencia de la relacion o registro no encontrado
  //         if (error.code === 'P2025') {
  //           throw new BadRequestException('User not found.');
  //         }
  //         if (error.code === 'P2003') {
  //           throw new BadRequestException('User Id not found.');
  //         }
  //       }
  //       // Cualquier otro error no manejado
  //       throw new InternalServerErrorException(
  //         'An unexpected error occurred while creating the field.',
  //       );
  //     }
  //   }
  //   try {
  //     const newField = await this.db.field.create({
  //       data: createFieldDto,
  //     });
  //     return newField;
  //   } catch (error) {
  //     if (error instanceof Prisma.PrismaClientKnownRequestError) {
  //       // Manejar error de unicidad (código P2002)
  //       if (error.code === 'P2002') {
  //         throw new BadRequestException(
  //           'A field name with this userId already exists.',
  //         );
  //       }

  //       // Error de referencia de la relacion o registro no encontrado
  //       if (error.code === 'P2025') {
  //         throw new BadRequestException('User not found.');
  //       }
  //       if (error.code === 'P2003') {
  //         throw new BadRequestException('User Id not found.');
  //       }
  //     }
  //     // Cualquier otro error no manejado
  //     throw new InternalServerErrorException(
  //       'An unexpected error occurred while creating the field.',
  //     );
  //   }
  // }

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
