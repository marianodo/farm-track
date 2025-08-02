import {
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { fieldConfigurations } from './field-data-config';
import { CreateFieldDto } from 'src/field/dto/create-field.dto';

type Variable = {
  name: string;
  type: string;
  associatedTypeOfObject: string;
};

export async function autoConfigField(
  createFieldDto: CreateFieldDto,
  txHost: any,
) {
  const { production_type, userId } = createFieldDto;
  console.log('🔍 DEBUG - Production type received:', production_type);
  console.log('🔍 DEBUG - Production type lowercase:', production_type.toLowerCase());
  console.log('🔍 DEBUG - Available configurations:', Object.keys(fieldConfigurations));
  
  const fieldType = fieldConfigurations[production_type.toLowerCase()];
  console.log('🔍 DEBUG - Field type found:', fieldType ? 'YES' : 'NO');

  if (!fieldType) {
    throw new BadRequestException(
      `No configuration found for field type: ${production_type}`,
    );
  }

  const { typesOfObjects, variables } = fieldType;

  try {
    // Crear tipos de objetos y variables de manera eficiente
    await txHost.tx.typeOfObject.createMany({
      data: typesOfObjects.map(({ name }) => ({ name, userId })),
      skipDuplicates: true,
    });

    console.log('🔍 DEBUG - Creating variables:', variables.map(v => v.name));
    await txHost.tx.variable.createMany({
      data: variables.map(({ name, type, defaultValue }) => ({
        name,
        type,
        defaultValue,
        userId,
      })),
      skipDuplicates: true,
    });
    console.log('🔍 DEBUG - Variables created successfully');

    // Recuperar ambos tipos de objetos y variables en una sola consulta
    const [typesOfObjectsFound, variablesFound] = await Promise.all([
      txHost.tx.typeOfObject.findMany({ where: { userId } }),
      txHost.tx.variable.findMany({ where: { userId } }),
    ]);
    
    console.log('🔍 DEBUG - Types of objects found:', typesOfObjectsFound.map(t => t.name));
    console.log('🔍 DEBUG - Variables found:', variablesFound.map(v => v.name));

    const separatedVariablesById = typesOfObjectsFound.reduce(
      (acc, typeOfObject) => {
        acc[typeOfObject.id] = variables.filter(
          (variable) => variable.associatedTypeOfObject === typeOfObject.name,
        );
        return acc;
      },
      {},
    );
    
    console.log('🔍 DEBUG - Separated variables by type of object:', Object.keys(separatedVariablesById).map(key => ({
      typeOfObjectId: key,
      variables: separatedVariablesById[key].map(v => v.name)
    })));

    // Crear relaciones entre variables y tipos de objetos de manera eficiente
    console.log('🔍 DEBUG - Creating type_of_object_variable relationships...');
    await Promise.all(
      Object.entries(separatedVariablesById).map(
        async ([typeOfObjectId, variablesToAssociate]) => {
          const typeOfObjectIdParsed = parseInt(typeOfObjectId);
          console.log(`🔍 DEBUG - Creating relationships for type of object ${typeOfObjectIdParsed} with variables:`, (variablesToAssociate as Variable[]).map(v => v.name));

          // Asociar las variables recién creadas con los tipos de objetos
          await txHost.tx.typeOfObject_Variable.createMany({
            data: (variablesToAssociate as Variable[]).map((variable) => {
              const variableWithId = variablesFound.find(
                (v) => v.name === variable.name && v.type === variable.type,
              );

              if (!variableWithId) {
                throw new Error(
                  `Variable with name ${variable.name} not found`,
                );
              }

              return {
                variable_id: variableWithId.id,
                type_of_object_id: typeOfObjectIdParsed,
              };
            }),
            skipDuplicates: true,
          });
          console.log(`🔍 DEBUG - Relationships created successfully for type of object ${typeOfObjectIdParsed}`);
        },
      ),
    );
    console.log('🔍 DEBUG - All type_of_object_variable relationships created');

    // Crear el nuevo campo
    const newField = await txHost.tx.field.create({
      data: createFieldDto,
    });
    console.log('🔍 DEBUG - Field created:', newField.id);

    return newField;
  } catch (error) {
    // Manejo del error específico de la restricción de clave única
    if (
      error.code === 'P2002' &&
      error.meta.target.includes('name') &&
      error.meta.target.includes('userId')
    ) {
      throw new BadRequestException(
        `A field with the name '${createFieldDto.name}' already exists for this user.`,
      );
    }

    console.error('ERROR:', error);
    throw new InternalServerErrorException(
      'An unexpected error occurred during the field configuration.',
    );
  }
}
