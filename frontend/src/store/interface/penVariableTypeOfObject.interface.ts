export interface PenVariableTypeOfObject {
  penId: number;
  variableId: number;
  typeOfObjectId: number;
  custom_parameters: CustomParameters;
  variable: Variable;
}

export interface ExtendedPenVariableTypeOfObject
  extends PenVariableTypeOfObject {
  id: number;
}

export interface CustomParameters {
  value: string[] | NumberValues;
}

export interface NumberValues {
  max: number;
  min: number;
  max_optimo: number;
  min_optimo: number;
  granularity: number;
}

export interface Variable {
  name: string;
  type: string;
}

export type CreatePenVariableTypeOfObject = Required<
  Pick<PenVariableTypeOfObject, 'custom_parameters'>
>;
