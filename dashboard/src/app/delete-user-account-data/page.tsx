"use client"

import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import Navbar from '@/components/layout/Navbar';
import { ChevronDown, Smartphone, Menu, Trash2, AlertTriangle } from 'lucide-react';
import Image from 'next/image';

const DeleteUserAccountDataGuide = () => {
    const { t } = useLanguage();
    const [imageErrors, setImageErrors] = useState<{[key: string]: boolean}>({});

    const steps = [
        {
            id: 1,
            title: t('deleteGuide.steps.step1.title'),
            description: t('deleteGuide.steps.step1.description'),
            image: '/screenshots/step1-menu.jpg',
            icon: <Smartphone className="w-6 h-6 text-blue-600" />
        },
        {
            id: 2,
            title: t('deleteGuide.steps.step2.title'),
            description: t('deleteGuide.steps.step2.description'),
            image: '/screenshots/step1-menu.jpg', // Mismo que step1 ya que muestra el menú
            icon: <Menu className="w-6 h-6 text-green-600" />
        },
        {
            id: 3,
            title: t('deleteGuide.steps.step3.title'),
            description: t('deleteGuide.steps.step3.description'),
            image: '/screenshots/step3-confirmation.jpg',
            icon: <Trash2 className="w-6 h-6 text-red-600" />
        }
    ];

    const handleImageError = (stepId: number) => {
        setImageErrors(prev => ({ ...prev, [stepId]: true }));
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />

            <div className="pt-24 pb-16">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="text-center mb-12">
                        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                            {t('deleteGuide.title')}
                        </h1>
                        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                            {t('deleteGuide.subtitle')}
                        </p>
                    </div>

                    {/* Warning Section */}
                    <div className="mb-12 bg-red-50 border border-red-200 rounded-xl p-6">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="p-2 rounded-lg bg-red-100">
                                <AlertTriangle className="w-6 h-6 text-red-600" />
                            </div>
                            <h2 className="text-xl md:text-2xl font-semibold text-red-900">
                                {t('deleteGuide.warning.title')}
                            </h2>
                        </div>
                        <p className="text-red-700 mb-4">
                            {t('deleteGuide.warning.content')}
                        </p>
                        <ul className="space-y-2">
                            <li className="flex items-start">
                                <span className="mr-2 text-red-600">•</span>
                                <span className="text-red-700">{t('deleteGuide.warning.items.irreversible')}</span>
                            </li>
                            <li className="flex items-start">
                                <span className="mr-2 text-red-600">•</span>
                                <span className="text-red-700">{t('deleteGuide.warning.items.allData')}</span>
                            </li>
                            <li className="flex items-start">
                                <span className="mr-2 text-red-600">•</span>
                                <span className="text-red-700">{t('deleteGuide.warning.items.backup')}</span>
                            </li>
                        </ul>
                    </div>

                    {/* Steps Section */}
                    <div className="mb-12">
                        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8 text-center">
                            {t('deleteGuide.stepsTitle')}
                        </h2>
                        
                        <div className="space-y-16">
                            {steps.map((step, index) => (
                                <div key={step.id} className="relative">
                                    <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
                                        {/* Step Content */}
                                        <div className={`flex-1 ${index % 2 === 1 ? 'lg:order-2' : ''}`}>
                                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-8">
                                                <div className="flex items-center gap-4 mb-6">
                                                    <div className="flex items-center justify-center w-10 h-10 md:w-12 md:h-12 bg-blue-100 rounded-full">
                                                        <span className="text-lg md:text-xl font-bold text-blue-600">{step.id}</span>
                                                    </div>
                                                    <div className="p-2 rounded-lg bg-gray-50">
                                                        {step.icon}
                                                    </div>
                                                    <h3 className="text-xl md:text-2xl font-semibold text-gray-900">{step.title}</h3>
                                                </div>
                                                <p className="text-gray-600 text-base md:text-lg leading-relaxed">
                                                    {step.description}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Step Image */}
                                        <div className={`flex-1 ${index % 2 === 1 ? 'lg:order-1' : ''}`}>
                                            <div className="relative bg-white rounded-xl shadow-lg border border-gray-200 p-4">
                                                <div className="relative h-80 md:h-96 w-full max-w-xs mx-auto">
                                                    {!imageErrors[step.id] ? (
                                                        <Image
                                                            src={step.image}
                                                            alt={step.title}
                                                            fill
                                                            className="object-contain rounded-lg"
                                                            onError={() => handleImageError(step.id)}
                                                        />
                                                    ) : (
                                                        <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center">
                                                            <div className="text-center">
                                                                <Smartphone className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                                                                <p className="text-gray-500 text-sm px-4">
                                                                    {t('deleteGuide.imagePlaceholder')}
                                                                </p>
                                                                <p className="text-gray-400 text-xs mt-2">
                                                                    {step.image}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Arrow for desktop - pointing down */}
                                    {index < steps.length - 1 && (
                                        <div className="flex justify-center mt-8 lg:mt-12">
                                            <ChevronDown className="w-8 h-8 text-gray-400" />
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Additional Information */}
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                        <h3 className="text-xl font-semibold text-blue-900 mb-3">
                            {t('deleteGuide.additionalInfo.title')}
                        </h3>
                        <p className="text-blue-800 mb-3">
                            {t('deleteGuide.additionalInfo.content')}
                        </p>
                        <p className="text-blue-800">
                            {t('deleteGuide.additionalInfo.support')}
                        </p>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <footer className="bg-white border-t border-gray-100 py-8">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <p className="text-gray-600">
                        {t('footer.copyright')}
                    </p>
                </div>
            </footer>
        </div>
    );
};

export default DeleteUserAccountDataGuide; 