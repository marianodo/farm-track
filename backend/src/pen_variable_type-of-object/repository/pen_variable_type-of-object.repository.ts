import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { CreatePenVariableTypeOfObjectDto } from '../dto/create-pen_variable_type-of-object.dto';
import { UpdatePenVariableTypeOfObjectDto } from '../dto/update-pen_variable_type-of-object.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class PenVariableTypeOfObjectRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    createPenVariableTypeOfObjectDto: CreatePenVariableTypeOfObjectDto,
  ) {
    try {
      // Verificar si los IDs existen en las tablas referenciadas
      const typeOfObjectExists = await this.prisma.typeOfObject.findUnique({
        where: { id: createPenVariableTypeOfObjectDto.typeOfObjectId },
      });
      if (!typeOfObjectExists) {
        throw new BadRequestException('TypeOfObject Id not found.');
      }

      const variableExists = await this.prisma.variable.findUnique({
        where: { id: createPenVariableTypeOfObjectDto.variableId },
      });
      if (!variableExists) {
        throw new BadRequestException('Variable Id not found.');
      }

      // Crear el registro
      return await this.prisma.penVariableTypeOfObject.create({
        data: createPenVariableTypeOfObjectDto,
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          console.log('P2002', error);
          throw new BadRequestException(
            'A PenVariableTypeOfObject name with this userId already exists.',
          );
        }
        if (error.code === 'P2025') {
          console.log('P2025', error);
          throw new BadRequestException('PenVariableTypeOfObject not found.');
        }
        if (error.code === 'P2003') {
          console.log('P2003', error);
          throw new BadRequestException(
            'PenVariableTypeOfObject Id not found.',
          );
        }
      }
      throw new InternalServerErrorException(
        'An unexpected error occurred while creating the field.',
      );
    }
  }

  async findAll() {
    try {
      return await this.prisma.penVariableTypeOfObject.findMany();
    } catch (error) {
      // Manejo de errores
      throw new Error(
        `Error finding all PenVariableTypeOfObject: ${error.message}`,
      );
    }
  }

  async findOne(penId: number, variableId: number, typeOfObjectId: number) {
    try {
      const findFound = await this.prisma.penVariableTypeOfObject.findUnique({
        where: {
          penId_variableId_typeOfObjectId: {
            penId,
            variableId,
            typeOfObjectId,
          },
        },
      });
      if (!findFound) {
        throw new BadRequestException(' Not found.');
      }
      return findFound;
    } catch (error) {
      // Manejo de errores
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new Error(
        `Error finding PenVariableTypeOfObject: ${error.message}`,
      );
    }
  }

  async findByTypeOfObjectId(
    typeOfObjectId: number,
    withVariableBool: boolean,
  ) {
    try {
      const result = await this.prisma.penVariableTypeOfObject.findMany({
        where: {
          typeOfObjectId,
        },
        include: {
          variable: withVariableBool
            ? {
                select: {
                  name: true,
                  type: true,
                },
              }
            : false,
        },
      });
      console.log(result); // Depurar los resultados
      return result;
    } catch (error) {
      // Manejo de errores
      throw new Error(
        `Error finding PenVariableTypeOfObject by typeOfObjectId: ${error.message}`,
      );
    }
  }

  async update(
    penId: number,
    variableId: number,
    typeOfObjectId: number,
    updatePenVariableTypeOfObjectDto: UpdatePenVariableTypeOfObjectDto,
  ) {
    try {
      return await this.prisma.penVariableTypeOfObject.update({
        where: {
          penId_variableId_typeOfObjectId: {
            penId,
            variableId,
            typeOfObjectId,
          },
        },
        data: updatePenVariableTypeOfObjectDto,
      });
    } catch (error) {
      // Manejo de errores
      throw new Error(
        `Error updating PenVariableTypeOfObject: ${error.message}`,
      );
    }
  }

  async remove(penId: number, variableId: number, typeOfObjectId: number) {
    try {
      const existingRecord =
        await this.prisma.penVariableTypeOfObject.findUnique({
          where: {
            penId_variableId_typeOfObjectId: {
              penId,
              variableId,
              typeOfObjectId,
            },
          },
        });
      if (!existingRecord) {
        throw new BadRequestException('Not found.');
      }
      return await this.prisma.penVariableTypeOfObject.delete({
        where: {
          penId_variableId_typeOfObjectId: {
            penId,
            variableId,
            typeOfObjectId,
          },
        },
      });
    } catch (error) {
      // Manejo de errores
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new Error(
        `Error deleting PenVariableTypeOfObject: ${error.message}`,
      );
    }
  }

  async deleteByPenIdAndTypeOfObjectId(penId: number, typeOfObjectId: number) {
    try {
      // Verificar si existe algún registro con el penId y typeOfObjectId
      const existingRecords =
        await this.prisma.penVariableTypeOfObject.findMany({
          where: {
            penId,
            typeOfObjectId,
          },
        });

      if (existingRecords.length === 0) {
        throw new BadRequestException(
          'No records found with the provided penId and typeOfObjectId.',
        );
      }

      // Borrar los registros encontrados
      return await this.prisma.penVariableTypeOfObject.deleteMany({
        where: {
          penId,
          typeOfObjectId,
        },
      });
    } catch (error) {
      // Manejo de errores
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new Error(
        `Error deleting PenVariableTypeOfObject by penId and typeOfObjectId: ${error.message}`,
      );
    }
  }
}
