"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Edit, Trash2, Plus, RefreshCw, Home } from 'lucide-react';
import penStore, { Pen } from '@/store/penStore';
import { useAuthStore } from '@/store/authStore';
import useFieldStore from '@/store/fieldStore';

export default function PensPage() {
  const router = useRouter();
  const { getPensByUser, pensByUser, penLoading, penError, deletePen } = penStore();
  const { user } = useAuthStore();
  const { fields, getFieldsByUser } = useFieldStore();
  const [loading, setLoading] = useState(true);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      // Fetch fields first to ensure we have field data for displaying field names
      const userId = user?.id || user?.userId;
      if (userId) {
        await getFieldsByUser(userId);
      }
      await getPensByUser();
      setLoading(false);
    };

    fetchData();
  }, [getPensByUser, getFieldsByUser, user]);

  const handleRefresh = async () => {
    setLoading(true);
    await getPensByUser();
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (deleteConfirmId === id) {
      setLoading(true);
      try {
        await deletePen(id);
        setDeleteConfirmId(null);
        await getPensByUser(); // Refresh the list after deletion
      } catch (error) {
        console.error('Error deleting pen:', error);
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

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Corrales</h1>
        <div className="flex space-x-2">
          <button 
            className="px-4 py-2 bg-green-600 text-white rounded-md flex items-center hover:bg-green-700 transition-colors"
            onClick={() => router.push('/dashboard/pens/new')}
          >
            <Plus className="w-4 h-4 mr-2" />
            Nuevo Corral
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Campo</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Descripción</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-4 text-center">
                    <div className="flex justify-center items-center space-x-2">
                      <RefreshCw className="w-5 h-5 animate-spin text-gray-400" />
                      <span>Cargando corrales...</span>
                    </div>
                  </td>
                </tr>
              ) : penError ? (
                <tr>
                  <td colSpan={4} className="px-6 py-4 text-center">
                    <div className="text-red-500">
                      <p>Error: {penError}</p>
                      <button onClick={handleRefresh} className="mt-2 text-blue-500 hover:underline">
                        Reintentar
                      </button>
                    </div>
                  </td>
                </tr>
              ) : pensByUser && pensByUser.length > 0 ? (
                pensByUser.map((pen: Pen) => (
                  <tr key={pen.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{pen.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center">
                        <Home className="h-4 w-4 mr-2 text-gray-400" />
                        {pen.fieldName || '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {pen.description || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex space-x-2">
                        <button 
                          className="text-indigo-600 hover:text-indigo-900"
                          onClick={() => router.push(`/dashboard/pens/edit/${pen.id}`)}
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button 
                          className={`${deleteConfirmId === pen.id ? 'text-red-800 bg-red-100 p-1 rounded' : 'text-red-600 hover:text-red-900'}`}
                          onClick={() => handleDelete(pen.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                          {deleteConfirmId === pen.id && <span className="ml-1 text-xs">Confirmar</span>}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-6 py-4 text-center">
                    <p className="text-gray-500">No hay corrales disponibles. Crea un nuevo corral para comenzar.</p>
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
