import {
  CategoricalValue,
  NumericValue,
} from '@/app/(protected)/attributes/create';
import { useTranslation } from 'react-i18next';

export type ValidationRule = (
  value: string,
  t: (key: string) => string
) => string | null;

export const useValidationRules = () => {
  const { t } = useTranslation();

  const startsWithABlankSpace: ValidationRule = (value) => {
    if (value.startsWith(' ')) {
      return t('formErrors.required.startsWithABlankSpace');
    }
    return null;
  };

  const required: ValidationRule = (value) => {
    const trimmedValue = value.trim();

    if (!trimmedValue) {
      return t('formErrors.required.null');
    }

    if (value.startsWith(' ')) {
      return t('formErrors.required.startsWithABlankSpace');
    }

    return null;
  };

  const minLength =
    (min: number): ValidationRule =>
    (value) =>
      value.length >= min
        ? null
        : `${t('formErrors.minLength.firstString')} ${min} ${t(
            'formErrors.minLength.secondString'
          )}`;

  const email: ValidationRule = (value) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
      ? null
      : t('formErrors.email.invalid');

  const matchPassword =
    (confirmPassword: string): ValidationRule =>
    (value) =>
      value === confirmPassword ? null : t('formErrors.matchPassword');

  const validateRangeOrGranularity: (
    inputsValue: NumericValue,
    t: (key: string) => string
  ) => { [key: string]: string } | null = (inputsValue, t) => {
    const { min, max, optimal_min, optimal_max, granularity } = inputsValue;
    const errors: { [key: string]: string } = {};

    if (min >= max) {
      errors.minMax = t('formErrors.range.minGreaterThanMax');
    }

    if (min <= 0 || max <= 0) {
      errors.minMax = t('formErrors.range.minMaxInvalid');
    }

    if (optimal_min <= min || optimal_min >= max) {
      errors.optimalMinMax = t('formErrors.range.minOptimoInvalid');
    }

    if (optimal_max <= optimal_min || optimal_max >= max) {
      errors.optimalMinMax = t('formErrors.range.maxOptimoInvalid');
    }

    if (granularity <= 0) {
      errors.granularity = t('formErrors.granularity.invalid');
    }

    return Object.keys(errors).length ? errors : null;
  };

  const validateCategoricalValue: (
    inputsValue: CategoricalValue | null,
    t: (key: string) => string
  ) => { [key: string]: string } | null = (inputsValue) => {
    const errors: { [key: string]: string } = {};
    if (
      inputsValue === null ||
      !Array.isArray(inputsValue) ||
      inputsValue.length === 0
    ) {
      errors.categoricalEmpty = t('formErrors.range.invalidCategoricalLength');
      return errors;
    }

    if (inputsValue.length < 2) {
      errors.categorical = t('formErrors.range.invalidCategoricalLength');
      return errors;
    }

    return null;
  };

  // if (
  //   inputsValue === null ||
  //   !Array.isArray(inputsValue) ||
  //   inputsValue.length < 2
  // ) {
  //   return { categorical: t('formErrors.range.invalidCategoricalLength') };
  // }
  //   return null;
  // };

  const validateTypeObjectValue: (
    inputsValue: number[] | null,
    t: (key: string) => string
  ) => string | null = (inputsValue, t) => {
    if (
      inputsValue === null ||
      !Array.isArray(inputsValue) ||
      inputsValue.length < 1
    ) {
      return t('formErrors.range.invalidTypeObjectLength');
    }
    return null;
  };

  const validateNameInput: ValidationRule = (value) => {
    const trimmedValue = value.trim();

    if (!trimmedValue) {
      return t('formErrors.required.null');
    }

    if (value.startsWith(' ')) {
      return t('formErrors.required.startsWithABlankSpace');
    }

    if (trimmedValue.length < 3) {
      return `${t('formErrors.minLength.firstString')} 3 ${t(
        'formErrors.minLength.secondString'
      )}`;
    }

    return null;
  };

  return {
    required,
    minLength,
    email,
    matchPassword,
    startsWithABlankSpace,
    validateRangeOrGranularity,
    validateCategoricalValue,
    validateTypeObjectValue,
    validateNameInput,
  };
};
