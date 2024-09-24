import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, Variable } from '@prisma/client';

import { CreateVariableDto } from '../dto/create-variable.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { UpdateVariableDto } from '../dto/update-variable.dto';

@Injectable()
export class VariableRepository {
  constructor(private readonly db: PrismaService) {}

  async create(createVariableDto: CreateVariableDto) {
    const { type_of_object_ids, ...variableData } = createVariableDto;
    try {
      const newVariable = await this.db.variable.create({
        data: {
          ...variableData,
          type_of_objects: createVariableDto.type_of_object_ids?.length
            ? {
                create: createVariableDto.type_of_object_ids.map(
                  (typeOfObjectId) => ({
                    type_of_object: {
                      connect: { id: typeOfObjectId },
                    },
                  }),
                ),
              }
            : null,
        },
      });
      return newVariable;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2003') {
          throw new NotFoundException(
            `One or more TypeOfObject IDs in ${createVariableDto.type_of_object_ids} not found`,
          );
        }
        if (error.code === 'P2002') {
          throw new ConflictException(
            `A variable with that ${error.meta.target[0]}: '${createVariableDto[error.meta.target[0]]}' already exists`,
          );
        }
        if (error.code === 'P2025') {
          throw new NotFoundException(
            `The TypeOfObject you're trying to associate does not exist. Please verify that the object exists before making the association.`,
          );
        }
      }

      throw new InternalServerErrorException(
        'An unexpected error occurred while creating the variable.',
      );
    }
  }

  async findVariablesByTypeObjectId(
    type_of_object_id: number,
  ): Promise<Variable[]> {
    try {
      const variablesFound = await this.db.variable.findMany({
        where: {
          type_of_objects: {
            some: {
              type_of_object_id: type_of_object_id,
            },
          },
        },
        include: {
          type_of_objects: {
            include: {
              type_of_object: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
      });
      return variablesFound.map((variable) => ({
        ...variable,
        type_of_objects: variable.type_of_objects.map((obj) => ({
          id: obj.type_of_object.id,
          name: obj.type_of_object.name,
        })),
      }));
    } catch (error) {
      throw new InternalServerErrorException(
        'An unexpected error occurred while retrieving variable.',
      );
    }
  }

  async findOne(id: number) {
    try {
      const variableFound = await this.db.variable.findUnique({
        where: { id },
        include: {
          type_of_objects: {
            include: {
              type_of_object: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
      });
      if (!variableFound) {
        throw new NotFoundException(`Variable with ID ${id} not found`);
      }
      return {
        id: variableFound.id,
        name: variableFound.name,
        type: variableFound.type,
        defaultValue: variableFound.defaultValue,
        type_of_objects: variableFound.type_of_objects.map((e) => ({
          id: e.type_of_object.id,
          name: e.type_of_object.name,
        })),
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'An unexpected error occurred while retrieving variable.',
      );
    }
  }

  async findAll() {
    try {
      const variables = await this.db.variable.findMany({
        include: {
          type_of_objects: {
            include: {
              type_of_object: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
      });

      // Formateo la respuesta para devolver solo el id y name de type_of_objects
      return variables.map((variable) => ({
        ...variable,
        type_of_objects: variable.type_of_objects.map((obj) => ({
          id: obj.type_of_object.id,
          name: obj.type_of_object.name,
        })),
      }));
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'An unexpected error occurred while retrieving variables.',
      );
    }
  }

  async update(
    id: number,
    updateVariableDto: UpdateVariableDto,
  ): Promise<Variable> {
    const { type_of_object_ids, ...updateData } = updateVariableDto;

    try {
      const updatedVariable = await this.db.variable.update({
        where: { id },
        data: {
          ...updateData,
          // Gestiono la relación con la tabla intermedia TypeOfObject_Variable.
          type_of_objects: {
            deleteMany: {}, // Si es necesario borrar relaciones anteriores van aca.
            create: type_of_object_ids.map((type_of_object_id) => ({
              type_of_object: {
                connect: { id: type_of_object_id },
              },
            })),
          },
        },
        include: {
          type_of_objects: true,
        },
      });

      return updatedVariable;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictException(
            `A variable with that ${error.meta.target[0]}: '${updateVariableDto[error.meta.target[0]]}' already exists`,
          );
        }
        if (error.code === 'P2025') {
          throw new NotFoundException(
            `The type_of_objects you're trying to associate does not exist. Please verify that the object exists before making the association.`,
          );
        }
      }
      throw new InternalServerErrorException(
        'An unexpected error occurred while updating the variable.',
      );
    }
  }

  async remove(id: number): Promise<Variable> {
    try {
      return await this.db.variable.delete({
        where: { id },
      });
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
