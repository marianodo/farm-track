import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreatePenDto } from '../dto/create-pen.dto';
import { UpdatePenDto } from '../dto/update-pen.dto';
import { PrismaService } from 'src/prisma/prisma.service';

import { Prisma } from '@prisma/client';
import { PenVariableTypeOfObjectRepository } from 'src/pen_variable_type-of-object/repository/pen_variable_type-of-object.repository';

@Injectable()
export class PenRepository {
  constructor(
    private readonly db: PrismaService,
    private readonly penVariableTypeOfObjectRepository: PenVariableTypeOfObjectRepository,
  ) {}

  async create(createPenDto: CreatePenDto) {
    const { type_of_object_ids, ...penData } = createPenDto;
    
    console.log('🔧 Creating pen with data:', { penData, type_of_object_ids });
    
    try {
      const result = await this.db.$transaction(async (prisma) => {
        // VALIDACIÓN: Verificar que todos los typeOfObjectId existan antes de crear
        if (type_of_object_ids?.length) {
          console.log('🔍 Validating TypeOfObject IDs:', type_of_object_ids);
          
          const existingTypeOfObjects = await prisma.typeOfObject.findMany({
            where: {
              id: {
                in: type_of_object_ids
              }
            },
            select: { id: true, name: true, userId: true }
          });
          
          console.log('✅ Found existing TypeOfObjects:', existingTypeOfObjects);
          
          const existingIds = existingTypeOfObjects.map(obj => obj.id);
          const missingIds = type_of_object_ids.filter(id => !existingIds.includes(id));
          
          if (missingIds.length > 0) {
            console.error('❌ Missing TypeOfObject IDs:', missingIds);
            throw new BadRequestException(
              `The following TypeOfObject IDs do not exist: ${missingIds.join(', ')}. Please verify that all objects exist before creating the pen.`
            );
          }
        }

        // Crear el Pen
        const newPen = await prisma.pen.create({
          data: {
            ...penData,
          },
        });

        // Crear las asociaciones de type_of_objects si existen
        if (type_of_object_ids?.length) {
          await prisma.penTypeOfObject.createMany({
            data: type_of_object_ids.map((typeOfObjectId) => ({
              penId: newPen.id,
              typeOfObjectId: typeOfObjectId,
            })),
          });
        }

        return newPen;
      });

      for (const typeOfObjectId of type_of_object_ids) {
        // Obtener las variables asociadas a typeOfObjectId
        const variables = await this.db.typeOfObject_Variable.findMany({
          where: { type_of_object_id: typeOfObjectId },
          include: { variable: true },
        });

        // Crear las entradas en pen_variable_type-of-objects
        for (const { variable } of variables) {
          await this.penVariableTypeOfObjectRepository.create({
            penId: result.id,
            variableId: variable.id,
            typeOfObjectId: typeOfObjectId,
            custom_parameters: variable.defaultValue,
          });
        }
      }
      return result;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        // Manejar error de unicidad (código P2002)
        if (error.code === 'P2002') {
          console.log('20000002:', error);
          throw new BadRequestException(
            'A pen name with this fieldId already exists.',
          );
        }

        // Error de referencia de la relacion o registro no encontrado
        if (error.code === 'P2025') {
          console.log('20255555:', error);
          const cause = error.meta?.cause as string;
          if (cause.includes("No 'TypeOfObject' record(s)")) {
            throw new BadRequestException(
              `The TypeOfObject you're trying to associate does not exist. Please verify that the object exists before making the association.`,
            );
          } else {
            throw new BadRequestException('Field not found.');
          }
        }
        if (error.code === 'P2003') {
          console.log('❌ P2003 Foreign Key Constraint Error:', error);
          
          const fieldName = error.meta?.field_name as string;
          
          if (fieldName?.includes('PenTypeOfObject_typeOfObjectId_fkey')) {
            throw new BadRequestException(
              `One or more TypeOfObject IDs do not exist in the database. Please verify that all object types exist before creating the pen.`
            );
          }
          
          if (fieldName?.includes('fieldId')) {
            throw new BadRequestException('The specified Field ID does not exist.');
          }
          
          throw new BadRequestException(
            `Foreign key constraint violation: ${fieldName || 'Unknown relation'}`
          );
        }
      }
      throw new Error(`Failed to create pen: ${error.message}`);
    }
  }

  async findAllByFieldId(
    fieldId: string,
    withFieldsBool: boolean,
    withObjectsBool: boolean,
  ) {
    try {
      const pensFound = await this.db.pen.findMany({
        where: { fieldId },
        include: {
          field: withFieldsBool,
          type_of_objects: withObjectsBool
            ? {
                select: {
                  type_of_object: {
                    select: {
                      id: true,
                      name: true,
                    },
                  },
                },
              }
            : false,
        },
      });
      if (pensFound.length) {
        return pensFound.map((pen) => ({
          ...pen,
          type_of_objects:
            pen.type_of_objects?.map((obj) => ({
              id: obj['type_of_object'].id,
              name: obj['type_of_object'].name,
            })) || [],
        }));
      }
      return pensFound;
      // throw new NotFoundException(`No pens found with fieldId ${fieldId}`);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new Error(
        `Failed to find pens by fieldId ${fieldId}: ${error.message}`,
      );
    }
  }

  async findOne(id: number, withFieldsBool: boolean, withObjectsBool: boolean) {
    try {
      const penFound = await this.db.pen.findUnique({
        where: { id },
        include: {
          field: withFieldsBool,
          type_of_objects: withObjectsBool
            ? {
                select: {
                  type_of_object: {
                    select: {
                      id: true,
                      name: true,
                    },
                  },
                },
              }
            : false,
        },
      });
      if (!penFound) {
        throw new NotFoundException(`Variable with ID ${id} not found`);
      }

      return {
        id: penFound.id,
        name: penFound.name,
        fieldId: penFound.fieldId,
        field: penFound.field,
        type_of_objects:
          penFound.type_of_objects?.map((obj) => ({
            id: obj['type_of_object'].id,
            name: obj['type_of_object'].name,
          })) || [],
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new Error(`Failed to find pen with id ${id}: ${error.message}`);
    }
  }

  async update(id: number, updatePenDto: UpdatePenDto) {
    const { type_of_object_ids, ...updateData } = updatePenDto;
    try {
      const result = await this.db.$transaction(async (prisma) => {
        // Obtener las relaciones anteriores
        const previousTypeOfObjects = await prisma.penTypeOfObject.findMany({
          where: { penId: id },
          select: { typeOfObjectId: true },
        });

        // Actualizar el Pen
        const updatedPen = await prisma.pen.update({
          where: { id },
          data: {
            ...updateData,
          },
        });

        // Obtener los type_of_object_ids que no estan en la lista actualizada
        const typeOfObjectsToDelete = previousTypeOfObjects
          .map((obj) => obj.typeOfObjectId)
          .filter((id) => !type_of_object_ids.includes(id));

        // Borrar los registros en pen_variable_type-of-objects para los type_of_object_ids eliminados
        for (const typeOfObjectId of typeOfObjectsToDelete) {
          await this.penVariableTypeOfObjectRepository.deleteByPenIdAndTypeOfObjectId(
            id,
            typeOfObjectId,
          );
          await this.db.penTypeOfObject.deleteMany({
            where: {
              penId: id,
              typeOfObjectId: typeOfObjectId,
            },
          });
        }
        //verficiar si hay type_of_object_ids para agregar
        if (type_of_object_ids?.length) {
          // Obtener los type_of_object_ids que se agregaron
          const typeOfObjectsToAdd = type_of_object_ids.filter(
            (typeOfObjectId) => {
              const exists = previousTypeOfObjects.some(
                (obj) => obj.typeOfObjectId === typeOfObjectId,
              );
              console.log(
                `Checking if ${typeOfObjectId} exists in previousTypeOfObjects:`,
                exists,
              );
              return !exists;
            },
          );

          if (typeOfObjectsToAdd.length > 0) {
            // Crear nuevos registros en pen_variable_type-of-objects para los type_of_object_ids agregados
            for (const typeOfObjectId of typeOfObjectsToAdd) {
              // Crear la asociación en penTypeOfObject
              await this.db.penTypeOfObject.create({
                data: {
                  penId: id,
                  typeOfObjectId: typeOfObjectId,
                },
              });

              // Obtener las variables asociadas a typeOfObjectId
              const variables = await this.db.typeOfObject_Variable.findMany({
                where: { type_of_object_id: typeOfObjectId },
                include: { variable: true },
              });

              for (const { variable } of variables) {
                // verificar si el registro existe
                const existingEntry =
                  await this.db.penVariableTypeOfObject.findUnique({
                    where: {
                      penId_variableId_typeOfObjectId: {
                        penId: id,
                        variableId: variable.id,
                        typeOfObjectId: typeOfObjectId,
                      },
                    },
                  });

                if (!existingEntry) {
                  await this.penVariableTypeOfObjectRepository.create({
                    penId: id,
                    variableId: variable.id,
                    typeOfObjectId: typeOfObjectId,
                    custom_parameters: variable.defaultValue,
                  });
                }
              }
            }
          }
        }

        return updatedPen;
      });

      return result;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictException(
            `A pen with that ${error.meta.target[0]}: '${updatePenDto[error.meta.target[0]]}' already exists`,
          );
        }
        if (error.code === 'P2025') {
          throw new NotFoundException(
            `The type_of_objects you're trying to associate does not exist. Please verify that the object exists before making the association.`,
          );
        }
        if (
          error.code === 'P2003' &&
          error.meta?.modelName === 'PenTypeOfObject'
        ) {
          throw new BadRequestException(
            `The TypeOfObject you're trying to associate does not exist. Please verify that the object exists before making the association.`,
          );
        }
      }
      console.log('ERROR:', error);
      throw new InternalServerErrorException(
        'An unexpected error occurred while updating the variable.',
      );
    }
  }

  async remove(id: number) {
    try {
      return await this.db.pen.delete({ where: { id } });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException(`Variable with ID ${id} not found`);
        }
      }
      throw new InternalServerErrorException(
        'An unexpected error occurred while remove the variable.',
      );
    }
  }
}
