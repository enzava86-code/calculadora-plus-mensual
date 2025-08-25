import React, { useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { CreateProyectoDto, UpdateProyectoDto, Proyecto } from '@/types/proyecto';

interface ProyectoFormProps {
  proyecto?: Proyecto;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateProyectoDto | UpdateProyectoDto) => Promise<void>;
  isEditing?: boolean;
}

export default function ProyectoForm({ proyecto, isOpen, onClose, onSubmit, isEditing = false }: ProyectoFormProps) {
  const [formData, setFormData] = useState({
    nombre: proyecto?.nombre || '',
    ubicacion: proyecto?.ubicacion || 'Peninsula',
    distanciaKm: proyecto?.distanciaKm || 25,
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre del proyecto es obligatorio';
    }


    if (formData.distanciaKm < 1 || formData.distanciaKm > 200) {
      newErrors.distanciaKm = 'La distancia debe estar entre 1km y 200km';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    try {
      await onSubmit(formData);
      onClose();
      setFormData({
        nombre: '',
        ubicacion: 'Peninsula',
        distanciaKm: 25,
      });
      setErrors({});
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      nombre: proyecto?.nombre || '',
      ubicacion: proyecto?.ubicacion || 'Peninsula',
      distanciaKm: proyecto?.distanciaKm || 25,
    });
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  const requiereDieta = formData.distanciaKm > 30;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-gray-500 opacity-75" onClick={handleClose}></div>
        </div>

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

        <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
          <div className="absolute top-0 right-0 pt-4 pr-4">
            <button
              type="button"
              className="bg-white rounded-md text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              onClick={handleClose}
            >
              <span className="sr-only">Cerrar</span>
              <XMarkIcon className="h-6 w-6" aria-hidden="true" />
            </button>
          </div>

          <div className="sm:flex sm:items-start">
            <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-6">
                {isEditing ? 'Editar Proyecto' : 'Nuevo Proyecto'}
              </h3>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre del Proyecto *
                  </label>
                  <input
                    type="text"
                    id="nombre"
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                      errors.nombre ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Ej: Hotel Barcelona Centro"
                  />
                  {errors.nombre && <p className="mt-1 text-sm text-red-600">{errors.nombre}</p>}
                </div>


                <div>
                  <label htmlFor="ubicacion" className="block text-sm font-medium text-gray-700 mb-1">
                    Ubicación *
                  </label>
                  <select
                    id="ubicacion"
                    value={formData.ubicacion}
                    onChange={(e) => setFormData({ ...formData, ubicacion: e.target.value as 'Peninsula' | 'Mallorca' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="Peninsula">Peninsula</option>
                    <option value="Mallorca">Mallorca</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="distanciaKm" className="block text-sm font-medium text-gray-700 mb-1">
                    Distancia (km) *
                  </label>
                  <input
                    type="number"
                    id="distanciaKm"
                    min="1"
                    max="200"
                    value={formData.distanciaKm}
                    onChange={(e) => setFormData({ ...formData, distanciaKm: Number(e.target.value) })}
                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                      errors.distanciaKm ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="25"
                  />
                  {errors.distanciaKm && <p className="mt-1 text-sm text-red-600">{errors.distanciaKm}</p>}
                  
                  {/* Dieta indicator */}
                  <div className={`mt-2 p-2 rounded-md text-sm ${
                    requiereDieta 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {requiereDieta 
                      ? '✅ Incluye dieta (>30km)' 
                      : '❌ Sin dieta (≤30km)'
                    }
                  </div>
                </div>


                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={handleClose}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                  >
                    {loading ? 'Guardando...' : (isEditing ? 'Actualizar' : 'Crear')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}