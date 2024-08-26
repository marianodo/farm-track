// validationUtils.ts

import { ValidationRule } from './validationRules';

export const validateInput = (
  value: string,
  rules: ValidationRule[],
  t: (key: string) => string
): string[] | null => {
  let errors: string[] = [];

  for (const rule of rules) {
    const error = rule(value, t);
    if (error) {
      errors.push(error);
    }
  }

  return errors.length > 0 ? errors : null;
};

export interface FormErrors {
  [key: string]: string[] | null; // Estructura para los errores del formulario
}
