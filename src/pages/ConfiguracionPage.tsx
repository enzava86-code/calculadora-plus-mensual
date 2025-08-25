import React from 'react';
import { Cog6ToothIcon } from '@heroicons/react/24/outline';

export default function ConfiguracionPage() {
  return (
    <div>
      <div className="mb-8">
        <div className="flex items-center">
          <Cog6ToothIcon className="h-8 w-8 text-gray-600 mr-3" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Configuración</h1>
            <p className="text-gray-600">Ajustar parámetros del sistema y calendario</p>
          </div>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <div className="text-center py-12">
          <Cog6ToothIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Próximamente</h3>
          <p className="text-gray-500">
            Esta sección permitirá configurar parámetros del sistema, festivos y otros ajustes.
          </p>
        </div>
      </div>
    </div>
  );
}