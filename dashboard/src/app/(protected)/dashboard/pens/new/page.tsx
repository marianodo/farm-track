"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Plus, Save, X } from 'lucide-react';
import penStore, { Pen } from '@/store/penStore';
import { useAuthStore } from '@/store/authStore';
import useFieldStore from '@/store/fieldStore';
import useTypeOfObjectStore from '@/store/typeOfObjectStore';

interface FormData {
  name: string;
  fieldId: string;
  type_of_object_ids: number[];
}

interface FormErrors {
  name?: string;
  fieldId?: string;
  type_of_object_ids?: string;
}

export default function NewPenPage() {
  const router = useRouter();
  const { createPen, penLoading, penError } = penStore();
  const { user } = useAuthStore();
  const { fieldsByUserId, getFieldsByUser } = useFieldStore();
  const { typeOfObjects, getAllTypeOfObjects } = useTypeOfObjectStore();
  
  const [formData, setFormData] = useState<FormData>({
    name: '',
    fieldId: '',
    type_of_object_ids: []
  });
  
  const [errors, setErrors] = useState<FormErrors>({});
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const userId = user?.id || user?.userId;
      console.log('🔍 DEBUG - New Pen Page - User:', user);
      console.log('🔍 DEBUG - New Pen Page - User ID:', userId);
      
      if (userId) {
        console.log('🔍 DEBUG - New Pen Page - Fetching fields and type of objects');
        await getFieldsByUser(userId);
        await getAllTypeOfObjects();
      } else {
        console.log('🔍 DEBUG - New Pen Page - No user ID available');
      }
    };
    fetchData();
  }, [user, getFieldsByUser, getAllTypeOfObjects]);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'El nombre del corral es requerido';
    }
    
    if (!formData.fieldId) {
      newErrors.fieldId = 'Debe seleccionar un campo';
    }
    
    if (formData.type_of_object_ids.length === 0) {
      newErrors.type_of_object_ids = 'Debe seleccionar al menos un tipo de objeto';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      await createPen(formData);
      setShowSuccess(true);
      
      // Redirigir después de 2 segundos
      setTimeout(() => {
        router.push('/dashboard/pens');
      }, 2000);
    } catch (error) {
      console.error('Error creating pen:', error);
    }
  };

  const handleFieldChange = (fieldId: string) => {
    setFormData(prev => ({ ...prev, fieldId }));
    if (errors.fieldId) {
      setErrors(prev => ({ ...prev, fieldId: undefined }));
    }
  };

  const handleTypeOfObjectChange = (typeId: number) => {
    setFormData(prev => {
      const newTypeIds = prev.type_of_object_ids.includes(typeId)
        ? prev.type_of_object_ids.filter(id => id !== typeId)
        : [...prev.type_of_object_ids, typeId];
      
      return { ...prev, type_of_object_ids: newTypeIds };
    });
    
    if (errors.type_of_object_ids) {
      setErrors(prev => ({ ...prev, type_of_object_ids: undefined }));
    }
  };

  const handleNameChange = (name: string) => {
    setFormData(prev => ({ ...prev, name }));
    if (errors.name) {
      setErrors(prev => ({ ...prev, name: undefined }));
    }
  };

  if (showSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Plus className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">¡Corral creado exitosamente!</h2>
          <p className="text-gray-600">Redirigiendo a la lista de corrales...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <button
                onClick={() => router.back()}
                className="mr-4 p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h1 className="text-2xl font-bold text-gray-900">Nuevo Corral</h1>
            </div>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Nombre del Corral */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Nombre del Corral *
              </label>
              <input
                type="text"
                id="name"
                value={formData.name}
                onChange={(e) => handleNameChange(e.target.value)}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                  errors.name ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Ingrese el nombre del corral"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name}</p>
              )}
            </div>

            {/* Selección de Campo */}
            <div>
              <label htmlFor="fieldId" className="block text-sm font-medium text-gray-700 mb-2">
                Campo *
              </label>
              <select
                id="fieldId"
                value={formData.fieldId}
                onChange={(e) => handleFieldChange(e.target.value)}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                  errors.fieldId ? 'border-red-300' : 'border-gray-300'
                }`}
              >
                <option value="">Seleccione un campo</option>
                {fieldsByUserId?.map((field) => (
                  <option key={field.id} value={field.id}>
                    {field.name}
                  </option>
                ))}
              </select>
              {errors.fieldId && (
                <p className="mt-1 text-sm text-red-600">{errors.fieldId}</p>
              )}
              {/* Debug info */}
              <div className="mt-2 text-xs text-gray-500">
                Debug: {fieldsByUserId ? `${fieldsByUserId.length} campos cargados` : 'No hay campos'}
              </div>
            </div>

            {/* Tipos de Objetos */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipos de Objetos *
              </label>
              <div className="space-y-2 max-h-48 overflow-y-auto border border-gray-300 rounded-md p-3">
                {typeOfObjects?.map((type) => (
                  <label key={type.id} className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.type_of_object_ids.includes(type.id)}
                      onChange={() => handleTypeOfObjectChange(type.id)}
                      className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                    />
                    <span className="text-sm text-gray-700">{type.name}</span>
                  </label>
                ))}
              </div>
              {errors.type_of_object_ids && (
                <p className="mt-1 text-sm text-red-600">{errors.type_of_object_ids}</p>
              )}
            </div>

            {/* Botones */}
            <div className="flex justify-end space-x-3 pt-6 border-t">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors flex items-center"
              >
                <X className="w-4 h-4 mr-2" />
                Cancelar
              </button>
              <button
                type="submit"
                disabled={penLoading}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {penLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Creando...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Crear Corral
                  </>
                )}
              </button>
            </div>

            {/* Error */}
            {penError && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-600">{penError}</p>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
} 