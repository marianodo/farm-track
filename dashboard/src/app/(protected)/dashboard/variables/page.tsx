"use client";

import React, { useEffect, useState } from 'react';
import { Edit, Trash2, Plus, RefreshCw, Variable as VariableIcon } from 'lucide-react';
import variableStore, { Variable, VariableType } from '@/store/variableStore';
import { useAuthStore } from '@/store/authStore';

export default function VariablesPage() {
  const { getVariablesByUser, variablesByUser, variableLoading, variableError, deleteVariable } = variableStore();
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      await getVariablesByUser();
      setLoading(false);
    };

    fetchData();
  }, [getVariablesByUser]);

  const handleRefresh = async () => {
    setLoading(true);
    await getVariablesByUser();
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (deleteConfirmId === id) {
      setLoading(true);
      try {
        await deleteVariable(id);
        setDeleteConfirmId(null);
        await getVariablesByUser(); // Refresh the list after deletion
      } catch (error) {
        console.error('Error deleting variable:', error);
      } finally {
        setLoading(false);
      }
    } else {
      // First click sets the ID for confirmation
      setDeleteConfirmId(id);
      // Reset confirmation after 3 seconds
      setTimeout(() => {
        setDeleteConfirmId(null);
      }, 3000);
    }
  };

  // Helper function to show variable type in a more readable format
  const formatVariableType = (type: VariableType) => {
    return type === 'NUMBER' ? 'Numérico' : 'Categórico';
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Variables</h1>
        <div className="flex space-x-2">
          <button 
            className="px-4 py-2 bg-green-600 text-white rounded-md flex items-center hover:bg-green-700 transition-colors"
            onClick={() => { window.location.href = '/dashboard/variables/new'; }}
          >
            <Plus className="w-4 h-4 mr-2" />
            Nueva Variable
          </button>
          <button 
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md flex items-center hover:bg-gray-200 transition-colors"
            onClick={handleRefresh}
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Actualizar
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Valor Predeterminado</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha de Creación</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading || variableLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center">
                    <div className="flex justify-center items-center space-x-2">
                      <RefreshCw className="w-5 h-5 animate-spin text-gray-400" />
                      <span>Cargando variables...</span>
                    </div>
                  </td>
                </tr>
              ) : variableError ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center">
                    <div className="text-red-500">
                      <p>Error: {variableError}</p>
                      <button onClick={handleRefresh} className="mt-2 text-blue-500 hover:underline">
                        Reintentar
                      </button>
                    </div>
                  </td>
                </tr>
              ) : variablesByUser && variablesByUser.length > 0 ? (
                variablesByUser.map((variable) => (
                  <tr key={variable.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      <div className="flex items-center">
                        <VariableIcon className="h-4 w-4 mr-2 text-gray-400" />
                        {variable.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        variable.type === 'NUMBER' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                      }`}>
                        {formatVariableType(variable.type)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {typeof variable.defaultValue === 'object' 
                        ? JSON.stringify(variable.defaultValue) 
                        : variable.defaultValue !== undefined && variable.defaultValue !== null 
                          ? String(variable.defaultValue) 
                          : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {variable.createdAt ? new Date(variable.createdAt).toLocaleDateString() : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex space-x-2">
                        <button 
                          className="text-indigo-600 hover:text-indigo-900"
                          onClick={() => { window.location.href = `/dashboard/variables/edit/${variable.id}`; }}
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button 
                          className={`${deleteConfirmId === variable.id ? 'text-red-800 bg-red-100 p-1 rounded' : 'text-red-600 hover:text-red-900'}`}
                          onClick={() => handleDelete(variable.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                          {deleteConfirmId === variable.id && <span className="ml-1 text-xs">Confirmar</span>}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center">
                    <p className="text-gray-500">No hay variables disponibles. Crea una nueva variable para comenzar.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
