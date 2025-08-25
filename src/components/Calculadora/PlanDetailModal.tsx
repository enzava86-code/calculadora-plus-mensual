import React from 'react';
import {
  XMarkIcon,
  CalendarDaysIcon,
  UserIcon,
  BuildingOfficeIcon,
  CurrencyEuroIcon,
  // TruckIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';
import { PlanMensual } from '@/types/plan';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay } from 'date-fns';
import { es } from 'date-fns/locale';

interface PlanDetailModalProps {
  plan: PlanMensual | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function PlanDetailModal({ plan, isOpen, onClose }: PlanDetailModalProps) {
  if (!isOpen || !plan) return null;

  // Generate calendar view
  const firstDay = plan.diasLaborables[0]?.fecha;
  const lastDay = plan.diasLaborables[plan.diasLaborables.length - 1]?.fecha;
  
  let calendarDays: Date[] = [];
  if (firstDay && lastDay) {
    const startWeek = startOfWeek(firstDay, { weekStartsOn: 1 }); // Monday
    const endWeek = endOfWeek(lastDay, { weekStartsOn: 1 });
    calendarDays = eachDayOfInterval({ start: startWeek, end: endWeek });
  }

  const getDayInfo = (date: Date) => {
    return plan.diasLaborables.find(dia => isSameDay(dia.fecha, date));
  };

  const getDayClass = (date: Date) => {
    const dayInfo = getDayInfo(date);
    if (!dayInfo) return 'bg-gray-50 text-gray-400';
    
    const bloque = plan.bloques.find(b => 
      b.diasLaborables.some(d => isSameDay(d.fecha, date))
    );
    
    if (bloque) {
      const colors = [
        'bg-blue-100 text-blue-800 border-blue-200',
        'bg-green-100 text-green-800 border-green-200', 
        'bg-purple-100 text-purple-800 border-purple-200',
        'bg-yellow-100 text-yellow-800 border-yellow-200',
        'bg-pink-100 text-pink-800 border-pink-200',
        'bg-indigo-100 text-indigo-800 border-indigo-200',
      ];
      const bloqueIndex = plan.bloques.indexOf(bloque);
      return colors[bloqueIndex % colors.length];
    }
    
    return 'bg-white text-gray-900 border-gray-200';
  };

  const weekDays = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-gray-500 opacity-75" onClick={onClose}></div>
        </div>

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-6xl sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h3 className="text-lg leading-6 font-medium text-gray-900 flex items-center">
                  <CalendarDaysIcon className="h-6 w-6 mr-2 text-purple-600" />
                  Detalle del Plan Mensual
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  {format(firstDay || new Date(), 'MMMM yyyy', { locale: es })} - {plan.empleado.nombre} {plan.empleado.apellidos}
                </p>
              </div>
              <button
                type="button"
                className="bg-white rounded-md text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                onClick={onClose}
              >
                <span className="sr-only">Cerrar</span>
                <XMarkIcon className="h-6 w-6" aria-hidden="true" />
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Plan Summary */}
              <div className="lg:col-span-1 space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                    <UserIcon className="h-4 w-4 mr-1" />
                    Resumen del Plan
                  </h4>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Objetivo:</span>
                      <span className="font-medium">€{plan.empleado.objetivoMensual}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Generado:</span>
                      <span className={`font-medium ${plan.objetivoCumplido ? 'text-green-600' : 'text-red-600'}`}>
                        €{plan.totalPlan.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Diferencia:</span>
                      <span className={`font-medium ${plan.diferenciasObjetivo >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {plan.diferenciasObjetivo >= 0 ? '+' : ''}€{plan.diferenciasObjetivo.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between pt-2 border-t">
                      <span className="text-gray-600">Estado:</span>
                      <span className={`inline-flex items-center ${plan.objetivoCumplido ? 'text-green-600' : 'text-red-600'}`}>
                        {plan.objetivoCumplido ? (
                          <CheckCircleIcon className="h-4 w-4 mr-1" />
                        ) : (
                          <XCircleIcon className="h-4 w-4 mr-1" />
                        )}
                        {plan.objetivoCumplido ? 'Objetivo Cumplido' : 'Objetivo No Cumplido'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Project Blocks */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                    <BuildingOfficeIcon className="h-4 w-4 mr-1" />
                    Bloques de Proyectos ({plan.bloques.length})
                  </h4>
                  
                  <div className="space-y-3">
                    {plan.bloques.map((bloque, index) => (
                      <div key={index} className="p-3 bg-white rounded border text-sm">
                        <div className="flex justify-between items-start mb-2">
                          <div className="font-medium text-gray-900 truncate">
                            {bloque.proyecto.nombre}
                          </div>
                          <div className="text-right ml-2">
                            <div className="font-bold text-gray-900">€{bloque.totalBloque.toFixed(2)}</div>
                          </div>
                        </div>
                        
                        <div className="text-gray-600 space-y-1">
                          <div className="flex items-center justify-between">
                            <span>Período:</span>
                            <span>{format(bloque.fechaInicio, 'dd MMM', { locale: es })} - {format(bloque.fechaFin, 'dd MMM', { locale: es })}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span>Días:</span>
                            <span>{bloque.totalDias}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span>Distancia:</span>
                            <span>{bloque.totalKm} km (€{bloque.totalImporteKm.toFixed(2)})</span>
                          </div>
                          {bloque.totalDietas > 0 && (
                            <div className="flex items-center justify-between">
                              <span>Dietas:</span>
                              <span>{bloque.totalDietas} (€{bloque.totalImporteDietas.toFixed(2)})</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Totals Breakdown */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                    <CurrencyEuroIcon className="h-4 w-4 mr-1" />
                    Desglose de Importes
                  </h4>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Kilometraje:</span>
                      <span>€{plan.totalImporteKm.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Dietas:</span>
                      <span>€{plan.totalImporteDietas.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-medium pt-2 border-t">
                      <span>Total:</span>
                      <span>€{plan.totalPlan.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Calendar View */}
              <div className="lg:col-span-2">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-4 flex items-center">
                    <CalendarDaysIcon className="h-4 w-4 mr-1" />
                    Vista Calendario - {format(firstDay || new Date(), 'MMMM yyyy', { locale: es })}
                  </h4>

                  {/* Calendar Header */}
                  <div className="grid grid-cols-7 gap-1 mb-2">
                    {weekDays.map((day) => (
                      <div key={day} className="p-2 text-center text-xs font-medium text-gray-700">
                        {day}
                      </div>
                    ))}
                  </div>

                  {/* Calendar Body */}
                  <div className="grid grid-cols-7 gap-1">
                    {calendarDays.map((date, index) => {
                      const dayInfo = getDayInfo(date);
                      const bloque = plan.bloques.find(b => 
                        b.diasLaborables.some(d => isSameDay(d.fecha, date))
                      );

                      return (
                        <div
                          key={index}
                          className={`p-2 border rounded text-center text-xs min-h-[60px] ${getDayClass(date)}`}
                        >
                          <div className="font-medium">
                            {format(date, 'd')}
                          </div>
                          {dayInfo && bloque && (
                            <div className="mt-1 space-y-1">
                              <div className="truncate font-medium">
                                {bloque.proyecto.nombre.substring(0, 8)}
                              </div>
                              <div className="text-xs">
                                €{dayInfo.totalDia?.toFixed(0)}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Legend */}
                  <div className="mt-4 flex flex-wrap gap-2 text-xs">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-gray-50 border border-gray-200 rounded mr-1"></div>
                      <span className="text-gray-600">No laborable</span>
                    </div>
                    {plan.bloques.slice(0, 6).map((bloque, index) => {
                      const colors = [
                        'bg-blue-100 border-blue-200',
                        'bg-green-100 border-green-200', 
                        'bg-purple-100 border-purple-200',
                        'bg-yellow-100 border-yellow-200',
                        'bg-pink-100 border-pink-200',
                        'bg-indigo-100 border-indigo-200',
                      ];
                      return (
                        <div key={index} className="flex items-center">
                          <div className={`w-3 h-3 ${colors[index]} rounded mr-1`}></div>
                          <span className="text-gray-600 truncate max-w-[100px]">
                            {bloque.proyecto.nombre}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              onClick={onClose}
              className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-purple-600 text-base font-medium text-white hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 sm:ml-3 sm:w-auto sm:text-sm"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}