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

@Injectable()
export class PenRepository {
  constructor(private readonly db: PrismaService) {}

  async create(createPenDto: CreatePenDto) {
    const { type_of_object_ids, ...penData } = createPenDto;
    try {
      const result = await this.db.$transaction(async (prisma) => {
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
          console.log('2033333:', error);
          if (
            error.code === 'P2003' &&
            error.meta?.modelName === 'PenTypeOfObject'
          ) {
            throw new BadRequestException(
              `The TypeOfObject you're trying to associate does not exist. Please verify that the object exists before making the association.`,
            );
          }
          throw new BadRequestException('Field Id not found.');
        }
      }
      throw new Error(`Failed to create pen: ${error.message}`);
    }
  }

  async findAll(withFieldsBool: boolean, withObjectsBool: boolean) {
    try {
      const pensFound = await this.db.pen.findMany({
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
      return pensFound.map((pen) => ({
        ...pen,
        type_of_objects:
          pen.type_of_objects?.map((obj) => ({
            id: obj['type_of_object'].id,
            name: obj['type_of_object'].name,
          })) || [],
      }));
    } catch (error) {
      throw new Error(`Failed to find pens: ${error.message}`);
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
        // Actualizar el Pen
        const updatedPen = await prisma.pen.update({
          where: { id },
          data: {
            ...updateData,
          },
        });

        // Borrar relaciones anteriores
        await prisma.penTypeOfObject.deleteMany({
          where: { penId: id },
        });

        // Crear las nuevas asociaciones de type_of_objects si existen
        if (type_of_object_ids?.length) {
          await prisma.penTypeOfObject.createMany({
            data: type_of_object_ids.map((typeOfObjectId) => ({
              penId: id,
              typeOfObjectId: typeOfObjectId,
            })),
          });
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
