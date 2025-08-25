import React, { useState, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { CreateEmpleadoDto, UpdateEmpleadoDto, Empleado } from '@/types/empleado';

interface EmpleadoFormProps {
  empleado?: Empleado;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateEmpleadoDto | UpdateEmpleadoDto) => Promise<void>;
  isEditing?: boolean;
}

export default function EmpleadoForm({ empleado, isOpen, onClose, onSubmit, isEditing = false }: EmpleadoFormProps) {
  const [formData, setFormData] = useState({
    nombre: '',
    apellidos: '',
    ubicacion: 'Peninsula' as 'Peninsula' | 'Mallorca',
    objetivoMensual: 200,
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Actualizar formData cuando cambie el empleado
  useEffect(() => {
    if (empleado && isOpen) {
      setFormData({
        nombre: empleado.nombre,
        apellidos: empleado.apellidos,
        ubicacion: empleado.ubicacion,
        objetivoMensual: empleado.objetivoMensual,
      });
    } else if (!empleado && isOpen) {
      setFormData({
        nombre: '',
        apellidos: '',
        ubicacion: 'Peninsula',
        objetivoMensual: 200,
      });
    }
    setErrors({});
  }, [empleado, isOpen]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre es obligatorio';
    }

    if (!formData.apellidos.trim()) {
      newErrors.apellidos = 'Los apellidos son obligatorios';
    }

    if (formData.objetivoMensual < 50 || formData.objetivoMensual > 500) {
      newErrors.objetivoMensual = 'El objetivo debe estar entre 50€ y 500€';
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
        apellidos: '',
        ubicacion: 'Peninsula',
        objetivoMensual: 200,
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
      nombre: empleado?.nombre || '',
      apellidos: empleado?.apellidos || '',
      ubicacion: empleado?.ubicacion || 'Peninsula',
      objetivoMensual: empleado?.objetivoMensual || 200,
    });
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

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
                {isEditing ? 'Editar Empleado' : 'Nuevo Empleado'}
              </h3>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre *
                  </label>
                  <input
                    type="text"
                    id="nombre"
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                      errors.nombre ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Ej: Juan"
                  />
                  {errors.nombre && <p className="mt-1 text-sm text-red-600">{errors.nombre}</p>}
                </div>

                <div>
                  <label htmlFor="apellidos" className="block text-sm font-medium text-gray-700 mb-1">
                    Apellidos *
                  </label>
                  <input
                    type="text"
                    id="apellidos"
                    value={formData.apellidos}
                    onChange={(e) => setFormData({ ...formData, apellidos: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                      errors.apellidos ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Ej: García López"
                  />
                  {errors.apellidos && <p className="mt-1 text-sm text-red-600">{errors.apellidos}</p>}
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
                  <label htmlFor="objetivoMensual" className="block text-sm font-medium text-gray-700 mb-1">
                    Objetivo Mensual (€) *
                  </label>
                  <input
                    type="number"
                    id="objetivoMensual"
                    min="50"
                    max="500"
                    step="5"
                    value={formData.objetivoMensual}
                    onChange={(e) => setFormData({ ...formData, objetivoMensual: Number(e.target.value) })}
                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                      errors.objetivoMensual ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="200"
                  />
                  {errors.objetivoMensual && <p className="mt-1 text-sm text-red-600">{errors.objetivoMensual}</p>}
                  <p className="mt-1 text-sm text-gray-500">Entre 50€ y 500€</p>
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