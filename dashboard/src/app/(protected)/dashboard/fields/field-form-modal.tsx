"use client";

import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import useFieldStore, { Field } from '@/store/fieldStore';
import { useAuthStore } from '@/store/authStore';

interface FieldFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  /** When present, the modal edits this field instead of creating a new one. */
  field?: Field | null;
}

type FormState = {
  name: string;
  description: string;
  location: string;
  production_type: string;
  breed: string;
  number_of_animals: string;
};

const emptyForm: FormState = {
  name: '',
  description: '',
  location: '',
  production_type: '',
  breed: '',
  number_of_animals: '',
};

const PRODUCTION_TYPES = [
  { value: '', label: 'Sin especificar' },
  { value: 'bovine_of_milk', label: 'Bovino de leche' },
  { value: 'bovine_of_meat', label: 'Bovino de carne' },
  { value: 'swine', label: 'Porcino' },
  { value: 'posture_poultry', label: 'Avícola (postura)' },
  { value: 'broil_poultry', label: 'Avícola (engorde)' },
];

function formFromField(field: Field): FormState {
  return {
    name: field.name || '',
    description: field.description || '',
    location: field.location || '',
    production_type: field.production_type || '',
    breed: field.breed || '',
    number_of_animals: field.number_of_animals?.toString() || '',
  };
}

export default function FieldFormModal({ isOpen, onClose, onSuccess, field }: FieldFormModalProps) {
  const { user } = useAuthStore();
  const { createField, updateField } = useFieldStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);

  const isEditing = !!field;

  useEffect(() => {
    if (isOpen) {
      setForm(field ? formFromField(field) : emptyForm);
      setError(null);
    }
  }, [isOpen, field]);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!form.name.trim()) {
      setError('El nombre del campo es requerido');
      return;
    }

    setLoading(true);
    try {
      if (!user?.id) throw new Error('Usuario no autenticado');

      const payload: Partial<Field> = {
        name: form.name.trim(),
        description: form.description.trim() || undefined,
        location: form.location.trim() || undefined,
        production_type: form.production_type || undefined,
        breed: form.breed.trim() || undefined,
        number_of_animals: form.number_of_animals
          ? Number(form.number_of_animals)
          : undefined,
      };

      if (isEditing && field) {
        const result = await updateField(field.id, payload);
        if (!result) throw new Error('No se pudo actualizar el campo');
      } else {
        await createField({ ...payload, name: form.name.trim(), userId: user.id } as any);
      }

      onClose();
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar el campo');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">{isEditing ? 'Editar Campo' : 'Nuevo Campo'}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700" disabled={loading}>
            <X className="h-6 w-6" />
          </button>
        </div>

        {error && <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md text-sm">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del campo *</label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              required
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
            <input
              type="text"
              name="description"
              value={form.description}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ubicación</label>
            <input
              type="text"
              name="location"
              value={form.location}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              disabled={loading}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de producción</label>
              <select
                name="production_type"
                value={form.production_type}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                disabled={loading}
              >
                {PRODUCTION_TYPES.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Raza</label>
              <input
                type="text"
                name="breed"
                value={form.breed}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                disabled={loading}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Número de animales</label>
            <input
              type="number"
              min="0"
              name="number_of_animals"
              value={form.number_of_animals}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              disabled={loading}
            />
          </div>

          <div className="flex justify-end space-x-2 pt-2">
            <button type="button" onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200" disabled={loading}>
              Cancelar
            </button>
            <button type="submit"
              className="px-4 py-2 text-white bg-green-600 rounded-md hover:bg-green-700 disabled:bg-green-300"
              disabled={loading}>
              {loading ? 'Guardando...' : isEditing ? 'Guardar cambios' : 'Crear'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
