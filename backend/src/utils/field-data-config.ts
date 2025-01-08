// Tipo para los objetos dentro de typesOfObjects
export interface TypeOfObject {
  name: string;
}

// Tipo para los valores numéricos del campo "defaultValue"
export interface NumberDefaultValue {
  value: {
    min: number;
    max: number;
    optimal_min: number;
    optimal_max: number;
    granularity: number;
  };
}

// Tipo para los valores categóricos del campo "defaultValue"
export interface CategoricalDefaultValue {
  value: string[];
}

// Tipo general para defaultValue, que puede ser numérico o categórico
export type DefaultValue = NumberDefaultValue | CategoricalDefaultValue;

// Tipo para una variable dentro de "variables"
export interface Variable {
  name: string;
  type: 'NUMBER' | 'CATEGORICAL';
  defaultValue: DefaultValue;
  associatedTypeOfObject: string; // Nombre del tipo de objeto asociado
}

// Tipo para la configuración completa de un campo
export interface FieldConfig {
  typesOfObjects: TypeOfObject[];
  variables: Variable[];
}

export const fieldConfigurations: Record<string, FieldConfig> = {
  bovine_of_milk: {
    typesOfObjects: [{ name: 'Animal' }, { name: 'Instalacion' }],
    variables: [
      {
        name: 'Body condition',
        type: 'NUMBER',
        defaultValue: {
          value: {
            min: 1,
            max: 5,
            optimal_min: 2.75,
            optimal_max: 3.75,
            granularity: 0.25,
          },
        },
        associatedTypeOfObject: 'Animal',
      },
      {
        name: 'Locomotion score',
        type: 'NUMBER',
        defaultValue: {
          value: {
            min: 1,
            max: 5,
            optimal_min: 1,
            optimal_max: 2,
            granularity: 1,
          },
        },
        associatedTypeOfObject: 'Animal',
      },
      {
        name: 'Fecal score',
        type: 'NUMBER',
        defaultValue: {
          value: {
            min: 1,
            max: 5,
            optimal_min: 3,
            optimal_max: 3,
            granularity: 1,
          },
        },
        associatedTypeOfObject: 'Animal',
      },
      {
        name: 'Urine pH',
        type: 'NUMBER',
        defaultValue: {
          value: {
            min: 3,
            max: 11,
            optimal_min: 5.5,
            optimal_max: 6.5,
            granularity: 0.1,
          },
        },
        associatedTypeOfObject: 'Animal',
      },
      {
        name: 'Udder hygiene score',
        type: 'NUMBER',
        defaultValue: {
          value: {
            min: 1,
            max: 4,
            optimal_min: 1,
            optimal_max: 2,
            granularity: 1,
          },
        },
        associatedTypeOfObject: 'Animal',
      },
      {
        name: 'Panting score',
        type: 'NUMBER',
        defaultValue: {
          value: {
            min: 0,
            max: 4.5,
            optimal_min: 0,
            optimal_max: 2,
            granularity: 0.5,
          },
        },
        associatedTypeOfObject: 'Animal',
      },
      {
        name: 'Ruminating',
        type: 'CATEGORICAL',
        defaultValue: {
          value: ['YES', 'NO'],
        },
        associatedTypeOfObject: 'Animal',
      },
      {
        name: 'Laying',
        type: 'CATEGORICAL',
        defaultValue: {
          value: ['YES', 'NO'],
        },
        associatedTypeOfObject: 'Animal',
      },
      {
        name: 'Feed bunk score',
        type: 'NUMBER',
        defaultValue: {
          value: {
            min: 1,
            max: 5,
            optimal_min: 1,
            optimal_max: 1,
            granularity: 1,
          },
        },
        associatedTypeOfObject: 'Instalacion',
      },
      {
        name: 'Water trough score',
        type: 'NUMBER',
        defaultValue: {
          value: {
            min: 1,
            max: 5,
            optimal_min: 1,
            optimal_max: 1,
            granularity: 1,
          },
        },
        associatedTypeOfObject: 'Instalacion',
      },
      {
        name: 'Bedding score',
        type: 'NUMBER',
        defaultValue: {
          value: {
            min: 1,
            max: 3,
            optimal_min: 1,
            optimal_max: 1,
            granularity: 1,
          },
        },
        associatedTypeOfObject: 'Instalacion',
      },
      {
        name: 'Pen hygiene score',
        type: 'NUMBER',
        defaultValue: {
          value: {
            min: 1,
            max: 3,
            optimal_min: 1,
            optimal_max: 1,
            granularity: 1,
          },
        },
        associatedTypeOfObject: 'Instalacion',
      },
    ],
  },
  //   'bovina de carne': {
  //     typesOfObjects: [{ name: 'Animal' }, { name: 'Corral' }],
  //     variables: [
  //       {
  //         name: 'Ganancia diaria de peso',
  //         type: 'NUMBER',
  //         defaultValue: { value: 0 },
  //         associatedTypeOfObject: 'Animal',
  //       },
  //       {
  //         name: 'Condición corporal',
  //         type: 'NUMBER',
  //         defaultValue: { value: 0 },
  //         associatedTypeOfObject: 'Animal',
  //       },
  //       {
  //         name: 'Capacidad del corral',
  //         type: 'NUMBER',
  //         defaultValue: { value: 0 },
  //         associatedTypeOfObject: 'Corral',
  //       },
  //     ],
  //   },
};
