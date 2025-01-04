import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, TypeOfObject } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateTypeOfObjectDto } from '../dto/create-type_of_object.dto';
import { UpdateTypeOfObjectDto } from '../dto/update-type_of_object.dto';
import prismaMiddleware from 'prisma/prisma.extensions';
import { PenVariableTypeOfObjectRepository } from 'src/pen_variable_type-of-object/repository/pen_variable_type-of-object.repository';
import { FieldConfig } from 'src/utils/field-config';
import { VariableService } from 'src/variable/service/variable.service';

@Injectable()
export class TypeOfObjectsRepository {
  constructor(
    private readonly db: PrismaService,
    private readonly penVariableTypeOfObjectRepository: PenVariableTypeOfObjectRepository,
    private readonly variableService: VariableService,
  ) {}

  async create(userId: string, createTypeOfObjectDto: CreateTypeOfObjectDto) {
    try {
      return await this.db.typeOfObject.create({
        data: {
          ...createTypeOfObjectDto,
          user: {
            connect: { id: userId },
          },
          // Solo se crean las relaciones con variables si se pasan variables
          variables: createTypeOfObjectDto.variables?.length
            ? {
                create: createTypeOfObjectDto.variables.map((variableId) => ({
                  variable: {
                    connect: { id: variableId },
                  },
                })),
              }
            : undefined,
        },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2003') {
          throw new NotFoundException(
            `One or more Variable IDs in ${createTypeOfObjectDto.variables} not found`,
          );
        }
        if (error.code === 'P2002') {
          throw new ConflictException(
            `A Type_of_object with that ${error.meta.target[0]}: '${createTypeOfObjectDto[error.meta.target[0]]}' already exists`,
          );
        }
        if (error.code === 'P2025') {
          throw new NotFoundException(
            `The variables you're trying to associate does not exist. Please verify that the object exists before making the association.`,
          );
        }
      }

      throw new InternalServerErrorException(
        'An unexpected error occurred while creating the type_of_object.',
      );
    }
  }

  async createTypesOfObjects(
    fieldConfig: FieldConfig,
    userId: string,
    transaction: any,
  ) {
    try {
      // Obtener los tipos de objetos existentes
      const existingTypes = await transaction.tx.typeOfObject.findMany({
        where: {
          name: { in: fieldConfig.typesOfObjects.map((type) => type.name) },
          userId,
        },
      });

      const existingTypesMap = existingTypes.reduce((map, type) => {
        map[type.name] = type.id;
        return map;
      }, {});

      // Crear tipos de objetos
      for (const type of fieldConfig.typesOfObjects) {
        let typeId = existingTypesMap[type.name];
        if (!typeId) {
          const createdType = await transaction.tx.typeOfObject.create({
            data: {
              name: type.name,
              user: { connect: { id: userId } },
            },
          });
          typeId = createdType.id;
        }

        // Filtrar las variables que corresponden al tipo actual.
        const variablesForType = fieldConfig.variables.filter(
          (variable) => variable.associatedTypeOfObject === type.name,
        );

        // Se usa el servicio de variables.
        await this.variableService.createVariables(
          variablesForType,
          typeId,
          userId,
          transaction,
        );
      }
    } catch (error) {
      throw error;
    }
  }

  async findOne(id: number) {
    try {
      const typeOfObjectFound = await this.db.typeOfObject.findUnique({
        where: { id },
        include: {
          variables: {
            include: {
              variable: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
      });
      if (!typeOfObjectFound) {
        throw new NotFoundException(`Type_of_object with ID ${id} not found`);
      }
      return {
        id: typeOfObjectFound.id,
        name: typeOfObjectFound.name,
        variables: typeOfObjectFound.variables.map((e) => ({
          id: e.variable.id,
          name: e.variable.name,
        })),
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'An unexpected error occurred while retrieving type_of_object.',
      );
    }
  }

  async findAll() {
    try {
      const objects = await this.db.typeOfObject.findMany({
        include: {
          variables: {
            include: {
              variable: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
      });
      return objects.map((object) => ({
        ...object,
        variables: object.variables.map((e) => ({
          id: e.variable.id,
          name: e.variable.name,
        })),
      }));
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'An unexpected error occurred while retrieving type_of_objects.',
      );
    }
  }

  async findAllByUserId(byUserId: string) {
    try {
      const objects = await this.db.typeOfObject.findMany({
        where: { userId: byUserId },
        include: {
          variables: {
            include: {
              variable: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
      });
      return objects.map((object) => ({
        ...object,
        variables: object.variables.map((e) => ({
          id: e.variable.id,
          name: e.variable.name,
        })),
      }));
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'An unexpected error occurred while retrieving type_of_objects.',
      );
    }
  }

  async update(
    id: number,
    updateTypeOfObjectDto: UpdateTypeOfObjectDto,
  ): Promise<TypeOfObject> {
    try {
      const updatedTypeOfObject = await this.db.typeOfObject.update({
        where: { id },
        data: {
          name: updateTypeOfObjectDto.name,
        },
      });
      return updatedTypeOfObject;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException(
            `Type_of_object with ID ${id} not found.`,
          );
        }
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
          if (error.code === 'P2002') {
            throw new ConflictException(
              `A type_of_object with that ${error.meta.target[0]}: '${updateTypeOfObjectDto[error.meta.target[0]]}' already exists`,
            );
          }
        }
      }
      throw new InternalServerErrorException(
        'An unexpected error occurred while updating the type_of_object.',
      );
    }
  }

  async remove(id: number): Promise<TypeOfObject> {
    try {
      // Verificar si el ID está asociado en el modelo de PenVariableTypeOfObject
      const penVariableTypeOfObject =
        await this.penVariableTypeOfObjectRepository.findByTypeOfObjectId(
          id,
          false,
        );
      if (penVariableTypeOfObject.length > 0) {
        throw new ConflictException(
          `Type_of_object with ID ${id} is associated with many tables and cannot be deleted.`,
        );
      }

      return await prismaMiddleware.typeOfObject.delete({
        where: { id },
      });
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException(`Type_of_object with ID ${id} not found`);
        }
      }
      throw new InternalServerErrorException(
        'An unexpected error occurred while deleting the type_of_object.',
      );
    }
  }
}
