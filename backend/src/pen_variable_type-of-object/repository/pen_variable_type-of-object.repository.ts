// import {
//   BadRequestException,
//   ConflictException,
//   Injectable,
//   InternalServerErrorException,
//   NotFoundException,
// } from '@nestjs/common';
// import { CreatePenVariableTypeOfObjectDto } from '../dto/create-pen_variable_type-of-object.dto';
// import { UpdatePenVariableTypeOfObjectDto } from '../dto/update-pen_variable_type-of-object.dto';
// import { PrismaService } from 'src/prisma/prisma.service';
// import { Prisma } from '@prisma/client';

// @Injectable()
// export class PenVariableTypeOfObjectRepository {
//   constructor(private readonly db: PrismaService) {}

//   async create(
//     createPenVariableTypeOfObjectDto: CreatePenVariableTypeOfObjectDto,
//   ) {
//     const { typeOfObjectIds, ...penVariableTypeOfObjectData } = createPenVariableTypeOfObjectDto;
//     try {
//       const result = await this.db.$transaction(async (prisma) => {
//         // Crear el PenVariableTypeOfObject
//         const newPenVariableTypeOfObject =
//           await prisma.penVariableTypeOfObject.create({
//             data: {
//               ...penVariableTypeOfObjectData,
//             },
//           });

//         // Crear las asociaciones de type_of_objects si existen
//         if (type_of_object_ids?.length) {
//         if (typeOfObjectIds?.length) {
//             data: typeOfObjectIds.map((typeOfObjectId: number) => ({
//               penVariableTypeOfObjectId: newPenVariableTypeOfObject.penId,
//               typeOfObjectId: typeOfObjectId,
//             })),
//           });
//         }

//         return newPenVariableTypeOfObject;
//       });

//       return result;
//     } catch (error) {
//       if (error instanceof Prisma.PrismaClientKnownRequestError) {
//         // Manejar error de unicidad (código P2002)
//         if (error.code === 'P2002') {
//           throw new BadRequestException(
//             'A pen variable type of object with this fieldId already exists.',
//           );
//         }

//         // Error de referencia de la relación o registro no encontrado
//         if (error.code === 'P2025') {
//           const cause = error.meta?.cause as string;
//           if (cause.includes("No 'TypeOfObject' record(s)")) {
//             throw new BadRequestException(
//               `The TypeOfObject you're trying to associate does not exist. Please verify that the object exists before making the association.`,
//             );
//           } else {
//             throw new BadRequestException('Field not found.');
//           }
//         }
//         if (error.code === 'P2003') {
//           if (
//             error.code === 'P2003' &&
//             error.meta?.modelName === 'PenVariableTypeOfObject'
//           ) {
//             throw new BadRequestException(
//               `The TypeOfObject you're trying to associate does not exist. Please verify that the object exists before making the association.`,
//             );
//           }
//           throw new BadRequestException('Field Id not found.');
//         }
//       }
//       throw new Error(
//         `Failed to create pen variable type of object: ${error.message}`,
//       );
//     }
//   }

//   async findAll(withFieldsBool: boolean, withObjectsBool: boolean) {
//     try {
//       const penVariableTypeOfObjectsFound =
//         await this.db.penVariableTypeOfObject.findMany({
//           include: {
//             field: withFieldsBool ? true : undefined,
//             field: withFieldsBool ? true : false,
//               ? {
//                   select: {
//                     type_of_object: {
//                       select: {
//                         id: true,
//                         name: true,
//                       },
//                     },
//                   },
//                 }
//               : false,
//           },
//         });
//       return penVariableTypeOfObjectsFound.map((penVariableTypeOfObject) => ({
//         ...penVariableTypeOfObject,
//         type_of_objects:
//           penVariableTypeOfObject.typeOfObjects?.map((obj: any) => ({
//           penVariableTypeOfObject.type_of_objects?.map((obj: any) => ({
//             name: obj['type_of_object'].name,
//           })) || [],
//       }));
//     } catch (error) {
//       throw new Error(
//         `Failed to find pen variable type of objects: ${error.message}`,
//       );
//     }
//   }

//   async findOne(id: number, withFieldsBool: boolean, withObjectsBool: boolean) {
//     try {
//       const penVariableTypeOfObjectFound =
//         await this.db.penVariableTypeOfObject.findUnique({
//           where: { penId: id },
//           where: { penId_variableId_typeOfObjectId: { penId: id, variableId: penVariableTypeOfObjectFound.variableId, typeOfObjectId: penVariableTypeOfObjectFound.typeOfObjectId } },
//             field: withFieldsBool,
//             field: withFieldsBool ? true : false,
//               ? {
//                   select: {
//                     type_of_object: {
//                       select: {
//                         id: true,
//                         name: true,
//                       },
//                     },
//                   },
//                 }
//               : false,
//           },
//         });
//       if (!penVariableTypeOfObjectFound) {
//         throw new NotFoundException(
//           `Pen variable type of object with ID ${id} not found`,
//         );
//       }

//       return {
//         penId: penVariableTypeOfObjectFound.penId,
//         variableId: penVariableTypeOfObjectFound.variableId,
//         typeOfObjectId: penVariableTypeOfObjectFound.typeOfObjectId,
//         custom_parameters: penVariableTypeOfObjectFound.custom_parameters,
//         typeOfObjects:
//           penVariableTypeOfObjectFound.typeOfObjects?.map((obj: any) => ({
//           penVariableTypeOfObjectFound.type_of_objects?.map((obj: any) => ({
//             name: obj['typeOfObject'].name,
//           })) || [],
//       };
//     } catch (error) {
//       if (error instanceof NotFoundException) {
//         throw error;
//       }
//       throw new Error(
//         `Failed to find pen variable type of object with id ${id}: ${error.message}`,
//       );
//     }
//   }

//   async update(
//     id: number,
//     updatePenVariableTypeOfObjectDto: UpdatePenVariableTypeOfObjectDto,
//   ) {
//     const { typeOfObjectIds, ...updateData } = updatePenVariableTypeOfObjectDto;
//     const { typeOfObjectIds, ...updateData } = updatePenVariableTypeOfObjectDto;
//       const result = await this.db.$transaction(async (prisma) => {
//         // Actualizar el PenVariableTypeOfObject
//         const updatedPenVariableTypeOfObject =
//           await prisma.penVariableTypeOfObject.update({
//             where: { id },
//             where: { penId_variableId_typeOfObjectId: { penId: id, variableId: updatePenVariableTypeOfObjectDto.variableId, typeOfObjectId: updatePenVariableTypeOfObjectDto.typeOfObjectId } },
//               ...updateData,
//             },
//           });

//         // Borrar relaciones anteriores
//         await prisma.penVariableTypeOfObject.deleteMany({
//           where: { penId: id },
//         });

//         // Crear las nuevas asociaciones de type_of_objects si existen
//         if (type_of_object_ids?.length) {
//           await prisma.penVariableTypeOfObject.createMany({
//             data: type_of_object_ids.map((typeOfObjectId) => ({
//             data: typeOfObjectIds.map((typeOfObjectId: number) => ({
//               typeOfObjectId: typeOfObjectId,
//             })),
//           });
//         }

//         return updatedPenVariableTypeOfObject;
//       });

//       return result;
//     } catch (error) {
//       if (error instanceof Prisma.PrismaClientKnownRequestError) {
//         if (error.code === 'P2002') {
//           throw new ConflictException(
//             `A pen variable type of object with that ${error.meta.target[0]}: '${updatePenVariableTypeOfObjectDto[error.meta.target[0]]}' already exists`,
//           );
//         }
//         if (error.code === 'P2025') {
//           throw new NotFoundException(
//             `The type_of_objects you're trying to associate does not exist. Please verify that the object exists before making the association.`,
//           );
//         }
//         if (
//           error.code === 'P2003' &&
//           error.meta?.modelName === 'PenVariableTypeOfObject'
//         ) {
//           throw new BadRequestException(
//             `The TypeOfObject you're trying to associate does not exist. Please verify that the object exists before making the association.`,
//           );
//         }
//       }
//       throw new InternalServerErrorException(
//         'An unexpected error occurred while updating the pen variable type of object.',
//       );
//     }
//   }

//   async remove(id: number) {
//     try {
//       return await this.db.penVariableTypeOfObject.delete({
//         where: { penId: id },
//       });
//     } catch (error) {
//       if (error instanceof Prisma.PrismaClientKnownRequestError) {
//         if (error.code === 'P2025') {
//           throw new NotFoundException(
//             `Pen variable type of object with ID ${id} not found`,
//           );
//         }
//       }
//       throw new InternalServerErrorException(
//         'An unexpected error occurred while removing the pen variable type of object.',
//       );
//     }
//   }
// }
