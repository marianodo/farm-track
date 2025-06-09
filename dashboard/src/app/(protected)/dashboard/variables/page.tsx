"use client";

import React, { useEffect, useState } from 'react';
import { Edit, Trash2, Plus, RefreshCw } from 'lucide-react';
import variableStore, { Variable } from '@/store/variableStore';
import { useAuthStore } from '@/store/authStore';
import AddVariableModal from './add-variable-modal';

export default function VariablesPage() {
  const { getVariablesByUser, variablesByUser, variableLoading, variableError } = variableStore();
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    console.log('Current auth state:', { 
      user, 
      userId: user?.id, 
      isAuthenticated: !!user 
    });
    
    const fetchVariables = async () => {
      setLoading(true);
      console.log('Fetching variables regardless of auth state...');
      await getVariablesByUser();
      setLoading(false);
    };

    fetchVariables();
  }, [getVariablesByUser]);

  const handleRefresh = async () => {
    setLoading(true);
    await getVariablesByUser();
    setLoading(false);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Variables</h1>
        <div className="space-x-2">
          <button
            onClick={handleRefresh}
            className="px-3 py-2 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
            disabled={loading}
          >
            <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center"
            disabled={loading}
            onClick={() => setShowAddModal(true)}
          >
            <Plus className="h-5 w-5 mr-1" />
            Nueva Variable
          </button>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Rango & Valores</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Valores Óptimos</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading || variableLoading ? (
              <tr>
                <td colSpan={5} className="px-6 py-4 whitespace-nowrap">
                  <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                  </div>
                </td>
              </tr>
            ) : variableError ? (
              <tr>
                <td colSpan={5} className="px-6 py-4 whitespace-nowrap">
                  <div className="text-center p-6 bg-red-100 rounded-md text-red-700">
                    <p>{variableError}</p>
                  </div>
                </td>
              </tr>
            ) : variablesByUser.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-4 whitespace-nowrap">
                  <div className="text-center p-10 bg-gray-50 rounded-lg">
                    <div className="mb-4">
                      <p className="text-gray-700 font-bold">No hay variables para mostrar.</p>
                      <p className="text-gray-500 mt-2">El usuario actual no tiene variables configuradas.</p>
                    </div>
                    
                    <div className="p-4 border rounded-md bg-blue-50 mt-4 max-w-lg mx-auto text-left">
                      <h3 className="font-bold text-blue-800 mb-2">Información de diagnóstico:</h3>
                      <p className="text-sm mb-2">• Usuario ID: <strong>{user?.id || 'Sin identificar'}</strong></p>
                      <p className="text-sm mb-2">• Email: <strong>{user?.email || 'No disponible'}</strong></p>
                      <p className="text-sm mb-2">• Autenticado: <strong>{user && user.id ? 'Sí' : 'No'}</strong></p>
                      <p className="text-sm mb-2">• API endpoint: <strong>/variables/byUser/{user?.id}</strong></p>
                      <p className="text-sm mb-2">• Token presente: <strong>{useAuthStore.getState().token ? 'Sí' : 'No'}</strong></p>
                      <p className="text-sm">• Estado: <strong>{user?.id ? 'Autenticado sin variables' : 'Autenticación incompleta'}</strong></p>
                    </div>
                  </div>
                </td>
              </tr>
            ) : (
              variablesByUser.map((variable: Variable) => {
                // Process variable data based on type
                const isNumeric = variable.type === 'NUMBER';
                const value = variable.defaultValue || {};
                
                // Format ranges and optimal values based on variable type
                let rangeDisplay: React.ReactNode = null;
                let optimalDisplay: React.ReactNode = null;
                
                if (isNumeric && typeof value === 'object') {
                  // Log the exact structure of numerical data
                  console.log(`Numerical variable ${variable.name} value:`, value);
                  
                  const minMax = value.value || {};
                  console.log(`After extraction, minMax for ${variable.name}:`, minMax);
                  
                  // Show the fields we're checking for
                  console.log(`Fields for ${variable.name}:`, {
                    min: minMax.min,
                    max: minMax.max,
                    granularity: minMax.granularity,
                    optimal_min: minMax.optimal_min,
                    optimal_max: minMax.optimal_max,
                  });
                  
                  rangeDisplay = (
                    <span>
                      Min: <strong>{minMax.min !== undefined ? minMax.min : 'N/A'}</strong>, 
                      Max: <strong>{minMax.max !== undefined ? minMax.max : 'N/A'}</strong>
                      {minMax.granularity !== undefined && <span>, Granularidad: <strong>{minMax.granularity}</strong></span>}
                    </span>
                  );
                  
                  optimalDisplay = (
                    <span>
                      Min óptimo: <strong>{minMax.optimal_min !== undefined ? minMax.optimal_min : 'N/A'}</strong>, 
                      Max óptimo: <strong>{minMax.optimal_max !== undefined ? minMax.optimal_max : 'N/A'}</strong>
                    </span>
                  );
                } else if (!isNumeric && typeof value === 'object') {
                  // Categorical variable
                  console.log('Categorical variable values:', value);
                  
                  // Handle the actual structure as seen in the logs
                  let categories: string[] = [];
                  let optimalValues: string[] = [];
                  
                  // Check for the correct structure based on the logs
                  if (value.value && typeof value.value === 'object') {
                    // Structure from the logs: value.categories and value.optimal_values
                    if (Array.isArray(value.value.categories)) {
                      categories = value.value.categories;
                    }
                    
                    if (Array.isArray(value.value.optimal_values)) {
                      optimalValues = value.value.optimal_values;
                    }
                  }
                  
                  // Fallbacks for other possible structures
                  if (categories.length === 0) {
                    if (Array.isArray(value.categories)) {
                      categories = value.categories;
                    } else if (Array.isArray(value.values)) {
                      categories = value.values;
                    }
                  }
                  
                  if (optimalValues.length === 0) {
                    if (Array.isArray(value.optimal_values)) {
                      optimalValues = value.optimal_values;
                    } else if (Array.isArray(value.optimalValues)) {
                      optimalValues = value.optimalValues;
                    }
                  }
                  
                  rangeDisplay = (
                    <div className="max-w-xs overflow-hidden">
                      <span className="block truncate">{categories.length > 0 ? categories.join(', ') : 'No hay valores'}</span>
                    </div>
                  );
                  
                  optimalDisplay = (
                    <div className="max-w-xs overflow-hidden">
                      <span className="block truncate">{optimalValues.length > 0 ? optimalValues.join(', ') : 'No hay valores óptimos'}</span>
                    </div>
                  );
                } else {
                  // Fallback for unexpected formats
                  rangeDisplay = <span className="text-gray-400 italic">Formato no reconocido</span>;
                  optimalDisplay = <span className="text-gray-400 italic">No definido</span>;
                }
                
                return (
                  <tr key={variable.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{variable.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{variable.type}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{rangeDisplay}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{optimalDisplay}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex space-x-2">
                        <button className="text-blue-600 hover:text-blue-800">
                          <Edit className="h-5 w-5" />
                        </button>
                        <button className="text-red-600 hover:text-red-800">
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
      
      {variableError && (
        <div className="mt-4 p-4 bg-red-50 text-red-800 rounded-md">
          <p>Error: {variableError}</p>
        </div>
      )}
      
      <AddVariableModal 
        isOpen={showAddModal} 
        onClose={() => setShowAddModal(false)} 
        onSuccess={() => {
          handleRefresh();
        }}
      />
    </div>
  );
}
