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

@Injectable()
export class TypeOfObjectsRepository {
  constructor(private readonly db: PrismaService) {}

  async create(createTypeOfObjectDto: CreateTypeOfObjectDto) {
    try {
      return await this.db.typeOfObject.create({
        data: {
          ...createTypeOfObjectDto,
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
      return await prismaMiddleware.typeOfObject.delete({
        where: { id },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException(`Type_of_object with ID ${id} not found`);
        }
      }
      throw new InternalServerErrorException(
        'An unexpected error occurred while updating the type_of_object.',
      );
    }
  }
}
