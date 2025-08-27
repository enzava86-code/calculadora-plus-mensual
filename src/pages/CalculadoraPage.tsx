import { useState, useEffect } from 'react';
import { 
  CalculatorIcon, 
  SparklesIcon, 
  ArrowDownTrayIcon,
  CalendarDaysIcon,
  UsersIcon,
  CurrencyEuroIcon,
  ClockIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

// Components
import PlanDetailModal from '../components/Calculadora/PlanDetailModal';
import LoggingButtons from '../components/UI/LoggingButtons';

// Services and Types
import { calculadoraService } from '@/services/calculadora';
import { excelService } from '@/services/excelService';
import { dbService } from '../services/databaseConfig';
import { PlanMensual } from '@/types/plan';

interface ResultadoMasivo {
  planesGenerados: PlanMensual[];
  resumenGeneral: {
    totalEmpleados: number;
    empleadosExitosos: number;
    empleadosConErrores: number;
    tiempoTotal: number;
    errores: Array<{empleadoId: string, nombreEmpleado: string, error: string}>;
  };
}

export default function CalculadoraPage() {
  const [resultado, setResultado] = useState<ResultadoMasivo | null>(null);
  const [loading, setLoading] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<PlanMensual | null>(null);
  
  // Formulario simplificado
  const [mes, setMes] = useState(new Date().getMonth() + 1);
  const [año, setAño] = useState(new Date().getFullYear());
  
  // Parámetros configurables
  const [importePorKm, setImportePorKm] = useState(0.42);
  const [importePorDieta, setImportePorDieta] = useState(25.00);
  const [parametrosLoading, setParametrosLoading] = useState(false);

  const handleGenerateMassive = async () => {
    try {
      setLoading(true);
      
      console.log(`🚀 Generando planes masivos para ${mes}/${año}`);
      
      // Asegurar que los parámetros estén actualizados antes del cálculo
      await handleSaveParametros();
      
      // Generar planes para todos los empleados
      const resultado = await calculadoraService.generarPlanesMasivos(mes, año);
      
      setResultado(resultado);
      
      const { resumenGeneral } = resultado;
      toast.success(
        `¡Planes generados! ${resumenGeneral.empleadosExitosos}/${resumenGeneral.totalEmpleados} empleados exitosos en ${resumenGeneral.tiempoTotal}ms`
      );

      if (resumenGeneral.empleadosConErrores > 0) {
        toast.error(
          `${resumenGeneral.empleadosConErrores} empleados con errores. Revisa los detalles.`
        );
      }

    } catch (error) {
      console.error('Error generating massive plans:', error);
      toast.error(
        error instanceof Error 
          ? error.message 
          : 'Error generando los planes masivos'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleExportMassive = async () => {
    if (!resultado || resultado.planesGenerados.length === 0) {
      toast.error('No hay planes para exportar');
      return;
    }

    try {
      await excelService.exportarPlanesMasivos(resultado.planesGenerados, mes, año);
      toast.success(`Excel exportado con ${resultado.planesGenerados.length} empleados`);
    } catch (error) {
      console.error('Error exporting massive plans:', error);
      toast.error('Error exportando el Excel masivo');
    }
  };

  const handleViewDetails = (plan: PlanMensual) => {
    setSelectedPlan(plan);
    setShowDetailModal(true);
  };

  const handleNewCalculation = () => {
    setResultado(null);
    setSelectedPlan(null);
  };

  // Cargar parámetros al iniciar
  useEffect(() => {
    loadParametros();
  }, []);

  const loadParametros = async () => {
    try {
      const parametros = await dbService.getParametros();
      setImportePorKm(parametros.importePorKm);
      setImportePorDieta(parametros.importePorDieta);
    } catch (error) {
      console.error('Error loading parameters:', error);
      toast.error('Error cargando parámetros');
    }
  };

  const handleSaveParametros = async () => {
    try {
      setParametrosLoading(true);
      const parametros = await dbService.getParametros();
      await dbService.saveParametros({
        ...parametros,
        importePorKm,
        importePorDieta
      });
      toast.success('Parámetros guardados correctamente');
    } catch (error) {
      console.error('Error saving parameters:', error);
      toast.error('Error guardando parámetros');
    } finally {
      setParametrosLoading(false);
    }
  };

  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  return (
    <div>
      {/* Header con botón de acción principal */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <CalculatorIcon className="h-8 w-8 text-purple-600 mr-3" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Generador de Planes Masivos</h1>
              <p className="text-gray-600">Calcula planes mensuales para todos los empleados automáticamente</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Logging Buttons para Cálculo Masivo */}
            <LoggingButtons 
              calculationType="masivo"
              disabled={loading}
            />
            
            {/* Exportar Excel (solo visible si hay resultados) */}
            {resultado && (
              <button
                onClick={handleExportMassive}
                className="inline-flex items-center px-4 py-2 border border-green-300 shadow-sm text-sm font-medium rounded-md text-green-700 bg-green-50 hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                <ArrowDownTrayIcon className="h-5 w-5 mr-2" />
                Exportar Excel
              </button>
            )}
            
            {/* Nuevo Cálculo */}
            {resultado && (
              <button
                onClick={handleNewCalculation}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
              >
                <SparklesIcon className="h-5 w-5 mr-2" />
                Nuevo Cálculo
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Formulario simplificado */}
      {!resultado && (
        <div className="bg-white shadow rounded-lg mb-6">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <CalendarDaysIcon className="h-5 w-5 mr-2 text-purple-600" />
              Seleccionar Período
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              Los planes se generarán automáticamente para todos los empleados activos
            </p>
          </div>

          <div className="p-6">
            {/* Parámetros de Configuración */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex items-center mb-3">
                <Cog6ToothIcon className="h-5 w-5 text-blue-600 mr-2" />
                <h4 className="text-sm font-medium text-blue-800">Configuración de Importes</h4>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-blue-700 mb-1">
                    Importe por Kilómetro (€)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={importePorKm}
                    onChange={(e) => setImportePorKm(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-blue-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                    placeholder="0.42"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-blue-700 mb-1">
                    Importe por Dieta (€)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={importePorDieta}
                    onChange={(e) => setImportePorDieta(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-blue-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                    placeholder="25.00"
                  />
                </div>
              </div>
              
              <button
                onClick={handleSaveParametros}
                disabled={parametrosLoading}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {parametrosLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Guardando...
                  </>
                ) : (
                  'Guardar Configuración'
                )}
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-md">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mes
                </label>
                <select
                  value={mes}
                  onChange={(e) => setMes(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                >
                  {monthNames.map((month, index) => (
                    <option key={index} value={index + 1}>
                      {month}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Año
                </label>
                <input
                  type="number"
                  min="2024"
                  max="2030"
                  value={año}
                  onChange={(e) => setAño(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                />
              </div>
            </div>

            <button
              onClick={handleGenerateMassive}
              disabled={loading}
              className="mt-6 w-full sm:w-auto inline-flex justify-center items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                  Generando planes...
                </>
              ) : (
                <>
                  <CalculatorIcon className="h-5 w-5 mr-2" />
                  Generar Planes para Todos los Empleados
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Algoritmo Info Banner */}
      {!resultado && (
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-6">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <SparklesIcon className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-3 flex-1">
              <h3 className="text-sm font-medium text-purple-800">
                Algoritmo Híbrido de Precisión v2.1
              </h3>
              <div className="mt-2 text-sm text-purple-700">
                <p>
                  Genera automáticamente planes optimizados que se ajustan al objetivo económico de cada empleado.
                  El algoritmo usa solo los días necesarios, respeta restricciones geográficas y crea bloques consecutivos reales.
                </p>
              </div>
              <div className="mt-3 flex flex-wrap gap-2 text-xs">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800">
                  ✓ Calendario español completo
                </span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800">
                  ✓ Precisión ±3€
                </span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800">
                  ✓ Cálculo masivo automático
                </span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800">
                  ✓ Exportación Excel completa
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Resultados */}
      {resultado && (
        <div className="space-y-6">
          {/* Resumen General */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                <UsersIcon className="h-5 w-5 mr-2 text-green-600" />
                Resumen del Cálculo Masivo - {monthNames[mes - 1]} {año}
              </h3>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="flex items-center">
                    <UsersIcon className="h-8 w-8 text-blue-600" />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-blue-600">Total Empleados</p>
                      <p className="text-2xl font-bold text-blue-900">{resultado.resumenGeneral.totalEmpleados}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-green-50 rounded-lg p-4">
                  <div className="flex items-center">
                    <SparklesIcon className="h-8 w-8 text-green-600" />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-green-600">Exitosos</p>
                      <p className="text-2xl font-bold text-green-900">{resultado.resumenGeneral.empleadosExitosos}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-red-50 rounded-lg p-4">
                  <div className="flex items-center">
                    <CurrencyEuroIcon className="h-8 w-8 text-red-600" />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-red-600">Con Errores</p>
                      <p className="text-2xl font-bold text-red-900">{resultado.resumenGeneral.empleadosConErrores}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-purple-50 rounded-lg p-4">
                  <div className="flex items-center">
                    <ClockIcon className="h-8 w-8 text-purple-600" />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-purple-600">Tiempo Total</p>
                      <p className="text-2xl font-bold text-purple-900">{resultado.resumenGeneral.tiempoTotal}ms</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Errores si los hay */}
              {resultado.resumenGeneral.errores.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                  <h4 className="text-sm font-medium text-red-800 mb-2">Empleados con errores:</h4>
                  <ul className="text-sm text-red-700 space-y-1">
                    {resultado.resumenGeneral.errores.map((error, index) => (
                      <li key={index}>• {error.nombreEmpleado}: {error.error}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* Lista de Planes Generados */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                Planes Generados ({resultado.planesGenerados.length})
              </h3>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Empleado</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ubicación</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Objetivo</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Generado</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Diferencia</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Días</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {resultado.planesGenerados.map((plan) => (
                    <tr key={plan.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{plan.empleado.nombre}</div>
                        <div className="text-sm text-gray-500">{plan.empleado.apellidos}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{plan.empleado.ubicacion}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">€{plan.empleado.objetivoMensual.toFixed(2)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">€{plan.totalPlan.toFixed(2)}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          plan.objetivoCumplido 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {plan.diferenciasObjetivo >= 0 ? '+' : ''}€{plan.diferenciasObjetivo.toFixed(2)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{plan.totalDiasConProyecto}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleViewDetails(plan)}
                          className="text-purple-600 hover:text-purple-900"
                        >
                          Ver Detalles
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      <PlanDetailModal
        plan={selectedPlan}
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
      />
    </div>
  );
}