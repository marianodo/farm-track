"use client";

import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import variableStore, { Variable, VariableType } from '@/store/variableStore';
import type { VariableInput } from '@/store/variableStore';
import { useAuthStore } from '@/store/authStore';
import useTypeOfObjectStore from '@/store/typeOfObjectStore';

interface VariableFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  /** When present, the modal edits this variable instead of creating a new one. */
  variable?: Variable | null;
}

type FormState = {
  name: string;
  type: VariableType;
  min: string;
  max: string;
  granularity: string;
  optimal_min: string;
  optimal_max: string;
  categories: string; // comma-separated
  optimal_values: string; // comma-separated
  type_of_object_ids: number[];
};

const emptyForm: FormState = {
  name: '',
  type: 'NUMBER',
  min: '',
  max: '',
  granularity: '1',
  optimal_min: '',
  optimal_max: '',
  categories: '',
  optimal_values: '',
  type_of_object_ids: [],
};

/** Extract the flat form fields out of the stored defaultValue shape. */
function formFromVariable(variable: Variable): FormState {
  const inner = (variable.defaultValue && (variable.defaultValue as any).value) || {};
  if (variable.type === 'NUMBER') {
    return {
      ...emptyForm,
      name: variable.name,
      type: 'NUMBER',
      min: inner.min?.toString() ?? '',
      max: inner.max?.toString() ?? '',
      granularity: inner.granularity?.toString() ?? '1',
      optimal_min: inner.optimal_min?.toString() ?? '',
      optimal_max: inner.optimal_max?.toString() ?? '',
    };
  }
  return {
    ...emptyForm,
    name: variable.name,
    type: 'CATEGORICAL',
    categories: Array.isArray(inner.categories) ? inner.categories.join(', ') : '',
    optimal_values: Array.isArray(inner.optimal_values) ? inner.optimal_values.join(', ') : '',
  };
}

export default function VariableFormModal({
  isOpen,
  onClose,
  onSuccess,
  variable,
}: VariableFormModalProps) {
  const { user } = useAuthStore();
  const { createVariable, updateVariable } = variableStore();
  const { typeOfObjects, getAllTypeOfObjects } = useTypeOfObjectStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);

  const isEditing = !!variable;

  useEffect(() => {
    if (isOpen) {
      getAllTypeOfObjects();
      setForm(variable ? formFromVariable(variable) : emptyForm);
      setError(null);
    }
  }, [isOpen, variable, getAllTypeOfObjects]);

  if (!isOpen) return null;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const toggleTypeOfObject = (id: number) => {
    setForm((prev) => ({
      ...prev,
      type_of_object_ids: prev.type_of_object_ids.includes(id)
        ? prev.type_of_object_ids.filter((x) => x !== id)
        : [...prev.type_of_object_ids, id],
    }));
  };

  const buildDefaultValue = (): object => {
    if (form.type === 'NUMBER') {
      const min = parseFloat(form.min);
      const max = parseFloat(form.max);
      const granularity = parseFloat(form.granularity || '1');
      const optimal_min = parseFloat(form.optimal_min);
      const optimal_max = parseFloat(form.optimal_max);
      if ([min, max, optimal_min, optimal_max].some((n) => isNaN(n))) {
        throw new Error('Completá min, max, óptimo mínimo y óptimo máximo con números válidos');
      }
      return { value: { min, max, granularity: isNaN(granularity) ? 1 : granularity, optimal_min, optimal_max } };
    }
    const categories = form.categories.split(',').map((s) => s.trim()).filter(Boolean);
    const optimal_values = form.optimal_values.split(',').map((s) => s.trim()).filter(Boolean);
    if (categories.length === 0) {
      throw new Error('Ingresá al menos una categoría posible');
    }
    if (optimal_values.some((v) => !categories.includes(v))) {
      throw new Error('Los valores óptimos deben ser parte de las categorías ingresadas');
    }
    return { value: { categories, optimal_values } };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!form.name.trim()) {
      setError('El nombre es requerido');
      return;
    }
    if (!isEditing && form.type_of_object_ids.length === 0) {
      setError('Seleccioná al menos un tipo de objeto');
      return;
    }

    setLoading(true);
    try {
      if (!user?.id) throw new Error('Usuario no autenticado');

      const defaultValue = buildDefaultValue();

      if (isEditing && variable) {
        const payload: Partial<VariableInput> = {
          name: form.name,
          type: form.type,
          defaultValue,
        };
        if (form.type_of_object_ids.length) {
          payload.type_of_object_ids = form.type_of_object_ids;
        }
        const result = await updateVariable(variable.id, payload);
        if (!result) throw new Error('No se pudo actualizar la variable');
      } else {
        const result = await createVariable({
          name: form.name,
          type: form.type,
          defaultValue,
          userId: user.id,
          type_of_object_ids: form.type_of_object_ids,
        });
        if (!result) throw new Error('No se pudo crear la variable');
      }

      onClose();
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar la variable');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">{isEditing ? 'Editar Variable' : 'Nueva Variable'}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700" disabled={loading}>
            <X className="h-6 w-6" />
          </button>
        </div>

        {error && <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md text-sm">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre de la variable</label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
            <select
              name="type"
              value={form.type}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loading || isEditing}
            >
              <option value="NUMBER">Número</option>
              <option value="CATEGORICAL">Categórico</option>
            </select>
            {isEditing && (
              <p className="mt-1 text-xs text-gray-400">El tipo no se puede cambiar una vez creada la variable.</p>
            )}
          </div>

          {form.type === 'NUMBER' ? (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mínimo</label>
                <input type="number" step="any" name="min" value={form.min} onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md" required disabled={loading} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Máximo</label>
                <input type="number" step="any" name="max" value={form.max} onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md" required disabled={loading} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Óptimo mínimo</label>
                <input type="number" step="any" name="optimal_min" value={form.optimal_min} onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md" required disabled={loading} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Óptimo máximo</label>
                <input type="number" step="any" name="optimal_max" value={form.optimal_max} onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md" required disabled={loading} />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Granularidad</label>
                <input type="number" step="any" name="granularity" value={form.granularity} onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md" disabled={loading} />
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Categorías posibles (separadas por coma)
                </label>
                <input type="text" name="categories" value={form.categories} onChange={handleChange}
                  placeholder="Ej: Bueno, Regular, Malo"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md" required disabled={loading} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Valores óptimos (separados por coma)
                </label>
                <input type="text" name="optimal_values" value={form.optimal_values} onChange={handleChange}
                  placeholder="Ej: Bueno"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md" disabled={loading} />
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipos de objeto {isEditing && <span className="text-xs text-gray-400">(dejar vacío para no modificar)</span>}
            </label>
            <div className="space-y-2 max-h-36 overflow-y-auto border border-gray-300 rounded-md p-3">
              {typeOfObjects && typeOfObjects.length > 0 ? (
                typeOfObjects.map((t) => (
                  <label key={t.id} className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.type_of_object_ids.includes(t.id)}
                      onChange={() => toggleTypeOfObject(t.id)}
                      className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                      disabled={loading}
                    />
                    <span className="text-sm text-gray-700">{t.name}</span>
                  </label>
                ))
              ) : (
                <p className="text-sm text-gray-400">No hay tipos de objeto disponibles.</p>
              )}
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-2">
            <button type="button" onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200" disabled={loading}>
              Cancelar
            </button>
            <button type="submit"
              className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-blue-300"
              disabled={loading}>
              {loading ? 'Guardando...' : isEditing ? 'Guardar cambios' : 'Crear'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
