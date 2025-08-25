import React from 'react';
import { 
  PencilIcon, 
  TrashIcon, 
  MapPinIcon,
  CurrencyEuroIcon 
} from '@heroicons/react/24/outline';
import { Empleado } from '@/types/empleado';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface EmpleadosListProps {
  empleados: Empleado[];
  loading: boolean;
  onEdit: (empleado: Empleado) => void;
  onDelete: (empleado: Empleado) => void;
}

export default function EmpleadosList({ empleados, loading, onEdit, onDelete }: EmpleadosListProps) {
  if (loading) {
    return (
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <div className="px-4 py-5 sm:p-6">
          <div className="animate-pulse">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4 py-4 border-b border-gray-200 last:border-b-0">
                <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
                <div className="flex space-x-2">
                  <div className="h-8 w-16 bg-gray-200 rounded"></div>
                  <div className="h-8 w-16 bg-gray-200 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (empleados.length === 0) {
    return (
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <div className="px-4 py-12 sm:px-6 text-center">
          <div className="mx-auto h-12 w-12 text-gray-400 mb-4">
            <svg fill="none" stroke="currentColor" viewBox="0 0 48 48" aria-hidden="true">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M34 40h10v-4a6 6 0 00-10.712-3.714M34 40H14m20 0v-4a9.971 9.971 0 00-.712-3.714M14 40H4v-4a6 6 0 0110.712-3.714M14 40v-4a9.971 9.971 0 01.712-3.714M18 20a6 6 0 11-12 0 6 6 0 0112 0zm12 0a6 6 0 11-12 0 6 6 0 0112 0z"
              />
            </svg>
          </div>
          <h3 className="text-sm font-medium text-gray-900">No hay empleados</h3>
          <p className="mt-1 text-sm text-gray-500">
            Comienza creando tu primer empleado.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-md">
      <ul className="divide-y divide-gray-200">
        {empleados.map((empleado) => (
          <li key={empleado.id}>
            <div className="px-4 py-4 sm:px-6 hover:bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-10 w-10">
                    <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center">
                      <span className="text-sm font-medium text-white">
                        {empleado.nombre.charAt(0)}{empleado.apellidos.charAt(0)}
                      </span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <div className="flex items-center">
                      <p className="text-sm font-medium text-gray-900 mr-2">
                        {empleado.nombre} {empleado.apellidos}
                      </p>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        empleado.estado === 'activo' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {empleado.estado === 'activo' ? 'Activo' : 'Inactivo'}
                      </span>
                    </div>
                    <div className="mt-1 flex items-center text-sm text-gray-500 space-x-4">
                      <div className="flex items-center">
                        <MapPinIcon className="h-4 w-4 mr-1" />
                        {empleado.ubicacion}
                      </div>
                      <div className="flex items-center">
                        <CurrencyEuroIcon className="h-4 w-4 mr-1" />
                        {empleado.objetivoMensual}€/mes
                      </div>
                      <div>
                        Creado: {format(empleado.fechaCreacion, 'dd MMM yyyy', { locale: es })}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => onEdit(empleado)}
                    className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <PencilIcon className="h-4 w-4 mr-1" />
                    Editar
                  </button>
                  <button
                    onClick={() => onDelete(empleado)}
                    className="inline-flex items-center px-3 py-1.5 border border-red-300 text-xs font-medium rounded text-red-700 bg-red-50 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    <TrashIcon className="h-4 w-4 mr-1" />
                    Eliminar
                  </button>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}