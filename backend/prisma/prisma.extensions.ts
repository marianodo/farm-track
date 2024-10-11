import { PrismaClient } from '@prisma/client';

const prismaMiddleware = new PrismaClient();

prismaMiddleware.$use(async (params, next) => {
  if (params.model === 'TypeOfObject' && params.action === 'delete') {
    const typeOfObjectId = params.args.where.id;

    // Encuentra todas las variables asociadas al objeto que se va a eliminar
    const associatedVariables =
      await prismaMiddleware.typeOfObject_Variable.findMany({
        where: { type_of_object_id: typeOfObjectId },
      });

    for (const association of associatedVariables) {
      const variableId = association.variable_id;

      // Verifica si la variable está asociada a otros objetos
      const otherAssociations =
        await prismaMiddleware.typeOfObject_Variable.findMany({
          where: {
            variable_id: variableId,
            type_of_object_id: { not: typeOfObjectId },
          },
        });

      if (otherAssociations.length === 0) {
        // Elimina la variable si no está asociada a otros objetos
        await prismaMiddleware.variable.delete({ where: { id: variableId } });
      }
    }
  }

  return next(params);
});

export default prismaMiddleware;
