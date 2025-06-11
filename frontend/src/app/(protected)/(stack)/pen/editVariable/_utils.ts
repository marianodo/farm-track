// Utilizando path alias para evitar problemas con importaciones relativas
import React from 'react';
import { NumericValue, CategoricalValue } from './index';

// Type guard para identificar valores categóricos
export function isCategoricalValue(value: NumericValue | CategoricalValue): value is CategoricalValue {
  return 'categories' in value;
}

// Type guard para identificar valores numéricos
export function isNumericValue(value: NumericValue | CategoricalValue): value is NumericValue {
  return !('categories' in value);
}

// Componente vacío para satisfacer los requisitos de Expo Router
// que espera una exportación por defecto de un componente React
const UtilsComponent: React.FC = () => null;
export default UtilsComponent;
