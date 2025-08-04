"use client"

import React from 'react';
import { useTranslation } from 'react-i18next';
import Navbar from '@/components/layout/Navbar';
import { Mail, AlertTriangle, UserX, Shield, Clock, FileText } from 'lucide-react';

const DeleteAccount = () => {
    const { t } = useTranslation();

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
            title: t('deleteAccount.sections.warning.title', 'Advertencia Importante'),
            content: t('deleteAccount.sections.warning.content', 'La eliminación de tu cuenta es un proceso irreversible. Una vez completado, todos tus datos serán eliminados permanentemente y no podrán ser recuperados.'),
            type: 'warning'
        },
        {
            icon: <UserX className="w-6 h-6 text-gray-600" />,
            title: t('deleteAccount.sections.whatHappens.title', '¿Qué sucede cuando eliminas tu cuenta?'),
            content: t('deleteAccount.sections.whatHappens.content', 'Al eliminar tu cuenta, se eliminarán permanentemente:'),
            list: [
                t('deleteAccount.sections.whatHappens.items.profile', 'Tu perfil de usuario y información personal'),
                t('deleteAccount.sections.whatHappens.items.fields', 'Todos tus campos y establecimientos'),
                t('deleteAccount.sections.whatHappens.items.measurements', 'Todas las mediciones y reportes'),
                t('deleteAccount.sections.whatHappens.items.data', 'Todos los datos asociados a tu cuenta')
            ]
        },
        {
            icon: <Shield className="w-6 h-6 text-green-600" />,
            title: t('deleteAccount.sections.process.title', 'Proceso de Eliminación'),
            content: t('deleteAccount.sections.process.content', 'Para proteger tu privacidad y asegurar que realmente deseas eliminar tu cuenta, seguimos un proceso específico:'),
            list: [
                t('deleteAccount.sections.process.items.contact', 'Debes contactarnos directamente por correo electrónico'),
                t('deleteAccount.sections.process.items.verification', 'Verificaremos tu identidad para confirmar la solicitud'),
                t('deleteAccount.sections.process.items.confirmation', 'Te enviaremos una confirmación antes de proceder'),
                t('deleteAccount.sections.process.items.deletion', 'Eliminaremos todos tus datos de forma permanente')
            ]
        },
        {
            icon: <Clock className="w-6 h-6 text-blue-600" />,
            title: t('deleteAccount.sections.timeline.title', 'Tiempo de Procesamiento'),
            content: t('deleteAccount.sections.timeline.content', 'El proceso de eliminación de cuenta se completará dentro de los siguientes plazos:'),
            list: [
                t('deleteAccount.sections.timeline.items.response', 'Respuesta inicial: 24-48 horas hábiles'),
                t('deleteAccount.sections.timeline.items.verification', 'Verificación de identidad: 1-2 días hábiles'),
                t('deleteAccount.sections.timeline.items.deletion', 'Eliminación completa: 3-5 días hábiles')
            ]
        },
        {
            icon: <Mail className="w-6 h-6 text-green-600" />,
            title: t('deleteAccount.sections.contact.title', 'Contacto para Eliminación'),
            content: t('deleteAccount.sections.contact.content', 'Para solicitar la eliminación de tu cuenta, contacta a uno de nuestros representantes:'),
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
                            {t('deleteAccount.title', 'Eliminar Cuenta')}
                        </h1>
                        <p className="text-lg text-gray-600">
                            {t('deleteAccount.subtitle', 'Información sobre el proceso de eliminación de cuenta')}
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
                            {t('deleteAccount.additionalInfo.title', 'Información Adicional')}
                        </h3>
                        <p className="text-blue-800 mb-3">
                            {t('deleteAccount.additionalInfo.content', 'Si tienes alguna pregunta sobre el proceso de eliminación de cuenta o necesitas ayuda, no dudes en contactarnos. Estamos aquí para ayudarte.')}
                        </p>
                        <p className="text-blue-800">
                            {t('deleteAccount.additionalInfo.note', 'Nota: Este proceso es irreversible. Asegúrate de hacer una copia de seguridad de cualquier información importante antes de solicitar la eliminación.')}
                        </p>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <footer className="bg-white border-t border-gray-100 py-8">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <p className="text-gray-600">
                        {t('footer.copyright', 'MeasureMe. Todos los derechos reservados.')}
                    </p>
                </div>
            </footer>
        </div>
    );
};

export default DeleteAccount; 