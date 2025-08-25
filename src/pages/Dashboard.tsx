import { useEffect, useState } from 'react';
import {
  UsersIcon,
  BuildingOfficeIcon,
  CalculatorIcon,
  DocumentTextIcon,
  ChartBarIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';

import { dbService } from '../services/databaseConfig';
// import { calculadoraService } from '../services/calculadora';
import { calendarioService } from '../services/calendario';

interface DashboardStats {
  empleados: {
    total: number;
    activos: number;
    peninsula: number;
    mallorca: number;
  };
  proyectos: {
    total: number;
    peninsula: number;
    mallorca: number;
  };
  planes: {
    total: number;
    borradores: number;
    aprobados: number;
    ejecutados: number;
  };
}

interface MesInfo {
  mes: number;
  año: number;
  nombre: string;
  diasLaborables: number;
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [mesActual, setMesActual] = useState<MesInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Cargar estadísticas
      const estadisticas = await dbService.getEstadisticas();
      setStats(estadisticas);

      // Cargar información del mes actual
      const hoy = new Date();
      const mesCalendario = await calendarioService.generarMesCalendario(
        hoy.getMonth() + 1,
        hoy.getFullYear()
      );
      
      setMesActual({
        mes: mesCalendario.mes,
        año: mesCalendario.año,
        nombre: mesCalendario.nombre,
        diasLaborables: mesCalendario.diasLaborables,
      });

    } catch (error) {
      console.error('Error cargando datos del dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-64 bg-gray-200 rounded-lg"></div>
          <div className="h-64 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    );
  }

  const statCards = [
    {
      name: 'Empleados Activos',
      value: stats?.empleados.activos || 0,
      total: stats?.empleados.total || 0,
      icon: UsersIcon,
      color: 'bg-blue-500',
      change: '+4.75%',
      changeType: 'positive',
    },
    {
      name: 'Total Proyectos',
      value: stats?.proyectos.total || 0,
      total: stats?.proyectos.total || 0,
      icon: BuildingOfficeIcon,
      color: 'bg-green-500',
      change: '+54.02%',
      changeType: 'positive',
    },
    {
      name: 'Planes Generados',
      value: stats?.planes.total || 0,
      total: stats?.planes.total || 0,
      icon: DocumentTextIcon,
      color: 'bg-purple-500',
      change: '+10.18%',
      changeType: 'positive',
    },
    {
      name: 'Días Laborables',
      value: mesActual?.diasLaborables || 0,
      total: mesActual ? `${mesActual.nombre} ${mesActual.año}` : '-',
      icon: ClockIcon,
      color: 'bg-yellow-500',
      change: mesActual?.nombre || '',
      changeType: 'neutral',
    },
  ];

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Dashboard - Calculadora Plus Mensual
        </h1>
        <p className="text-gray-600">
          Resumen general del sistema de cálculo de plus para empleados
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        {statCards.map((item) => (
          <div key={item.name} className="relative bg-white pt-5 px-4 pb-12 sm:pt-6 sm:px-6 shadow rounded-lg overflow-hidden">
            <dt>
              <div className={`absolute ${item.color} rounded-md p-3`}>
                <item.icon className="h-6 w-6 text-white" aria-hidden="true" />
              </div>
              <p className="ml-16 text-sm font-medium text-gray-500 truncate">{item.name}</p>
            </dt>
            <dd className="ml-16 pb-6 flex items-baseline sm:pb-7">
              <p className="text-2xl font-semibold text-gray-900">{item.value}</p>
              <p className="ml-2 flex items-baseline text-sm font-semibold text-gray-600">
                {typeof item.total === 'string' ? item.total : `de ${item.total}`}
              </p>
              <div className="absolute bottom-0 inset-x-0 bg-gray-50 px-4 py-4 sm:px-6">
                <div className="text-sm">
                  <span className={`font-medium ${
                    item.changeType === 'positive' ? 'text-green-600' : 
                    item.changeType === 'negative' ? 'text-red-600' : 
                    'text-gray-500'
                  }`}>
                    {item.change}
                  </span>
                  <span className="text-gray-500">
                    {item.changeType !== 'neutral' ? ' desde el mes pasado' : ''}
                  </span>
                </div>
              </div>
            </dd>
          </div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Distribución por Ubicación */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Distribución por Ubicación</h3>
            <ChartBarIcon className="h-5 w-5 text-gray-400" />
          </div>
          
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm">
                <span className="font-medium text-gray-700">Empleados - Peninsula</span>
                <span className="text-gray-500">{stats?.empleados.peninsula || 0}</span>
              </div>
              <div className="mt-1 w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full" 
                  style={{
                    width: `${stats?.empleados.total ? (stats.empleados.peninsula / stats.empleados.total) * 100 : 0}%`
                  }}
                ></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between text-sm">
                <span className="font-medium text-gray-700">Empleados - Mallorca</span>
                <span className="text-gray-500">{stats?.empleados.mallorca || 0}</span>
              </div>
              <div className="mt-1 w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-600 h-2 rounded-full" 
                  style={{
                    width: `${stats?.empleados.total ? (stats.empleados.mallorca / stats.empleados.total) * 100 : 0}%`
                  }}
                ></div>
              </div>
            </div>

            <div className="pt-2 border-t border-gray-200">
              <div className="flex justify-between text-sm">
                <span className="font-medium text-gray-700">Proyectos - Peninsula</span>
                <span className="text-gray-500">{stats?.proyectos.peninsula || 0}</span>
              </div>
              <div className="mt-1 w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-purple-600 h-2 rounded-full" 
                  style={{
                    width: `${stats?.proyectos.total ? (stats.proyectos.peninsula / stats.proyectos.total) * 100 : 0}%`
                  }}
                ></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between text-sm">
                <span className="font-medium text-gray-700">Proyectos - Mallorca</span>
                <span className="text-gray-500">{stats?.proyectos.mallorca || 0}</span>
              </div>
              <div className="mt-1 w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-yellow-600 h-2 rounded-full" 
                  style={{
                    width: `${stats?.proyectos.total ? (stats.proyectos.mallorca / stats.proyectos.total) * 100 : 0}%`
                  }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Estado de Planes */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Estado de Planes</h3>
            <DocumentTextIcon className="h-5 w-5 text-gray-400" />
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
              <div>
                <p className="text-sm font-medium text-yellow-800">Borradores</p>
                <p className="text-xs text-yellow-600">Planes pendientes de aprobación</p>
              </div>
              <span className="text-2xl font-bold text-yellow-800">{stats?.planes.borradores || 0}</span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div>
                <p className="text-sm font-medium text-green-800">Aprobados</p>
                <p className="text-xs text-green-600">Planes listos para ejecutar</p>
              </div>
              <span className="text-2xl font-bold text-green-800">{stats?.planes.aprobados || 0}</span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div>
                <p className="text-sm font-medium text-blue-800">Ejecutados</p>
                <p className="text-xs text-blue-600">Planes completados</p>
              </div>
              <span className="text-2xl font-bold text-blue-800">{stats?.planes.ejecutados || 0}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Acciones Rápidas</h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <button className="flex items-center p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <CalculatorIcon className="h-8 w-8 text-blue-600 mr-3" />
            <div className="text-left">
              <p className="text-sm font-medium text-gray-900">Nuevo Cálculo</p>
              <p className="text-xs text-gray-500">Generar plan mensual</p>
            </div>
          </button>
          
          <button className="flex items-center p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <UsersIcon className="h-8 w-8 text-green-600 mr-3" />
            <div className="text-left">
              <p className="text-sm font-medium text-gray-900">Nuevo Empleado</p>
              <p className="text-xs text-gray-500">Añadir al sistema</p>
            </div>
          </button>
          
          <button className="flex items-center p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <BuildingOfficeIcon className="h-8 w-8 text-purple-600 mr-3" />
            <div className="text-left">
              <p className="text-sm font-medium text-gray-900">Nuevo Proyecto</p>
              <p className="text-xs text-gray-500">Registrar proyecto</p>
            </div>
          </button>
          
          <button className="flex items-center p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <DocumentTextIcon className="h-8 w-8 text-orange-600 mr-3" />
            <div className="text-left">
              <p className="text-sm font-medium text-gray-900">Ver Planes</p>
              <p className="text-xs text-gray-500">Gestionar planes</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}