"use client";

import React, { useEffect, useState } from 'react';
import { Edit, Trash2, Plus, RefreshCw } from 'lucide-react';
import useFieldStore, { Field } from '@/store/fieldStore';
import FieldFormModal from './field-form-modal';

export default function FieldsPage() {
  const { getFieldsByUser, fieldsByUserId, fieldError, deleteField } = useFieldStore();
  const [loading, setLoading] = useState(true);
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingField, setEditingField] = useState<Field | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  useEffect(() => {
    const fetchFields = async () => {
      setLoading(true);
      await getFieldsByUser();
      setLoading(false);
    };

    fetchFields();
  }, [getFieldsByUser]);

  const handleRefresh = async () => {
    setLoading(true);
    await getFieldsByUser();
    setLoading(false);
  };

  const handleOpenCreate = () => {
    setEditingField(null);
    setShowFormModal(true);
  };

  const handleOpenEdit = (field: Field) => {
    setEditingField(field);
    setShowFormModal(true);
  };

  const handleDelete = async (id: string) => {
    if (deleteConfirmId === id) {
      setLoading(true);
      try {
        await deleteField(id);
        setDeleteConfirmId(null);
      } finally {
        setLoading(false);
      }
    } else {
      setDeleteConfirmId(id);
      setTimeout(() => setDeleteConfirmId(null), 3000);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Campos</h1>
        <div className="flex space-x-2">
          <button
            className="px-4 py-2 bg-green-600 text-white rounded-md flex items-center hover:bg-green-700 transition-colors"
            onClick={handleOpenCreate}
          >
            <Plus className="w-4 h-4 mr-2" />
            Nuevo Campo
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

      {fieldError && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md text-sm">{fieldError}</div>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Descripción</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ubicación</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo de Producción</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">N° Animales</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center">
                    <div className="flex justify-center items-center space-x-2">
                      <RefreshCw className="w-5 h-5 animate-spin text-gray-400" />
                      <span>Cargando campos...</span>
                    </div>
                  </td>
                </tr>
              ) : fieldsByUserId && fieldsByUserId.length > 0 ? (
                fieldsByUserId.map((field) => (
                  <tr key={field.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{field.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{field.description || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{field.location || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{field.production_type || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{field.number_of_animals || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex space-x-2 justify-end">
                        <button
                          className="text-indigo-600 hover:text-indigo-900"
                          onClick={() => handleOpenEdit(field)}
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          className={deleteConfirmId === field.id
                            ? 'text-red-800 bg-red-100 px-2 py-1 rounded flex items-center gap-1'
                            : 'text-red-600 hover:text-red-900'}
                          onClick={() => handleDelete(field.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                          {deleteConfirmId === field.id && <span className="text-xs">Confirmar</span>}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center">
                    <div className="text-gray-500">
                      No hay campos disponibles. Agrega uno nuevo para comenzar.
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <FieldFormModal
        isOpen={showFormModal}
        field={editingField}
        onClose={() => setShowFormModal(false)}
        onSuccess={handleRefresh}
      />
    </div>
  );
}
