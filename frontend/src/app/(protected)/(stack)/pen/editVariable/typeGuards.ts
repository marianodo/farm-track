import { NumericValue, CategoricalValue } from '@/types/variables';

export function isCategoricalValue(value: NumericValue | CategoricalValue): value is CategoricalValue {
  return 'categories' in value;
}

export function isNumericValue(value: NumericValue | CategoricalValue): value is NumericValue {
  return !('categories' in value) && 'max' in value;
}
