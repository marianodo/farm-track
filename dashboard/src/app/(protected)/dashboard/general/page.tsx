"use client";

import React, { useEffect, useState } from 'react';
import { ChevronRight, Plus, List, Edit, RefreshCw } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import useFieldStore from '@/store/fieldStore';
import penStore from '@/store/penStore';
import variableStore from '@/store/variableStore';
import useReportStore from '@/store/reportStore';
import Link from 'next/link';

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
      
      // Fetch fields
      setFieldsLoading(true);
      await getFieldsByUser();
      setFieldsLoading(false);
      console.log('Campos cargados:', fieldsByUserId);
      
      // Fetch pens
      setPensLoading(true);
      await getPensByUser();
      setPensLoading(false);
      console.log('Corrales cargados:', pensByUser);
      
      // Fetch variables
      setVariablesLoading(true);
      await getVariablesByUser();
      setVariablesLoading(false);
      console.log('Variables cargadas:', variablesByUser);
      
      // Fetch reports
      setReportsLoading(true);
      console.log('Intentando cargar reportes...');
      try {
        const reports = await getReportsByUser();
        console.log('Reportes obtenidos:', reports);
      } catch (error) {
        console.error('Error al cargar reportes:', error);
      }
      setReportsLoading(false);
      console.log('Estado final de reportes:', reportsByUser);
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
    loading: fieldsLoading
  };

  // Prepare pens section with real data
  const pensSection = {
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
    count: pensByUser?.length || 0,
    items: pensByUser || [],
    loading: pensLoading
  };

  // Prepare variables section with real data
  const variablesSection = {
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
    count: variablesByUser?.length || 0,
    items: variablesByUser || [],
    loading: variablesLoading
  };

  // Prepare reports section with real data
  const reportsSection = {
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
    count: reportsByUser?.length || 0,
    items: reportsByUser || [],
    loading: reportsLoading
  };

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
            <div className="max-h-64 overflow-y-auto">
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
            </div>
            
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

        {/* Pens Section */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className={`${pensSection.colorClass.bg} px-6 py-4 border-b ${pensSection.colorClass.border}`}>
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-semibold text-gray-800">{pensSection.title}</h2>
                <div className="flex items-center">
                  <p className="text-sm text-gray-500 mr-2">Total: {pensSection.count}</p>
                  {pensSection.loading && (
                    <RefreshCw className="h-3 w-3 animate-spin text-gray-500" />
                  )}
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button 
                  onClick={handleRefreshPens}
                  className={`p-1 ${pensSection.colorClass.text} rounded-full ${pensSection.colorClass.hoverBg}`}
                  disabled={pensSection.loading}
                >
                  <RefreshCw className={`h-4 w-4 ${pensSection.loading ? 'animate-spin' : ''}`} />
                </button>
                <Link href={pensSection.path} className={`${pensSection.colorClass.text} ${pensSection.colorClass.hoverText} flex items-center text-sm font-medium`}>
                  Ver Todos
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
          
          <div className="divide-y divide-gray-200">
            <div className="max-h-64 overflow-y-auto">
              {pensSection.loading ? (
                <div className="px-6 py-8 text-center">
                  <RefreshCw className="h-5 w-5 animate-spin text-gray-400 mx-auto" />
                  <p className="mt-2 text-sm text-gray-500">Cargando corrales...</p>
                </div>
              ) : pensSection.items.length === 0 ? (
                <div className="px-6 py-8 text-center">
                  <p className="text-sm text-gray-500">No hay corrales disponibles</p>
                </div>
              ) : (
                pensSection.items.map((pen) => (
                  <div key={pen.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50">
                    <div>
                      <h3 className="text-sm font-medium text-gray-800">{pen.name}</h3>
                      {pen.fieldName && (
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full mt-1 inline-block">
                          Campo: {pen.fieldName}
                        </span>
                      )}
                    </div>
                    <div className="flex space-x-2">
                      <Link 
                        href={`/dashboard/pens/${pen.id}`} 
                        className={`p-1 ${pensSection.colorClass.text} ${pensSection.colorClass.hoverText} rounded-full ${pensSection.colorClass.hoverBg}`}
                      >
                        <Edit size={14} />
                      </Link>
                    </div>
                  </div>
                ))
              )}
            </div>
            
            <div className="px-6 py-4">
              <Link 
                href="/dashboard/pens" 
                className={`flex items-center justify-center w-full py-2 border ${pensSection.colorClass.borderColor} ${pensSection.colorClass.text} rounded-md ${pensSection.colorClass.hoverBg}`}
              >
                <Plus size={16} className="mr-1" />
                <span>Agregar nuevo corral</span>
              </Link>
            </div>
          </div>
        </div>
        
        {/* Variables Section */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className={`${variablesSection.colorClass.bg} px-6 py-4 border-b ${variablesSection.colorClass.border}`}>
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-semibold text-gray-800">{variablesSection.title}</h2>
                <div className="flex items-center">
                  <p className="text-sm text-gray-500 mr-2">Total: {variablesSection.count}</p>
                  {variablesSection.loading && (
                    <RefreshCw className="h-3 w-3 animate-spin text-gray-500" />
                  )}
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button 
                  onClick={handleRefreshVariables}
                  className={`p-1 ${variablesSection.colorClass.text} rounded-full ${variablesSection.colorClass.hoverBg}`}
                  disabled={variablesSection.loading}
                >
                  <RefreshCw className={`h-4 w-4 ${variablesSection.loading ? 'animate-spin' : ''}`} />
                </button>
                <Link href={variablesSection.path} className={`${variablesSection.colorClass.text} ${variablesSection.colorClass.hoverText} flex items-center text-sm font-medium`}>
                  Ver Todos
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
          
          <div className="divide-y divide-gray-200">
            <div className="max-h-64 overflow-y-auto">
              {variablesSection.loading ? (
                <div className="px-6 py-8 text-center">
                  <RefreshCw className="h-5 w-5 animate-spin text-gray-400 mx-auto" />
                  <p className="mt-2 text-sm text-gray-500">Cargando variables...</p>
                </div>
              ) : variablesSection.items.length === 0 ? (
                <div className="px-6 py-8 text-center">
                  <p className="text-sm text-gray-500">No hay variables disponibles</p>
                </div>
              ) : (
                variablesSection.items.map((variable) => (
                  <div key={variable.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50">
                    <div>
                      <h3 className="text-sm font-medium text-gray-800">{variable.name}</h3>
                      <span className="text-xs bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full mt-1 inline-block">
                        {variable.type === 'NUMBER' ? 'Numérico' : 'Categórico'}
                      </span>
                    </div>
                    <div className="flex space-x-2">
                      <Link 
                        href={`/dashboard/variables/${variable.id}`} 
                        className={`p-1 ${variablesSection.colorClass.text} ${variablesSection.colorClass.hoverText} rounded-full ${variablesSection.colorClass.hoverBg}`}
                      >
                        <Edit size={14} />
                      </Link>
                    </div>
                  </div>
                ))
              )}
            </div>
            
            <div className="px-6 py-4">
              <Link 
                href="/dashboard/variables"
                className={`flex items-center justify-center w-full py-2 border ${variablesSection.colorClass.borderColor} ${variablesSection.colorClass.text} rounded-md ${variablesSection.colorClass.hoverBg}`}
              >
                <Plus size={16} className="mr-1" />
                <span>Agregar nueva variable</span>
              </Link>
            </div>
          </div>
        </div>
        
        {/* Reports Section */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className={`${reportsSection.colorClass.bg} px-6 py-4 border-b ${reportsSection.colorClass.border}`}>
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-semibold text-gray-800">{reportsSection.title}</h2>
                <div className="flex items-center">
                  <p className="text-sm text-gray-500 mr-2">Total: {reportsSection.count}</p>
                  {reportsSection.loading && (
                    <RefreshCw className="h-3 w-3 animate-spin text-gray-500" />
                  )}
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button 
                  onClick={handleRefreshReports}
                  className={`p-1 ${reportsSection.colorClass.text} rounded-full ${reportsSection.colorClass.hoverBg}`}
                  disabled={reportsSection.loading}
                >
                  <RefreshCw className={`h-4 w-4 ${reportsSection.loading ? 'animate-spin' : ''}`} />
                </button>
                <Link href={reportsSection.path} className={`${reportsSection.colorClass.text} ${reportsSection.colorClass.hoverText} flex items-center text-sm font-medium`}>
                  Ver Todos
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
          
          <div className="divide-y divide-gray-200">
            <div className="max-h-64 overflow-y-auto">
              {reportsSection.loading ? (
                <div className="px-6 py-8 text-center">
                  <RefreshCw className="h-5 w-5 animate-spin text-gray-400 mx-auto" />
                  <p className="mt-2 text-sm text-gray-500">Cargando reportes...</p>
                </div>
              ) : reportsSection.items.length === 0 ? (
                <div className="px-6 py-8 text-center">
                  <p className="text-sm text-gray-500">No hay reportes disponibles</p>
                </div>
              ) : (
                reportsSection.items.map((item) => (
                  <div key={item.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50">
                    <div>
                      <h3 className="text-sm font-medium text-gray-800">{item.name}</h3>
                      {item.comment && (
                        <p className="text-xs text-gray-500">{item.comment}</p>
                      )}
                      {item.fieldName && (
                        <span className="text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full mt-1 inline-block">
                          Campo: {item.fieldName}
                        </span>
                      )}
                      {item.created_at && (
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(item.created_at).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                    <div className="flex space-x-2">
                      <Link 
                        href={`${reportsSection.path}/${item.id}`} 
                        className={`p-1 ${reportsSection.colorClass.text} ${reportsSection.colorClass.hoverText} rounded-full ${reportsSection.colorClass.hoverBg}`}
                      >
                        <Edit size={14} />
                      </Link>
                    </div>
                  </div>
                ))
              )}
            </div>
            
            <div className="px-6 py-4">
              <Link 
                href={reportsSection.path} 
                className={`flex items-center justify-center w-full py-2 border ${reportsSection.colorClass.borderColor} ${reportsSection.colorClass.text} rounded-md ${reportsSection.colorClass.hoverBg}`}
              >
                <Plus size={16} className="mr-1" />
                <span>Crear nuevo reporte</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
