"use client"

import React from 'react';
import { useTranslation } from 'react-i18next';
import Navbar from '@/components/layout/Navbar';
import { Shield, Lock, UserCheck, Scale, Bell, FileText } from 'lucide-react';

const PrivacyPolicy = () => {
    const { t } = useTranslation();
    const lastUpdated = new Date().toLocaleDateString(t('i18n.locale', { defaultValue: 'en-US' }), {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    const sections = [
        {
            icon: <Shield className="w-6 h-6 text-green-600" />,
            title: t('privacyPolicy.sections.introduction.title'),
            content: t('privacyPolicy.sections.introduction.content')
        },
        {
            icon: <Lock className="w-6 h-6 text-green-600" />,
            title: t('privacyPolicy.sections.informationCollected.title'),
            content: t('privacyPolicy.sections.informationCollected.content'),
            list: t('privacyPolicy.sections.informationCollected.items', { returnObjects: true })
        },
        {
            icon: <UserCheck className="w-6 h-6 text-green-600" />,
            title: t('privacyPolicy.sections.informationUse.title'),
            content: t('privacyPolicy.sections.informationUse.content'),
            list: t('privacyPolicy.sections.informationUse.items', { returnObjects: true })
        },
        {
            icon: <Scale className="w-6 h-6 text-green-600" />,
            title: t('privacyPolicy.sections.yourRights.title'),
            content: t('privacyPolicy.sections.yourRights.content'),
            list: t('privacyPolicy.sections.yourRights.items', { returnObjects: true })
        },
        {
            icon: <Bell className="w-6 h-6 text-green-600" />,
            title: t('privacyPolicy.sections.updates.title'),
            content: t('privacyPolicy.sections.updates.content')
        },
        {
            icon: <FileText className="w-6 h-6 text-green-600" />,
            title: t('privacyPolicy.sections.contact.title'),
            content: t('privacyPolicy.sections.contact.content'),
            contact: {
                email: "privacy@farmhealth.example.com",
                address: "123 Farm Lane, Agricultural District, CA 94000, USA",
                phone: "+1 (555) 123-4567"
            }
        }
    ];

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />

            <div className="pt-24 pb-16">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="text-center mb-12">
                        <h1 className="text-4xl font-bold text-gray-900 mb-4">{t('privacyPolicy.title')}</h1>
                        <p className="text-lg text-gray-600">{t('privacyPolicy.lastUpdated')}: {lastUpdated}</p>
                    </div>

                    {/* Content */}
                    <div className="space-y-12">
                        {sections.map((section, index) => (
                            <div
                                key={index}
                                className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 transition-all duration-300 hover:shadow-md"
                            >
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="p-2 bg-green-50 rounded-lg">
                                        {section.icon}
                                    </div>
                                    <h2 className="text-2xl font-semibold text-gray-900">{section.title}</h2>
                                </div>

                                <div className="prose max-w-none">
                                    <p className="text-gray-600 mb-4">{section.content}</p>

                                    {section.list && (
                                        <ul className="space-y-2 mb-4">
                                            {section.list.map((item: string, i: number) => (
                                                <li key={i} className="flex items-start">
                                                    <span className="text-green-600 mr-2">•</span>
                                                    <span className="text-gray-600">{item}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    )}

                                    {section.contact && (
                                        <div className="mt-4 space-y-2 text-gray-600">
                                            <p>{t('privacyPolicy.sections.contact.email')}: {section.contact.email}</p>
                                            <p>{t('privacyPolicy.sections.contact.address')}: {section.contact.address}</p>
                                            <p>{t('privacyPolicy.sections.contact.phone')}: {section.contact.phone}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Footer */}
            <footer className="bg-white border-t border-gray-100 py-8">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <p className="text-gray-600">
                        {t('footer.copyright')}
                    </p>
                </div>
            </footer>
        </div>
    );
};

export default PrivacyPolicy;