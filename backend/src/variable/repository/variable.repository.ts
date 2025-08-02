import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, Variable } from '@prisma/client';

import { CreateVariableDto } from '../dto/create-variable.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { UpdateVariableDto } from '../dto/update-variable.dto';
import prismaMiddleware from 'prisma/prisma.extensions';

@Injectable()
export class VariableRepository {
  constructor(private readonly db: PrismaService) {}

  async createVariables(
    variables: any,
    typeOfObjectId: number,
    userId: string,
    transaction: any,
  ) {
    const existingVariables = await transaction.tx.variable.findMany({
      where: {
        name: { in: variables.map((variable) => variable.name) },
        userId,
      },
    });

    const existingVariablesMap = existingVariables.reduce((map, variable) => {
      map[variable.name] = variable.id;
      return map;
    }, {});

    // Crear las variables
    for (const variable of variables) {
      if (!existingVariablesMap[variable.name]) {
        const createdVariable = await transaction.tx.variable.create({
          data: {
            name: variable.name,
            type: variable.type,
            defaultValue: variable.defaultValue,
            user: { connect: { id: userId } },
            type_of_objects: {
              create: [{ type_of_object: { connect: { id: typeOfObjectId } } }],
            },
          },
        });

        const uniqueCombinations = await this.findUniqueCombinations([
          typeOfObjectId,
        ]);

        for (const combination of uniqueCombinations) {
          // Transformar el defaultValue para que coincida con la estructura esperada por custom_parameters
          let customParameters = createdVariable.defaultValue;
          
          // Si es una variable categórica, transformar la estructura
          if (createdVariable.type === 'CATEGORICAL') {
            const defaultValue = createdVariable.defaultValue as any;
            customParameters = {
              value: {
                categories: defaultValue.value.categories,
                optimal_values: defaultValue.value.optimal_values || []
              }
            };
          }
          
          await transaction.tx.penVariableTypeOfObject.create({
            data: {
              penId: combination.penId,
              variableId: createdVariable.id,
              typeOfObjectId: typeOfObjectId,
              custom_parameters: customParameters,
            },
          });
        }
      }
    }
  }

  async create(userId: string, createVariableDto: CreateVariableDto) {
    const { type_of_object_ids, ...variableData } = createVariableDto;
    try {
      const newVariable = await prismaMiddleware.variable.create({
        data: {
          ...variableData,
          user: {
            connect: { id: userId },
          },
          type_of_objects: type_of_object_ids?.length
            ? {
                create: type_of_object_ids.map((typeOfObjectId) => ({
                  type_of_object: {
                    connect: { id: typeOfObjectId },
                  },
                })),
              }
            : null,
        },
      });

      if (newVariable) {
        const uniqueCombinations =
          await this.findUniqueCombinations(type_of_object_ids);

        for (const combination of uniqueCombinations) {
          // Transformar el defaultValue para que coincida con la estructura esperada por custom_parameters
          let customParameters = newVariable.defaultValue;
          
          // Si es una variable categórica, transformar la estructura
          if (newVariable.type === 'CATEGORICAL') {
            const defaultValue = newVariable.defaultValue as any;
            customParameters = {
              value: {
                categories: defaultValue.value.categories,
                optimal_values: defaultValue.value.optimal_values || []
              }
            };
          }
          
          await this.db.penVariableTypeOfObject.create({
            data: {
              penId: combination.penId,
              variableId: newVariable.id,
              typeOfObjectId: combination.type_of_object_id,
              custom_parameters: customParameters,
            },
          });
        }
      }

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
      console.log('ERROR:', error);
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
      if (!variablesFound.length) {
        throw new NotFoundException(
          `No variables found for TypeOfObject with ID ${type_of_object_id}`,
        );
      }
      return variablesFound.map((variable) => ({
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
        'An unexpected error occurred while retrieving variable.',
      );
    }
  }

  async findUniqueCombinations(
    typeOfObjectIds: number[],
  ): Promise<{ type_of_object_id: number; penId: number }[]> {
    //crear set para almacenar los valores unicos
    const uniqueCombinations = new Set<string>();
    const result = [];
    try {
      for (const typeId of typeOfObjectIds) {
        const records = await this.db.penVariableTypeOfObject.findMany({
          where: {
            typeOfObjectId: typeId,
          },

          select: {
            typeOfObjectId: true,
            penId: true,
          },
        });
        //recorrer los registros y agregarlos a result
        for (const record of records) {
          const combinationKey = `${record.typeOfObjectId}-${record.penId}`;
          if (!uniqueCombinations.has(combinationKey)) {
            uniqueCombinations.add(combinationKey);
            result.push({
              type_of_object_id: record.typeOfObjectId,
              penId: record.penId,
            });
          }
        }
      }

      return result;
    } catch (error) {
      console.error('ERROR:', error);
      throw new InternalServerErrorException(
        'An unexpected error occurred while retrieving unique combinations.',
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

  async findAllByUserId(byUserId: string) {
    try {
      const variables = await this.db.variable.findMany({
        where: {
          userId: byUserId,
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
      const result = await this.db.$transaction(async (prisma) => {
        // Obtener las relaciones anteriores
        const previousTypeOfObjects =
          await prisma.typeOfObject_Variable.findMany({
            where: { variable_id: id },
            select: { type_of_object_id: true },
          });

        // Actualizar la Variable
        const updatedVariable = await prisma.variable.update({
          where: { id },
          data: {
            ...updateData,
          },
        });

        // Obtener los type_of_object_ids que no están en la lista actualizada
        const typeOfObjectsToDelete = previousTypeOfObjects
          .map((obj) => obj.type_of_object_id)
          .filter((typeId) => !type_of_object_ids.includes(typeId));

        // Borrar los registros en pen_variable_type_of_objects para los type_of_object_ids eliminados
        for (const typeOfObjectId of typeOfObjectsToDelete) {
          // Obtener los pens relacionados con el typeOfObjectId
          const pens = await prisma.penTypeOfObject.findMany({
            where: { typeOfObjectId },
            select: { penId: true },
          });

          for (const { penId } of pens) {
            await prisma.penVariableTypeOfObject.deleteMany({
              where: {
                penId,
                variableId: id,
                typeOfObjectId,
              },
            });
          }

          await prisma.typeOfObject_Variable.deleteMany({
            where: {
              variable_id: id,
              type_of_object_id: typeOfObjectId,
            },
          });
        }

        // Verificar si hay type_of_object_ids para agregar
        if (type_of_object_ids?.length) {
          // Obtener los type_of_object_ids que se agregaron
          const typeOfObjectsToAdd = type_of_object_ids.filter(
            (typeOfObjectId) => {
              return !previousTypeOfObjects.some(
                (obj) => obj.type_of_object_id === typeOfObjectId,
              );
            },
          );

          if (typeOfObjectsToAdd.length > 0) {
            for (const typeOfObjectId of typeOfObjectsToAdd) {
              // Crear la asociación en typeOfObject_Variable
              await prisma.typeOfObject_Variable.create({
                data: {
                  variable_id: id,
                  type_of_object_id: typeOfObjectId,
                },
              });

              // Obtener los pens relacionados con el typeOfObjectId
              const pens = await prisma.penTypeOfObject.findMany({
                where: { typeOfObjectId },
                select: { penId: true },
              });

              for (const { penId } of pens) {
                // Verificar si el registro existe
                const existingEntry =
                  await prisma.penVariableTypeOfObject.findUnique({
                    where: {
                      penId_variableId_typeOfObjectId: {
                        penId,
                        variableId: id,
                        typeOfObjectId,
                      },
                    },
                  });

                if (!existingEntry) {
                  await prisma.penVariableTypeOfObject.create({
                    data: {
                      penId,
                      variableId: id,
                      typeOfObjectId,
                      custom_parameters: updateVariableDto.defaultValue,
                    },
                  });
                }
              }
            }
          }
        }

        return updatedVariable;
      });

      return result;
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
      // borrar las asociociones en la tabla intermedia Pen_Variable_TypeOfObject
      await this.db.penVariableTypeOfObject.deleteMany({
        where: { variableId: id },
      });

      // Delete the variable
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
        'An unexpected error occurred while removing the variable.',
      );
    }
  }
}
