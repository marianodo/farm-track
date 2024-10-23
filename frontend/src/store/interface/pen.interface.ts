interface Field {
  id: string;
  name: string;
  description: string;
  location: string;
  latitude: number;
  longitude: number;
  production_type: string;
  number_of_animals: number;
  userId: string;
  created_at: Date;
  updated_at: Date;
}

interface TypeOfObject {
  id: number;
  name: string;
}

interface Pen {
  id: number;
  name: string;
  fieldId: string;
  type_of_objects?: TypeOfObject[];
  field?: Field;
}

type CreatePen = Pick<Pen, 'name' | 'type_of_objects' | 'fieldId'>;

export { Field, TypeOfObject, Pen, CreatePen };