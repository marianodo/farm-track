export interface Report {
  id: number;
  name: string;
  comment: string;
  field_id: string;
  created_at: Date;
  updated_at: Date;
}

export type CreateReport = Pick<Report, 'name' | 'field_id' | 'comment'>;

export type ReportWithMeasurements = Pick<
  Report,
  'id' | 'name' | 'field_id'
> & {
  measurements: Measurement[];
};

export type ReportWithMeasurements2 = Pick<
  Report,
  'id' | 'name' | 'field_id'
> & {
  report_id: number;
  subjects: Subject2;
  measurements: Measurement[];
};

export interface Measurement {
  id: number;
  value: string;
  report_id: number;
  created_at: Date;
  updated_at: Date;
  subject: Subject;
  pen_variable_type_of_object: PenVariableTypeOfObject;
}

export interface MeasurementData {
  pen_variable_type_of_object_id: number;
  custom_parameters: CustomParameters;
  variable: Variable;
}

export interface MeasurementEditData {
  id: number;
  value: string;
  subject_id: number;
  pen_variable_type_of_object: PenVariableTypeOfObject;
}

export interface PenVariableTypeOfObject {
  variable: Variable;
  custom_parameters: CustomParameters;
}

export interface Variable {
  name: string;
  type: string;
}

export interface PenVariableTypeOfObject {
  id: number;
  penId: number;
  variableId: number;
  typeOfObjectId: number;
  custom_parameters: CustomParameters;
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

export interface Subject2 {
  id: number;
  name: string;
  type_of_object: TypeOfObject;
  measurement: Measurement[];
}

export interface Subject {
  id: number;
  name: string;
  type_of_object: TypeOfObject;
}

export interface TypeOfObject {
  id: number;
  name: string;
}
