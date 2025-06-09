"use client";

import React, { useEffect, useState } from 'react';
import { ChevronRight, Plus, List, Edit, RefreshCw } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import useFieldStore from '@/store/fieldStore';
import Link from 'next/link';

export default function GeneralPage() {
  const { user } = useAuthStore();
  const { getFieldsByUser, fieldsByUserId, fieldLoading } = useFieldStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFields = async () => {
      setLoading(true);
      await getFieldsByUser();
      setLoading(false);
    };

    fetchFields();
  }, [getFieldsByUser]);

  const handleRefreshFields = async () => {
    setLoading(true);
    await getFieldsByUser();
    setLoading(false);
  };
  
  // Prepare fields section with real data
  const fieldsSection = {
    title: 'Campos',
    colorClass: {
      bg: 'bg-green-50',
      border: 'border-green-100',
      text: 'text-green-600',
      hoverText: 'hover:text-green-800',
      hoverBg: 'hover:bg-green-50',
      borderColor: 'border-green-300'
    },
    path: '/dashboard/fields',
    count: fieldsByUserId?.length || 0,
    items: fieldsByUserId || [],
    loading: loading
  };

  // Sample data for other sections
  const sections = [
    fieldsSection,
    {
      title: 'Corrales',
      colorClass: {
        bg: 'bg-blue-50',
        border: 'border-blue-100',
        text: 'text-blue-600',
        hoverText: 'hover:text-blue-800',
        hoverBg: 'hover:bg-blue-50',
        borderColor: 'border-blue-300'
      },
      path: '/dashboard/pens',
      count: 12,
      items: [
        { id: 1, name: 'Corral A', description: '45 animales' },
        { id: 2, name: 'Corral B', description: '32 animales' },
        { id: 3, name: 'Corral C', description: '28 animales' },
      ]
    },
    {
      title: 'Variables',
      colorClass: {
        bg: 'bg-purple-50',
        border: 'border-purple-100',
        text: 'text-purple-600',
        hoverText: 'hover:text-purple-800',
        hoverBg: 'hover:bg-purple-50',
        borderColor: 'border-purple-300'
      },
      path: '/dashboard/variables',
      count: 18,
      items: [
        { id: 1, name: 'Temperatura', description: 'Ambiental' },
        { id: 2, name: 'Humedad', description: 'Suelo' },
        { id: 3, name: 'Peso', description: 'Animales' },
      ]
    },
    {
      title: 'Reportes',
      colorClass: {
        bg: 'bg-amber-50',
        border: 'border-amber-100',
        text: 'text-amber-600',
        hoverText: 'hover:text-amber-800', 
        hoverBg: 'hover:bg-amber-50',
        borderColor: 'border-amber-300'
      },
      path: '/dashboard/reports',
      count: 6,
      items: [
        { id: 1, name: 'Reporte Mensual', description: 'Mayo 2025' },
        { id: 2, name: 'Reporte Trimestral', description: '1er Trimestre 2025' },
        { id: 3, name: 'Análisis Anual', description: '2024' },
      ]
    }
  ];

  return (
    <div className="p-6">
      {/* Welcome section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Bienvenido, {user?.name || 'Usuario'}</h1>
        <p className="text-gray-600 mt-2">Resumen de administración agrícola</p>
      </div>

      {/* Main Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Fields Section */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className={`${fieldsSection.colorClass.bg} px-6 py-4 border-b ${fieldsSection.colorClass.border}`}>
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-semibold text-gray-800">{fieldsSection.title}</h2>
                <div className="flex items-center">
                  <p className="text-sm text-gray-500 mr-2">Total: {fieldsSection.count}</p>
                  {fieldsSection.loading && (
                    <RefreshCw className="h-3 w-3 animate-spin text-gray-500" />
                  )}
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button 
                  onClick={handleRefreshFields}
                  className={`p-1 ${fieldsSection.colorClass.text} rounded-full ${fieldsSection.colorClass.hoverBg}`}
                  disabled={fieldsSection.loading}
                >
                  <RefreshCw className={`h-4 w-4 ${fieldsSection.loading ? 'animate-spin' : ''}`} />
                </button>
                <Link href={fieldsSection.path} className={`${fieldsSection.colorClass.text} ${fieldsSection.colorClass.hoverText} flex items-center text-sm font-medium`}>
                  Ver Todos
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
          
          <div className="divide-y divide-gray-200">
            {fieldsSection.loading ? (
              <div className="px-6 py-8 text-center">
                <RefreshCw className="h-5 w-5 animate-spin text-gray-400 mx-auto" />
                <p className="mt-2 text-sm text-gray-500">Cargando campos...</p>
              </div>
            ) : fieldsSection.items.length === 0 ? (
              <div className="px-6 py-8 text-center">
                <p className="text-sm text-gray-500">No hay campos disponibles</p>
              </div>
            ) : (
              fieldsSection.items.map((field) => (
                <div key={field.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50">
                  <div>
                    <h3 className="text-sm font-medium text-gray-800">{field.name}</h3>
                    <p className="text-xs text-gray-500">
                      {field.description || field.location || field.production_type || 'Sin descripción'}
                    </p>
                    {field.number_of_animals && (
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full mt-1 inline-block">
                        {field.number_of_animals} animales
                      </span>
                    )}
                  </div>
                  <div className="flex space-x-2">
                    <Link 
                      href={`/dashboard/fields/${field.id}`} 
                      className={`p-1 ${fieldsSection.colorClass.text} ${fieldsSection.colorClass.hoverText} rounded-full ${fieldsSection.colorClass.hoverBg}`}
                    >
                      <Edit size={14} />
                    </Link>
                  </div>
                </div>
              ))
            )}
            
            <div className="px-6 py-4">
              <Link 
                href="/dashboard/fields" 
                className={`flex items-center justify-center w-full py-2 border ${fieldsSection.colorClass.borderColor} ${fieldsSection.colorClass.text} rounded-md ${fieldsSection.colorClass.hoverBg}`}
              >
                <Plus size={16} className="mr-1" />
                <span>Agregar nuevo campo</span>
              </Link>
            </div>
          </div>
        </div>
        
        {/* Other Sections (Still using mock data) */}
        {sections.slice(1).map((section, index) => (
          <div key={index} className="bg-white rounded-lg shadow overflow-hidden">
            <div className={`${section.colorClass.bg} px-6 py-4 border-b ${section.colorClass.border}`}>
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-semibold text-gray-800">{section.title}</h2>
                  <p className="text-sm text-gray-500">Total: {section.count}</p>
                </div>
                <Link href={section.path} className={`${section.colorClass.text} ${section.colorClass.hoverText} flex items-center text-sm font-medium`}>
                  Ver Todos
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Link>
              </div>
            </div>
            
            <div className="divide-y divide-gray-200">
              {section.items.map((item) => (
                <div key={item.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50">
                  <div>
                    <h3 className="text-sm font-medium text-gray-800">{item.name}</h3>
                    <p className="text-xs text-gray-500">{item.description}</p>
                  </div>
                  <div className="flex space-x-2">
                    <button className={`p-1 ${section.colorClass.text} ${section.colorClass.hoverText} rounded-full ${section.colorClass.hoverBg}`}>
                      <Edit size={14} />
                    </button>
                  </div>
                </div>
              ))}
              
              <div className="px-6 py-4">
                <Link 
                  href={section.path} 
                  className={`flex items-center justify-center w-full py-2 border ${section.colorClass.borderColor} ${section.colorClass.text} rounded-md ${section.colorClass.hoverBg}`}
                >
                  <Plus size={16} className="mr-1" />
                  <span>Agregar nuevo</span>
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
