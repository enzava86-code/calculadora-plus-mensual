import React from 'react';
import { DocumentTextIcon } from '@heroicons/react/24/outline';

export default function PlanesPage() {
  return (
    <div>
      <div className="mb-8">
        <div className="flex items-center">
          <DocumentTextIcon className="h-8 w-8 text-orange-600 mr-3" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Gestión de Planes</h1>
            <p className="text-gray-600">Ver, editar y gestionar planes mensuales generados</p>
          </div>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <div className="text-center py-12">
          <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Próximamente</h3>
          <p className="text-gray-500">
            Esta sección permitirá gestionar todos los planes mensuales generados.
          </p>
        </div>
      </div>
    </div>
  );
}