import React from 'react';
import { 
  PencilIcon, 
  TrashIcon, 
  MapPinIcon,
  TruckIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';
import { Proyecto } from '@/types/proyecto';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface ProyectosListProps {
  proyectos: Proyecto[];
  loading: boolean;
  onEdit: (proyecto: Proyecto) => void;
  onDelete: (proyecto: Proyecto) => void;
}

export default function ProyectosList({ proyectos, loading, onEdit, onDelete }: ProyectosListProps) {
  if (loading) {
    return (
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <div className="px-4 py-5 sm:p-6">
          <div className="animate-pulse">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4 py-4 border-b border-gray-200 last:border-b-0">
                <div className="h-10 w-10 bg-gray-200 rounded-lg"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-1/3"></div>
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

  if (proyectos.length === 0) {
    return (
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <div className="px-4 py-12 sm:px-6 text-center">
          <div className="mx-auto h-12 w-12 text-gray-400 mb-4">
            <svg fill="none" stroke="currentColor" viewBox="0 0 48 48" aria-hidden="true">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2zM19 21l-7-4-7 4m14 0l7 4 7-4m0 0V5a2 2 0 00-2-2h-10a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z"
              />
            </svg>
          </div>
          <h3 className="text-sm font-medium text-gray-900">No hay proyectos</h3>
          <p className="mt-1 text-sm text-gray-500">
            Comienza creando tu primer proyecto.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-md">
      <ul className="divide-y divide-gray-200">
        {proyectos.map((proyecto) => (
          <li key={proyecto.id}>
            <div className="px-4 py-4 sm:px-6 hover:bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-10 w-10">
                    <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                      proyecto.ubicacion === 'Peninsula' 
                        ? 'bg-blue-500' 
                        : 'bg-purple-500'
                    }`}>
                      <span className="text-sm font-medium text-white">
                        {proyecto.nombre.charAt(0)}
                      </span>
                    </div>
                  </div>
                  <div className="ml-4 flex-1">
                    <div className="flex items-center">
                      <p className="text-sm font-medium text-gray-900 mr-2">
                        {proyecto.nombre}
                      </p>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        proyecto.estado === 'activo' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {proyecto.estado === 'activo' ? 'Activo' : 'Inactivo'}
                      </span>
                    </div>
                    <div className="mt-1 text-sm text-gray-600">
                      <p className="font-medium">{proyecto.cliente}</p>
                      {proyecto.descripcion && (
                        <p className="text-gray-500 truncate">{proyecto.descripcion}</p>
                      )}
                    </div>
                    <div className="mt-2 flex items-center text-sm text-gray-500 space-x-4">
                      <div className="flex items-center">
                        <MapPinIcon className="h-4 w-4 mr-1" />
                        {proyecto.ubicacion}
                      </div>
                      <div className="flex items-center">
                        <TruckIcon className="h-4 w-4 mr-1" />
                        {proyecto.distanciaKm} km
                      </div>
                      <div className="flex items-center">
                        {proyecto.requiereDieta ? (
                          <>
                            <CheckCircleIcon className="h-4 w-4 mr-1 text-green-600" />
                            <span className="text-green-600">Con dieta</span>
                          </>
                        ) : (
                          <>
                            <XCircleIcon className="h-4 w-4 mr-1 text-gray-400" />
                            <span>Sin dieta</span>
                          </>
                        )}
                      </div>
                      <div>
                        Creado: {format(proyecto.fechaCreacion, 'dd MMM yyyy', { locale: es })}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => onEdit(proyecto)}
                    className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <PencilIcon className="h-4 w-4 mr-1" />
                    Editar
                  </button>
                  <button
                    onClick={() => onDelete(proyecto)}
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