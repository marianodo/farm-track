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
  optimal_values: string[];
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
    typesOfObjects: [{ name: 'Animal' }, { name: 'Installation' }],
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
            optimal_max: 1,
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
            max: 7,
            optimal_min: 0,
            optimal_max: 1,
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
          optimal_values: ['YES', 'NO'],
        },
        associatedTypeOfObject: 'Animal',
      },
      {
        name: 'Laying',
        type: 'CATEGORICAL',
        defaultValue: {
          value: ['YES', 'NO'],
          optimal_values: ['YES', 'NO'],
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
            optimal_min: 2,
            optimal_max: 3,
            granularity: 1,
          },
        },
        associatedTypeOfObject: 'Installation',
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
        associatedTypeOfObject: 'Installation',
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
        associatedTypeOfObject: 'Installation',
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
        associatedTypeOfObject: 'Installation',
      },
    ],
  },
  bovine_of_meat: {
    typesOfObjects: [{ name: 'Animal' }, { name: 'Installation' }],
    variables: [
      {
        name: 'Body condition',
        type: 'NUMBER',
        defaultValue: {
          value: {
            min: 1,
            max: 9,
            optimal_min: 6,
            optimal_max: 7,
            granularity: 1,
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
            optimal_max: 1,
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
            optimal_min: 2,
            optimal_max: 3,
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
            max: 7,
            optimal_min: 0,
            optimal_max: 1,
            granularity: 0.5,
          },
        },
        associatedTypeOfObject: 'Animal',
      },
      {
        name: 'Feed bunk score',
        type: 'NUMBER',
        defaultValue: {
          value: {
            min: 0,
            max: 5,
            optimal_min: 1,
            optimal_max: 2,
            granularity: 1,
          },
        },
        associatedTypeOfObject: 'Installation',
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
        associatedTypeOfObject: 'Installation',
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
        associatedTypeOfObject: 'Installation',
      },
      {
        name: 'Mud score',
        type: 'CATEGORICAL',
        defaultValue: {
          value: ['DRY', 'MODERATE MUD', 'MUD', 'LAGOONS'],
          optimal_values: ['MODERATE MUD'],
        },
        associatedTypeOfObject: 'Installation',
      },
    ],
  },
  swine: {
    typesOfObjects: [{ name: 'Animal' }, { name: 'Installation' }],
    variables: [
      {
        name: 'Body condition',
        type: 'NUMBER',
        defaultValue: {
          value: {
            min: 1,
            max: 9,
            optimal_min: 6,
            optimal_max: 7,
            granularity: 1,
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
            optimal_max: 1,
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
            optimal_min: 2,
            optimal_max: 3,
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
            max: 7,
            optimal_min: 0,
            optimal_max: 1,
            granularity: 0.5,
          },
        },
        associatedTypeOfObject: 'Animal',
      },
      {
        name: 'Feed bunk score',
        type: 'NUMBER',
        defaultValue: {
          value: {
            min: 0,
            max: 5,
            optimal_min: 1,
            optimal_max: 2,
            granularity: 1,
          },
        },
        associatedTypeOfObject: 'Installation',
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
        associatedTypeOfObject: 'Installation',
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
        associatedTypeOfObject: 'Installation',
      },
      {
        name: 'Mud score',
        type: 'CATEGORICAL',
        defaultValue: {
          value: ['DRY', 'MODERATE MUD', 'MUD', 'LAGOONS'],
          optimal_values: ['MODERATE MUD'],
        },
        associatedTypeOfObject: 'Installation',
      },
    ],
  },
};
