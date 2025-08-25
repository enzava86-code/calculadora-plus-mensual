import { useState } from 'react';
import {
  CheckCircleIcon,
  XCircleIcon,
  CalendarDaysIcon,
  CurrencyEuroIcon,
  TruckIcon,
  ClockIcon,
  ChartBarIcon,
  DocumentArrowDownIcon,
  EyeIcon,
  PencilIcon
} from '@heroicons/react/24/outline';
import { ResumenCalculos, PlanMensual } from '@/types/plan';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface PlanResultProps {
  resultado: ResumenCalculos;
  onSelectPlan: (plan: PlanMensual) => void;
  onViewDetails: (plan: PlanMensual) => void;
  onExportPlan: (plan: PlanMensual) => void;
}

export default function PlanResult({ resultado, onSelectPlan, onViewDetails, onExportPlan }: PlanResultProps) {
  const [selectedVariant, setSelectedVariant] = useState<PlanMensual | null>(null);
  
  const planes = [resultado.planGenerado, ...(resultado.variantes || [])];
  
  const getPlanTypeLabel = (plan: PlanMensual, index: number) => {
    if (index === 0) return 'Plan Principal';
    return `Variante ${index}`;
  };

  const getPlanColor = (plan: PlanMensual) => {
    if (plan.objetivoCumplido) {
      return 'border-green-500 bg-green-50';
    } else if (Math.abs(plan.diferenciasObjetivo) <= 10) {
      return 'border-yellow-500 bg-yellow-50';
    }
    return 'border-red-500 bg-red-50';
  };

  const getPlanIcon = (plan: PlanMensual) => {
    if (plan.objetivoCumplido) {
      return <CheckCircleIcon className="h-5 w-5 text-green-600" />;
    }
    return <XCircleIcon className="h-5 w-5 text-red-600" />;
  };

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <ChartBarIcon className="h-5 w-5 mr-2 text-green-600" />
              Resultado del Cálculo
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              {planes.length} plan{planes.length > 1 ? 'es' : ''} generado{planes.length > 1 ? 's' : ''} • 
              Tiempo: {resultado.tiempoGeneracion}ms • 
              {resultado.algoritmoUtilizado}
            </p>
          </div>
          
          <div className="flex items-center space-x-2">
            <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              resultado.estadisticas?.mejorSolucionEncontrada 
                ? 'bg-green-100 text-green-800' 
                : 'bg-yellow-100 text-yellow-800'
            }`}>
              {resultado.estadisticas?.mejorSolucionEncontrada ? '✅ Objetivo alcanzado' : '⚠️ Aproximación'}
            </div>
            
            <div className="text-xs text-gray-500">
              Precisión: {resultado.estadisticas?.precisonObjetivo?.toFixed(1)}%
            </div>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 gap-4">
          {planes.map((plan, index) => (
            <div
              key={plan.id}
              className={`border-2 rounded-lg p-4 transition-all cursor-pointer hover:shadow-md ${getPlanColor(plan)} ${
                selectedVariant?.id === plan.id ? 'ring-2 ring-purple-500' : ''
              }`}
              onClick={() => setSelectedVariant(selectedVariant?.id === plan.id ? null : plan)}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  {getPlanIcon(plan)}
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900">
                        {getPlanTypeLabel(plan, index)}
                      </h4>
                      <div className="text-right">
                        <div className="text-lg font-bold text-gray-900">
                          €{plan.totalPlan.toFixed(2)}
                        </div>
                        <div className={`text-sm ${plan.diferenciasObjetivo >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {plan.diferenciasObjetivo >= 0 ? '+' : ''}€{plan.diferenciasObjetivo.toFixed(2)}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-600 mb-3">
                      <div className="flex items-center">
                        <CalendarDaysIcon className="h-4 w-4 mr-1" />
                        {plan.totalDiasConProyecto}/{plan.totalDiasLaborables} días
                      </div>
                      <div className="flex items-center">
                        <ClockIcon className="h-4 w-4 mr-1" />
                        {plan.bloques.length} bloques
                      </div>
                      <div className="flex items-center">
                        <TruckIcon className="h-4 w-4 mr-1" />
                        {plan.totalKm} km
                      </div>
                      <div className="flex items-center">
                        <CurrencyEuroIcon className="h-4 w-4 mr-1" />
                        {plan.totalDietas} dietas
                      </div>
                    </div>

                    {/* Bloques Summary */}
                    <div className="flex flex-wrap gap-2 mb-3">
                      {plan.bloques.slice(0, 3).map((bloque, blIndex) => (
                        <div
                          key={blIndex}
                          className="inline-flex items-center px-2 py-1 rounded-md text-xs bg-gray-100 text-gray-800"
                        >
                          {bloque.proyecto.nombre} ({bloque.totalDias}d)
                        </div>
                      ))}
                      {plan.bloques.length > 3 && (
                        <div className="inline-flex items-center px-2 py-1 rounded-md text-xs bg-gray-200 text-gray-600">
                          +{plan.bloques.length - 3} más
                        </div>
                      )}
                    </div>

                    {/* Expanded Details */}
                    {selectedVariant?.id === plan.id && (
                      <div className="border-t pt-3 mt-3 space-y-3">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 text-sm">
                          <div className="bg-white p-3 rounded border">
                            <div className="font-medium text-gray-900 mb-1">Kilometraje</div>
                            <div className="text-gray-600">
                              {plan.totalKm} km × €{(plan.totalImporteKm / plan.totalKm || 0).toFixed(2)} = 
                              <span className="font-medium ml-1">€{plan.totalImporteKm.toFixed(2)}</span>
                            </div>
                          </div>
                          
                          <div className="bg-white p-3 rounded border">
                            <div className="font-medium text-gray-900 mb-1">Dietas</div>
                            <div className="text-gray-600">
                              {plan.totalDietas} días × €{plan.totalDietas > 0 ? (plan.totalImporteDietas / plan.totalDietas).toFixed(2) : '0.00'} = 
                              <span className="font-medium ml-1">€{plan.totalImporteDietas.toFixed(2)}</span>
                            </div>
                          </div>
                          
                          <div className="bg-white p-3 rounded border">
                            <div className="font-medium text-gray-900 mb-1">Eficiencia</div>
                            <div className="text-gray-600">
                              {((plan.totalPlan / plan.empleado.objetivoMensual) * 100).toFixed(1)}% del objetivo
                            </div>
                          </div>
                        </div>

                        {/* Detailed Blocks */}
                        <div>
                          <div className="font-medium text-gray-900 mb-2">Bloques Detallados</div>
                          <div className="space-y-2">
                            {plan.bloques.map((bloque, blIndex) => (
                              <div key={blIndex} className="bg-white p-3 rounded border text-sm">
                                <div className="flex items-center justify-between mb-1">
                                  <span className="font-medium">{bloque.proyecto.nombre}</span>
                                  <span className="font-bold">€{bloque.totalBloque.toFixed(2)}</span>
                                </div>
                                <div className="text-gray-600 text-xs">
                                  {format(bloque.fechaInicio, 'dd MMM', { locale: es })} - {format(bloque.fechaFin, 'dd MMM', { locale: es })} • 
                                  {bloque.totalDias} días • {bloque.totalKm} km • {bloque.totalDietas} dietas
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-col space-y-2 ml-4">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onViewDetails(plan);
                    }}
                    className="inline-flex items-center px-2 py-1 text-xs font-medium text-blue-700 bg-blue-100 rounded hover:bg-blue-200"
                  >
                    <EyeIcon className="h-3 w-3 mr-1" />
                    Ver
                  </button>
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectPlan(plan);
                    }}
                    className="inline-flex items-center px-2 py-1 text-xs font-medium text-green-700 bg-green-100 rounded hover:bg-green-200"
                  >
                    <PencilIcon className="h-3 w-3 mr-1" />
                    Usar
                  </button>
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onExportPlan(plan);
                    }}
                    className="inline-flex items-center px-2 py-1 text-xs font-medium text-gray-700 bg-gray-100 rounded hover:bg-gray-200"
                  >
                    <DocumentArrowDownIcon className="h-3 w-3 mr-1" />
                    Excel
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Summary Stats */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {resultado.estadisticas?.totalCombinacionesEvaluadas || 0}
              </div>
              <div className="text-sm text-gray-500">Combinaciones evaluadas</div>
            </div>
            
            <div>
              <div className="text-2xl font-bold text-purple-600">
                {planes.filter(p => p.objetivoCumplido).length}
              </div>
              <div className="text-sm text-gray-500">Planes exitosos</div>
            </div>
            
            <div>
              <div className="text-2xl font-bold text-blue-600">
                {Math.max(...planes.map(p => p.bloques.length))}
              </div>
              <div className="text-sm text-gray-500">Máx bloques</div>
            </div>
            
            <div>
              <div className="text-2xl font-bold text-green-600">
                €{Math.max(...planes.map(p => p.totalPlan)).toFixed(0)}
              </div>
              <div className="text-sm text-gray-500">Mejor resultado</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}