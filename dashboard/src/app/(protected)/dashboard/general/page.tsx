"use client";

import React, { useEffect, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import useFieldStore from '@/store/fieldStore';
import penStore from '@/store/penStore';
import variableStore from '@/store/variableStore';
import useReportStore from '@/store/reportStore';
import Link from 'next/link';

// Definición de tipos
interface SectionProps {
  title: string;
  path: string;
  count: number;
  items: any[];
  loading: boolean;
  onRefresh: () => Promise<void>;
}

// Renderización personalizada para cada tipo de elemento
const renderItem = (item: any, sectionTitle: string) => {
  switch(sectionTitle) {
    case 'Campos':
      return (
        <div className="grid grid-cols-3 gap-2 w-full">
          <div className="text-sm font-medium text-gray-800 truncate">{item.name}</div>
          <div className="text-xs text-gray-600 truncate">{item.description || '-'}</div>
          <div className="text-xs text-gray-600 truncate">{item.location || '-'}</div>
        </div>
      );
    case 'Corrales':
      return (
        <div className="grid grid-cols-2 gap-2 w-full">
          <div className="text-sm font-medium text-gray-800 truncate">{item.name}</div>
          <div className="text-xs text-gray-600 truncate">{item.fieldName || '-'}</div>
        </div>
      );
    case 'Variables':
      return (
        <div className="grid grid-cols-2 gap-2 w-full">
          <div className="text-sm font-medium text-gray-800 truncate">{item.name}</div>
          <div className="text-xs text-gray-600 truncate">{item.type || '-'}</div>
        </div>
      );
    case 'Reportes':
      return (
        <div className="grid grid-cols-3 gap-2 w-full">
          <div className="text-xs text-gray-600 truncate">ID: {item.id}</div>
          <div className="text-xs text-gray-600 truncate">
            {item.created_at ? new Date(item.created_at).toLocaleDateString() : '-'}
          </div>
          <div className="text-xs text-gray-600 truncate">{item.fieldName || '-'}</div>
        </div>
      );
    default:
      return (
        <div className="grid grid-cols-2 gap-2 w-full">
          <div className="text-sm font-medium text-gray-800 truncate">{item.name}</div>
          <div className="text-xs text-gray-500 truncate">
            {item.description || item.comment || item.location || item.fieldName || '-'}
          </div>
        </div>
      );
  }
};

// Headers para cada tipo de sección
const getSectionHeaders = (title: string) => {
  switch(title) {
    case 'Campos':
      return (
        <div className="grid grid-cols-3 gap-2 w-full px-6 py-2 bg-gray-50 text-xs font-semibold text-gray-600">
          <div>Nombre</div>
          <div>Descripción</div>
          <div>Ubicación</div>
        </div>
      );
    case 'Corrales':
      return (
        <div className="grid grid-cols-2 gap-2 w-full px-6 py-2 bg-gray-50 text-xs font-semibold text-gray-600">
          <div>Nombre</div>
          <div>Campo</div>
        </div>
      );
    case 'Variables':
      return (
        <div className="grid grid-cols-2 gap-2 w-full px-6 py-2 bg-gray-50 text-xs font-semibold text-gray-600">
          <div>Nombre</div>
          <div>Tipo</div>
        </div>
      );
    case 'Reportes':
      return (
        <div className="grid grid-cols-3 gap-2 w-full px-6 py-2 bg-gray-50 text-xs font-semibold text-gray-600">
          <div>ID</div>
          <div>Fecha</div>
          <div>Campo</div>
        </div>
      );
    default:
      return null;
  }
};

// Componente de sección simplificado
const DashboardSection = ({ title, path, count, items, loading, onRefresh }: SectionProps) => {
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden border border-gray-200">
      <div className="bg-gray-50 px-6 py-4">
        <div className="flex justify-between items-center">
          <Link href={path} className="text-lg font-semibold text-gray-800">
            {title} ({count})
          </Link>
          <button 
            onClick={onRefresh} 
            className="p-1 rounded hover:bg-gray-100"
            disabled={loading}
          >
            <RefreshCw size={18} className={loading ? 'animate-spin text-gray-400' : 'text-gray-600'} />
          </button>
        </div>
      </div>
      
      <div className="h-[260px] overflow-y-auto pr-1">
        {loading ? (
          <div className="flex justify-center items-center h-full">
            <div className="animate-pulse flex space-x-2">
              <div className="h-2.5 w-2.5 bg-gray-300 rounded-full"></div>
              <div className="h-2.5 w-2.5 bg-gray-300 rounded-full"></div>
              <div className="h-2.5 w-2.5 bg-gray-300 rounded-full"></div>
            </div>
          </div>
        ) : items.length > 0 ? (
          <>
            {getSectionHeaders(title)}
            <ul className="divide-y divide-gray-200">
              {items.map((item) => (
                <li key={item.id} className="px-6 py-3 hover:bg-gray-50">
                  {renderItem(item, title)}
                </li>
              ))}
            </ul>
          </>
        ) : (
          <div className="flex justify-center items-center h-full">
            <p className="text-gray-500">No hay {title.toLowerCase()} disponibles</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default function GeneralPage() {
  const { user } = useAuthStore();
  const { getFieldsByUser, fieldsByUserId, fieldLoading } = useFieldStore();
  const { getPensByUser, pensByUser, penLoading } = penStore();
  const { getVariablesByUser, variablesByUser, variableLoading } = variableStore();
  const { getReportsByUser, reportsByUser, reportLoading } = useReportStore();
  
  const [fieldsLoading, setFieldsLoading] = useState(true);
  const [pensLoading, setPensLoading] = useState(true);
  const [variablesLoading, setVariablesLoading] = useState(true);
  const [reportsLoading, setReportsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      console.log('Iniciando carga de datos del dashboard');
      
      // Cargar campos
      setFieldsLoading(true);
      await getFieldsByUser();
      setFieldsLoading(false);
      
      // Cargar corrales
      setPensLoading(true);
      await getPensByUser();
      setPensLoading(false);
      
      // Cargar variables
      setVariablesLoading(true);
      await getVariablesByUser();
      setVariablesLoading(false);
      
      // Cargar reportes
      setReportsLoading(true);
      await getReportsByUser();
      setReportsLoading(false);
    };

    fetchData();
  }, [getFieldsByUser, getPensByUser, getVariablesByUser, getReportsByUser]);

  const handleRefreshFields = async () => {
    setFieldsLoading(true);
    await getFieldsByUser();
    setFieldsLoading(false);
  };
  
  const handleRefreshPens = async () => {
    setPensLoading(true);
    await getPensByUser();
    setPensLoading(false);
  };
  
  const handleRefreshVariables = async () => {
    setVariablesLoading(true);
    await getVariablesByUser();
    setVariablesLoading(false);
  };
  
  const handleRefreshReports = async () => {
    setReportsLoading(true);
    await getReportsByUser();
    setReportsLoading(false);
  };

  // Secciones del dashboard
  const sections = [
    {
      title: 'Campos',
      path: '/dashboard/fields',
      count: fieldsByUserId?.length || 0,
      items: fieldsByUserId || [],
      loading: fieldsLoading,
      onRefresh: handleRefreshFields
    },
    {
      title: 'Corrales',
      path: '/dashboard/pens',
      count: pensByUser?.length || 0,
      items: pensByUser || [],
      loading: pensLoading,
      onRefresh: handleRefreshPens
    },
    {
      title: 'Variables',
      path: '/dashboard/variables',
      count: variablesByUser?.length || 0,
      items: variablesByUser || [],
      loading: variablesLoading,
      onRefresh: handleRefreshVariables
    },
    {
      title: 'Reportes',
      path: '/dashboard/reports',
      count: reportsByUser?.length || 0,
      items: reportsByUser || [],
      loading: reportsLoading,
      onRefresh: handleRefreshReports
    }
  ];

  return (
    <div className="p-6">
      {/* Sección de bienvenida */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Bienvenido, {user?.name || user?.username || user?.email.split('@')[0] || 'Usuario'}</h1>
        <p className="text-gray-600 mt-2">Resumen de administración agrícola</p>
      </div>

      {/* Dashboard principal */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {sections.map((section) => (
          <DashboardSection
            key={section.title}
            title={section.title}
            path={section.path}
            count={section.count}
            items={section.items}
            loading={section.loading}
            onRefresh={section.onRefresh}
          />
        ))}
      </div>
    </div>
  );
}
