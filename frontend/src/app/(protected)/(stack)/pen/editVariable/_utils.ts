// Utilizando path alias para evitar problemas con importaciones relativas
import { NumericValue, CategoricalValue } from './index';

// Type guard para identificar valores categóricos
export function isCategoricalValue(value: NumericValue | CategoricalValue): value is CategoricalValue {
  return 'categories' in value;
}

// Type guard para identificar valores numéricos
export function isNumericValue(value: NumericValue | CategoricalValue): value is NumericValue {
  return !('categories' in value);
}

// Prevenir a Expo Router de tratar este archivo como una ruta
export default null;
