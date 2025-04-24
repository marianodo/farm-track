import { useTranslation } from 'react-i18next';

export const useFieldSelectorTypes = () => {
    const { t } = useTranslation();

    const fieldSelectorTypes = [
        {
            [t('detailField.fieldTypeProductionPlaceHolder')]: [
                { label: t('typeProductionText.bovine_of_milk'), value: 'bovine_of_milk' },
                { label: t('typeProductionText.bovine_of_meat'), value: 'bovine_of_meat' },
                { label: t('typeProductionText.swine'), value: 'swine' },
                { label: t('typeProductionText.broil_poultry'), value: 'broil_poultry' },
                { label: t('typeProductionText.posture_poultry'), value: 'posture_poultry' },
                { label: t('breedText.other'), value: 'other' },
            ],
        },
        {
            [t('detailField.fieldBreedPlaceHolder')]: [
                { label: t('breedText.holstein'), value: 'holstein' },
                { label: t('breedText.jersey'), value: 'jersey' },
                { label: t('breedText.crossbreed'), value: 'crossbreed' },
                { label: t('breedText.other'), value: 'other' },
            ],
        },
        {
            [t('detailField.fieldInstallationPlaceHolder')]: [
                { label: t('installationText.grazing'), value: 'grazing' },
                { label: t('installationText.dry_lot'), value: 'dry_lot' },
                { label: t('installationText.freestall'), value: 'freestall' },
                { label: t('installationText.robot_grazing'), value: 'robot_grazing' },
                { label: t('installationText.robot_freestall'), value: 'robot_freestall' },
                { label: t('installationText.mixed'), value: 'mixed' },
                { label: t('installationText.other'), value: 'other' },
            ],
        }
    ];
    return fieldSelectorTypes;
};