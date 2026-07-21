"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Save, X } from 'lucide-react';
import penStore from '@/store/penStore';
import useTypeOfObjectStore from '@/store/typeOfObjectStore';

interface FormData {
  name: string;
  type_of_object_ids: number[];
}

interface FormErrors {
  name?: string;
  type_of_object_ids?: string;
}

export default function EditPenPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const penId = params.id;

  const { getPenById, updatePen, penLoading, penError } = penStore();
  const { typeOfObjects, getAllTypeOfObjects } = useTypeOfObjectStore();

  const [loadingPen, setLoadingPen] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [fieldName, setFieldName] = useState<string>('');
  const [formData, setFormData] = useState<FormData>({ name: '', type_of_object_ids: [] });
  const [errors, setErrors] = useState<FormErrors>({});
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoadingPen(true);
      await getAllTypeOfObjects();
      const pen = await getPenById(penId);
      if (!pen) {
        setNotFound(true);
        setLoadingPen(false);
        return;
      }

      setFieldName((pen as any).field?.name || pen.fieldName || '');

      const currentTypeIds: number[] = Array.isArray((pen as any).type_of_objects)
        ? (pen as any).type_of_objects
            .map((t: any) => t.type_of_object?.id ?? t.id)
            .filter((id: unknown): id is number => typeof id === 'number')
        : [];

      setFormData({ name: pen.name, type_of_object_ids: currentTypeIds });
      setLoadingPen(false);
    };
    fetchData();
  }, [penId, getPenById, getAllTypeOfObjects]);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    if (!formData.name.trim()) newErrors.name = 'El nombre del corral es requerido';
    if (formData.type_of_object_ids.length === 0) {
      newErrors.type_of_object_ids = 'Debe seleccionar al menos un tipo de objeto';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    const result = await updatePen(penId, {
      name: formData.name,
      type_of_object_ids: formData.type_of_object_ids,
    });

    if (result) {
      setShowSuccess(true);
      setTimeout(() => router.push('/dashboard/pens'), 1500);
    }
  };

  const toggleTypeOfObject = (typeId: number) => {
    setFormData((prev) => {
      const newTypeIds = prev.type_of_object_ids.includes(typeId)
        ? prev.type_of_object_ids.filter((id) => id !== typeId)
        : [...prev.type_of_object_ids, typeId];
      return { ...prev, type_of_object_ids: newTypeIds };
    });
    if (errors.type_of_object_ids) {
      setErrors((prev) => ({ ...prev, type_of_object_ids: undefined }));
    }
  };

  if (loadingPen) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-green-600" />
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-4">
        <p className="text-gray-600">No se encontró el corral solicitado.</p>
        <button
          onClick={() => router.push('/dashboard/pens')}
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
        >
          Volver a Corrales
        </button>
      </div>
    );
  }

  if (showSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Save className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">¡Corral actualizado!</h2>
          <p className="text-gray-600">Redirigiendo a la lista de corrales...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
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
              <h1 className="text-2xl font-bold text-gray-900">Editar Corral</h1>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Nombre del Corral *
              </label>
              <input
                type="text"
                id="name"
                value={formData.name}
                onChange={(e) => {
                  setFormData((prev) => ({ ...prev, name: e.target.value }));
                  if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }));
                }}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                  errors.name ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Ingrese el nombre del corral"
              />
              {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Campo</label>
              <input
                type="text"
                value={fieldName || 'N/D'}
                disabled
                className="w-full px-3 py-2 border border-gray-200 bg-gray-100 rounded-md text-gray-500"
              />
              <p className="mt-1 text-xs text-gray-400">
                El campo de un corral no se puede modificar.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tipos de Objetos *</label>
              <div className="space-y-2 max-h-48 overflow-y-auto border border-gray-300 rounded-md p-3">
                {typeOfObjects?.map((type) => (
                  <label key={type.id} className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.type_of_object_ids.includes(type.id)}
                      onChange={() => toggleTypeOfObject(type.id)}
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
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Guardar cambios
                  </>
                )}
              </button>
            </div>

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
