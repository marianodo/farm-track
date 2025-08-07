"use client"

import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import Navbar from '@/components/layout/Navbar';
import { Mail, AlertTriangle, UserX, Shield, Clock, FileText } from 'lucide-react';

const DeleteAccount = () => {
    const { t } = useLanguage();

    const contacts = [
        {
            name: 'Santiago Bas',
            position: 'Global Ruminant Technical Manager',
            email: 'santiagob09@gmail.com',
            phone: '+5493534069987'
        },
        {
            name: 'Mariano Dominguez',
            position: 'Technical Support',
            email: 'dominguez.amariano@gmail.com',
            phone: '+5493517157848'
        }
    ];

    const sections = [
        {
            icon: <AlertTriangle className="w-6 h-6 text-red-600" />,
            title: t('deleteAccount.sections.warning.title'),
            content: t('deleteAccount.sections.warning.content'),
            type: 'warning'
        },
        {
            icon: <UserX className="w-6 h-6 text-gray-600" />,
            title: t('deleteAccount.sections.whatHappens.title'),
            content: t('deleteAccount.sections.whatHappens.content'),
            list: [
                t('deleteAccount.sections.whatHappens.items.profile'),
                t('deleteAccount.sections.whatHappens.items.fields'),
                t('deleteAccount.sections.whatHappens.items.measurements'),
                t('deleteAccount.sections.whatHappens.items.data')
            ]
        },
        {
            icon: <Shield className="w-6 h-6 text-green-600" />,
            title: t('deleteAccount.sections.process.title'),
            content: t('deleteAccount.sections.process.content'),
            list: [
                t('deleteAccount.sections.process.items.contact'),
                t('deleteAccount.sections.process.items.verification'),
                t('deleteAccount.sections.process.items.confirmation'),
                t('deleteAccount.sections.process.items.deletion')
            ]
        },
        {
            icon: <Clock className="w-6 h-6 text-blue-600" />,
            title: t('deleteAccount.sections.timeline.title'),
            content: t('deleteAccount.sections.timeline.content'),
            list: [
                t('deleteAccount.sections.timeline.items.response'),
                t('deleteAccount.sections.timeline.items.verification'),
                t('deleteAccount.sections.timeline.items.deletion')
            ]
        },
        {
            icon: <Mail className="w-6 h-6 text-green-600" />,
            title: t('deleteAccount.sections.contact.title'),
            content: t('deleteAccount.sections.contact.content'),
            contacts: contacts
        }
    ];

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />

            <div className="pt-24 pb-16">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="text-center mb-12">
                        <h1 className="text-4xl font-bold text-gray-900 mb-4">
                            {t('deleteAccount.title')}
                        </h1>
                        <p className="text-lg text-gray-600">
                            {t('deleteAccount.subtitle')}
                        </p>
                    </div>

                    {/* Content */}
                    <div className="space-y-8">
                        {sections.map((section, index) => (
                            <div
                                key={index}
                                className={`bg-white rounded-xl shadow-sm border p-6 transition-all duration-300 hover:shadow-md ${
                                    section.type === 'warning' 
                                        ? 'border-red-200 bg-red-50' 
                                        : 'border-gray-100'
                                }`}
                            >
                                <div className="flex items-center gap-4 mb-4">
                                    <div className={`p-2 rounded-lg ${
                                        section.type === 'warning' 
                                            ? 'bg-red-100' 
                                            : 'bg-green-50'
                                    }`}>
                                        {section.icon}
                                    </div>
                                    <h2 className="text-2xl font-semibold text-gray-900">{section.title}</h2>
                                </div>

                                <div className="prose max-w-none">
                                    <p className={`mb-4 ${
                                        section.type === 'warning' 
                                            ? 'text-red-700' 
                                            : 'text-gray-600'
                                    }`}>
                                        {section.content}
                                    </p>

                                    {section.list && (
                                        <ul className="space-y-2 mb-4">
                                            {section.list.map((item: string, i: number) => (
                                                <li key={i} className="flex items-start">
                                                    <span className={`mr-2 ${
                                                        section.type === 'warning' 
                                                            ? 'text-red-600' 
                                                            : 'text-green-600'
                                                    }`}>•</span>
                                                    <span className={`${
                                                        section.type === 'warning' 
                                                            ? 'text-red-700' 
                                                            : 'text-gray-600'
                                                    }`}>
                                                        {item}
                                                    </span>
                                                </li>
                                            ))}
                                        </ul>
                                    )}

                                    {section.contacts && (
                                        <div className="mt-6 space-y-4">
                                            {section.contacts.map((contact: any, i: number) => (
                                                <div key={i} className="bg-gray-50 rounded-lg p-4">
                                                    <h4 className="font-semibold text-gray-900 mb-1">{contact.name}</h4>
                                                    <p className="text-green-600 text-sm mb-2">{contact.position}</p>
                                                    <div className="space-y-1">
                                                        <a 
                                                            href={`mailto:${contact.email}?subject=Solicitud de eliminación de cuenta`}
                                                            className="flex items-center text-blue-600 hover:text-blue-800"
                                                        >
                                                            <Mail className="h-4 w-4 mr-2" />
                                                            {contact.email}
                                                        </a>
                                                        <a 
                                                            href={`tel:${contact.phone}`}
                                                            className="flex items-center text-gray-600 hover:text-gray-800"
                                                        >
                                                            <FileText className="h-4 w-4 mr-2" />
                                                            {contact.phone}
                                                        </a>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Additional Information */}
                    <div className="mt-12 bg-blue-50 border border-blue-200 rounded-xl p-6">
                        <h3 className="text-xl font-semibold text-blue-900 mb-3">
                            {t('deleteAccount.additionalInfo.title')}
                        </h3>
                        <p className="text-blue-800 mb-3">
                            {t('deleteAccount.additionalInfo.content')}
                        </p>
                        <p className="text-blue-800">
                            {t('deleteAccount.additionalInfo.note')}
                        </p>
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

export default DeleteAccount; 