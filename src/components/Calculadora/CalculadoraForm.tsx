import React, { useState, useEffect } from 'react';
import { 
  CalendarDaysIcon,
  UserIcon,
  Cog6ToothIcon,
  ChartBarIcon,
  CurrencyEuroIcon
} from '@heroicons/react/24/outline';
import { Empleado } from '@/types/empleado';
import { Proyecto } from '@/types/proyecto';
import { OpcionesGeneracion, ParametrosCalculo } from '@/types/plan';
import { dbService } from '../../services/databaseConfig';

interface CalculadoraFormProps {
  onGenerate: (opciones: OpcionesGeneracion) => Promise<void>;
  loading: boolean;
}

export default function CalculadoraForm({ onGenerate, loading }: CalculadoraFormProps) {
  const [empleados, setEmpleados] = useState<Empleado[]>([]);
  const [proyectos, setProyectos] = useState<Proyecto[]>([]);
  const [parametros, setParametros] = useState<ParametrosCalculo>({
    importePorKm: 0.35,
    importePorDieta: 25.00,
    distanciaMinimaParaDieta: 30,
    diasMinimosBloque: 1,
    diasMaximosBloque: 4,
    errorMaximoPermitido: 5.00,
    priorizarObjetivoSobreConsecutividad: true,
  });

  const [formData, setFormData] = useState({
    empleadoId: '',
    mes: new Date().getMonth() + 1,
    año: new Date().getFullYear(),
    objetivoPersonalizado: undefined as number | undefined,
    generarVariantes: true,
    maximoVariantes: 3,
    proyectosExcluidos: [] as string[],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [empleadosData, parametrosData] = await Promise.all([
        dbService.getEmpleados(),
        dbService.getParametros()
      ]);

      const empleadosActivos = empleadosData.filter((emp: Empleado) => emp.estado === 'activo');
      setEmpleados(empleadosActivos);
      setParametros(parametrosData);

      // Set first active employee as default
      if (empleadosActivos.length > 0) {
        setFormData(prev => ({
          ...prev,
          empleadoId: empleadosActivos[0].id
        }));
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  useEffect(() => {
    // Load projects based on selected employee location
    const loadProyectosForEmployee = async () => {
      if (!formData.empleadoId) return;

      const empleado = empleados.find(emp => emp.id === formData.empleadoId);
      if (!empleado) return;

      try {
        const proyectosData = await dbService.getProyectosByUbicacion(empleado.ubicacion);
        setProyectos(proyectosData);
      } catch (error) {
        console.error('Error loading projects:', error);
      }
    };

    loadProyectosForEmployee();
  }, [formData.empleadoId, empleados]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.empleadoId) {
      newErrors.empleadoId = 'Selecciona un empleado';
    }

    if (formData.mes < 1 || formData.mes > 12) {
      newErrors.mes = 'Mes inválido';
    }

    if (formData.año < 2024 || formData.año > 2030) {
      newErrors.año = 'Año debe estar entre 2024 y 2030';
    }

    if (formData.maximoVariantes < 1 || formData.maximoVariantes > 5) {
      newErrors.maximoVariantes = 'Entre 1 y 5 variantes';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    const opciones: OpcionesGeneracion = {
      empleadoId: formData.empleadoId,
      mes: formData.mes,
      año: formData.año,
      objetivoPersonalizado: formData.objetivoPersonalizado,
      parametros,
      generarVariantes: formData.generarVariantes,
      maximoVariantes: formData.maximoVariantes,
      proyectosExcluidos: formData.proyectosExcluidos,
    };

    await onGenerate(opciones);
  };

  const handleProyectoExclusion = (proyectoId: string) => {
    setFormData(prev => ({
      ...prev,
      proyectosExcluidos: prev.proyectosExcluidos.includes(proyectoId)
        ? prev.proyectosExcluidos.filter(id => id !== proyectoId)
        : [...prev.proyectosExcluidos, proyectoId]
    }));
  };

  const selectedEmpleado = empleados.find(emp => emp.id === formData.empleadoId);
  const availableProjects = proyectos.filter(p => !formData.proyectosExcluidos.includes(p.id));

  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900 flex items-center">
          <ChartBarIcon className="h-5 w-5 mr-2 text-purple-600" />
          Configuración del Cálculo
        </h3>
        <p className="text-sm text-gray-500 mt-1">
          Configure los parámetros para generar el plan mensual automático
        </p>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {/* Employee Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
            <UserIcon className="h-4 w-4 mr-1" />
            Empleado *
          </label>
          <select
            value={formData.empleadoId}
            onChange={(e) => setFormData({ ...formData, empleadoId: e.target.value })}
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 ${
              errors.empleadoId ? 'border-red-300' : 'border-gray-300'
            }`}
          >
            <option value="">Seleccionar empleado...</option>
            {empleados.map((empleado) => (
              <option key={empleado.id} value={empleado.id}>
                {empleado.nombre} {empleado.apellidos} - {empleado.ubicacion} (€{empleado.objetivoMensual}/mes)
              </option>
            ))}
          </select>
          {errors.empleadoId && <p className="mt-1 text-sm text-red-600">{errors.empleadoId}</p>}
          
          {selectedEmpleado && (
            <div className="mt-2 p-3 bg-blue-50 rounded-md">
              <p className="text-sm text-blue-800">
                <strong>Objetivo por defecto:</strong> €{selectedEmpleado.objetivoMensual}/mes | 
                <strong> Ubicación:</strong> {selectedEmpleado.ubicacion}
              </p>
            </div>
          )}
        </div>

        {/* Custom Objective */}
        {selectedEmpleado && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
              <CurrencyEuroIcon className="h-4 w-4 mr-1" />
              Objetivo Personalizado (opcional)
            </label>
            <div className="relative">
              <input
                type="number"
                min="50"
                max="1000"
                step="5"
                placeholder={`Por defecto: €${selectedEmpleado.objetivoMensual}`}
                value={formData.objetivoPersonalizado || ''}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  objetivoPersonalizado: e.target.value ? Number(e.target.value) : undefined 
                })}
                className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-500 text-sm">€</span>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Deja vacío para usar el objetivo por defecto del empleado (€{selectedEmpleado.objetivoMensual})
            </p>
          </div>
        )}

        {/* Date Selection */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
              <CalendarDaysIcon className="h-4 w-4 mr-1" />
              Mes *
            </label>
            <select
              value={formData.mes}
              onChange={(e) => setFormData({ ...formData, mes: Number(e.target.value) })}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 ${
                errors.mes ? 'border-red-300' : 'border-gray-300'
              }`}
            >
              {monthNames.map((month, index) => (
                <option key={index} value={index + 1}>
                  {month} {formData.año}
                </option>
              ))}
            </select>
            {errors.mes && <p className="mt-1 text-sm text-red-600">{errors.mes}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Año *
            </label>
            <input
              type="number"
              min="2024"
              max="2030"
              value={formData.año}
              onChange={(e) => setFormData({ ...formData, año: Number(e.target.value) })}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 ${
                errors.año ? 'border-red-300' : 'border-gray-300'
              }`}
            />
            {errors.año && <p className="mt-1 text-sm text-red-600">{errors.año}</p>}
          </div>
        </div>

        {/* Calculation Parameters */}
        <div className="border-t border-gray-200 pt-6">
          <h4 className="text-sm font-medium text-gray-900 mb-4 flex items-center">
            <Cog6ToothIcon className="h-4 w-4 mr-1" />
            Parámetros de Cálculo
          </h4>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                €/km
              </label>
              <input
                type="number"
                step="0.01"
                min="0.10"
                max="1.00"
                value={parametros.importePorKm}
                onChange={(e) => setParametros({ ...parametros, importePorKm: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                €/dieta
              </label>
              <input
                type="number"
                step="0.50"
                min="10"
                max="50"
                value={parametros.importePorDieta}
                onChange={(e) => setParametros({ ...parametros, importePorDieta: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Error máx (€)
              </label>
              <input
                type="number"
                step="0.50"
                min="1"
                max="20"
                value={parametros.errorMaximoPermitido}
                onChange={(e) => setParametros({ ...parametros, errorMaximoPermitido: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Días mín/bloque
              </label>
              <input
                type="number"
                min="1"
                max="5"
                value={parametros.diasMinimosBloque}
                onChange={(e) => setParametros({ ...parametros, diasMinimosBloque: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Días máx/bloque
              </label>
              <input
                type="number"
                min="1"
                max="7"
                value={parametros.diasMaximosBloque}
                onChange={(e) => setParametros({ ...parametros, diasMaximosBloque: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Km mín dieta
              </label>
              <input
                type="number"
                min="20"
                max="50"
                value={parametros.distanciaMinimaParaDieta}
                onChange={(e) => setParametros({ ...parametros, distanciaMinimaParaDieta: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
              />
            </div>
          </div>

          <div className="mt-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={parametros.priorizarObjetivoSobreConsecutividad}
                onChange={(e) => setParametros({ ...parametros, priorizarObjetivoSobreConsecutividad: e.target.checked })}
                className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-700">
                Priorizar alcanzar objetivo sobre consecutividad de bloques
              </span>
            </label>
            <p className="text-xs text-gray-500 mt-1">
              Recomendado: permite mejor precisión en el objetivo económico
            </p>
          </div>
        </div>

        {/* Variants Configuration */}
        <div className="border-t border-gray-200 pt-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-medium text-gray-900">Generación de Variantes</h4>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.generarVariantes}
                onChange={(e) => setFormData({ ...formData, generarVariantes: e.target.checked })}
                className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-700">Generar variantes</span>
            </label>
          </div>

          {formData.generarVariantes && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Número máximo de variantes
              </label>
              <select
                value={formData.maximoVariantes}
                onChange={(e) => setFormData({ ...formData, maximoVariantes: Number(e.target.value) })}
                className="w-full sm:w-32 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
              >
                {[1, 2, 3, 4, 5].map(num => (
                  <option key={num} value={num}>{num}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Project Exclusions */}
        {proyectos.length > 0 && (
          <div className="border-t border-gray-200 pt-6">
            <h4 className="text-sm font-medium text-gray-900 mb-4">
              Proyectos Disponibles ({availableProjects.length} incluidos, {formData.proyectosExcluidos.length} excluidos)
            </h4>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-48 overflow-y-auto">
              {proyectos.map((proyecto) => {
                const isExcluded = formData.proyectosExcluidos.includes(proyecto.id);
                return (
                  <label
                    key={proyecto.id}
                    className={`flex items-start p-3 rounded-lg border cursor-pointer transition-colors ${
                      isExcluded 
                        ? 'bg-red-50 border-red-200' 
                        : 'bg-green-50 border-green-200 hover:bg-green-100'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={!isExcluded}
                      onChange={() => handleProyectoExclusion(proyecto.id)}
                      className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded mt-0.5"
                    />
                    <div className="ml-3 flex-1 min-w-0">
                      <p className={`text-sm font-medium ${isExcluded ? 'text-red-800' : 'text-green-800'}`}>
                        {proyecto.nombre}
                      </p>
                      <p className={`text-xs ${isExcluded ? 'text-red-600' : 'text-green-600'}`}>
                        {proyecto.distanciaKm}km • {proyecto.requiereDieta ? 'Con dieta' : 'Sin dieta'}
                      </p>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>
        )}

        {/* Submit Button */}
        <div className="border-t border-gray-200 pt-6">
          <button
            type="submit"
            disabled={loading || empleados.length === 0}
            className="w-full flex justify-center items-center px-4 py-3 border border-transparent text-base font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Generando Plan...
              </>
            ) : (
              <>
                <ChartBarIcon className="h-5 w-5 mr-2" />
                Generar Plan Mensual
              </>
            )}
          </button>
          
          {empleados.length === 0 && (
            <p className="mt-2 text-sm text-red-600 text-center">
              No hay empleados activos disponibles
            </p>
          )}
        </div>
      </form>
    </div>
  );
}