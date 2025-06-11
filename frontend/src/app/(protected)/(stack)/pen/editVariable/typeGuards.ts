import { NumericValue, CategoricalValue } from '@/types/variables';
import React from 'react';

export function isCategoricalValue(value: NumericValue | CategoricalValue): value is CategoricalValue {
  return 'categories' in value;
}

export function isNumericValue(value: NumericValue | CategoricalValue): value is NumericValue {
  return !('categories' in value) && 'max' in value;
}

// Este componente vacío evita el warning de Expo Router
// que espera una exportación por defecto de un componente React
const TypeGuardsComponent: React.FC = () => null;
export default TypeGuardsComponent;
