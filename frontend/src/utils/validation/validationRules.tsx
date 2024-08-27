import { useTranslation } from 'react-i18next';

export type ValidationRule = (
  value: string,
  t: (key: string) => string
) => string | null;

export const useValidationRules = () => {
  const { t } = useTranslation();

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

  return {
    required,
    minLength,
    email,
    matchPassword,
  };
};