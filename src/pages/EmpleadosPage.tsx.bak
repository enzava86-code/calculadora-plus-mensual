import React, { useState, useEffect } from 'react';
import { 
  UsersIcon, 
  PlusIcon, 
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowUpTrayIcon,
  DocumentArrowDownIcon,
  TrashIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

// Components
import EmpleadosList from '../components/Empleados/EmpleadosList';
import EmpleadoForm from '../components/Empleados/EmpleadoForm';
import ConfirmDialog from '../components/Common/ConfirmDialog';

// Types and Services
import { Empleado, CreateEmpleadoDto, UpdateEmpleadoDto } from '@/types/empleado';
import { dbService } from '@/services/database';
import { excelService } from '@/services/excelService';

export default function EmpleadosPage() {
  const [empleados, setEmpleados] = useState<Empleado[]>([]);
  const [filteredEmpleados, setFilteredEmpleados] = useState<Empleado[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingEmpleado, setEditingEmpleado] = useState<Empleado | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState<Empleado | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [showDeleteAllDialog, setShowDeleteAllDialog] = useState(false);
  const [deleteAllLoading, setDeleteAllLoading] = useState(false);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [locationFilter, setLocationFilter] = useState<'all' | 'Peninsula' | 'Mallorca'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'activo' | 'inactivo'>('all');

  useEffect(() => {
    loadEmpleados();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [empleados, searchTerm, locationFilter, statusFilter]);

  const loadEmpleados = async () => {
    try {
      setLoading(true);
      const data = await dbService.getEmpleados();
      setEmpleados(data);
    } catch (error) {
      console.error('Error loading empleados:', error);
      toast.error('Error cargando empleados');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = empleados;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(empleado =>
        `${empleado.nombre} ${empleado.apellidos}`.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Location filter
    if (locationFilter !== 'all') {
      filtered = filtered.filter(empleado => empleado.ubicacion === locationFilter);
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(empleado => empleado.estado === statusFilter);
    }

    setFilteredEmpleados(filtered);
  };

  const handleCreate = async (data: CreateEmpleadoDto) => {
    try {
      const newEmpleado = await dbService.createEmpleado(data);
      setEmpleados(prev => [...prev, newEmpleado]);
      toast.success('Empleado creado correctamente');
    } catch (error) {
      console.error('Error creating empleado:', error);
      toast.error('Error creando empleado');
      throw error;
    }
  };

  const handleUpdate = async (data: UpdateEmpleadoDto) => {
    if (!editingEmpleado) return;

    try {
      const updatedEmpleado = await dbService.updateEmpleado(editingEmpleado.id, data);
      setEmpleados(prev => prev.map(emp => 
        emp.id === editingEmpleado.id ? updatedEmpleado : emp
      ));
      toast.success('Empleado actualizado correctamente');
    } catch (error) {
      console.error('Error updating empleado:', error);
      toast.error('Error actualizando empleado');
      throw error;
    }
  };

  const handleEdit = (empleado: Empleado) => {
    setEditingEmpleado(empleado);
    setShowForm(true);
  };

  const handleDelete = (empleado: Empleado) => {
    setEmployeeToDelete(empleado);
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (!employeeToDelete) return;

    try {
      setDeleteLoading(true);
      await dbService.deleteEmpleado(employeeToDelete.id);
      setEmpleados(prev => prev.filter(emp => emp.id !== employeeToDelete.id));
      toast.success('Empleado eliminado correctamente');
      setShowDeleteDialog(false);
      setEmployeeToDelete(null);
    } catch (error) {
      console.error('Error deleting empleado:', error);
      toast.error('Error eliminando empleado');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingEmpleado(null);
  };


  const handleExportEmpleados = async () => {
    try {
      await excelService.exportarEmpleados(empleados);
      toast.success('Empleados exportados correctamente');
    } catch (error) {
      console.error('Error exporting empleados:', error);
      toast.error('Error exportando empleados');
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      await excelService.generarTemplateEmpleados();
      toast.success('Template descargado correctamente');
    } catch (error) {
      console.error('Error downloading template:', error);
      toast.error('Error descargando template');
    }
  };

  const handleImportEmpleados = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const { empleados: empleadosImportados, errores } = await excelService.importarEmpleados(file);
      
      if (errores.length > 0) {
        console.error('Errores de importación de empleados:', errores);
        toast.error(`Se encontraron ${errores.length} errores. Revisa la consola del navegador (F12) para ver los detalles.`);
        // Mostrar errores también en un alert para debug
        alert(`Errores encontrados:\n${errores.join('\n')}`);
        return;
      }

      // Crear empleados válidos evitando duplicados
      let empleadosCreados = 0;
      let empleadosDuplicados = 0;
      
      for (const empleadoData of empleadosImportados) {
        if (empleadoData.nombre && empleadoData.apellidos && empleadoData.ubicacion && empleadoData.objetivoMensual) {
          // Verificar si ya existe un empleado con el mismo nombre y apellidos
          const empleadoExistente = empleados.find(emp => 
            emp.nombre.toLowerCase() === empleadoData.nombre?.toLowerCase() && 
            emp.apellidos.toLowerCase() === empleadoData.apellidos?.toLowerCase()
          );
          
          if (empleadoExistente) {
            empleadosDuplicados++;
            console.log(`Empleado duplicado encontrado: ${empleadoData.nombre || ''} ${empleadoData.apellidos || ''}`);
          } else {
            await dbService.createEmpleado({
              nombre: empleadoData.nombre,
              apellidos: empleadoData.apellidos,
              ubicacion: empleadoData.ubicacion as 'Peninsula' | 'Mallorca',
              objetivoMensual: empleadoData.objetivoMensual,
            });
            empleadosCreados++;
          }
        }
      }

      await loadEmpleados();
      
      let mensaje = `${empleadosCreados} empleados nuevos importados`;
      if (empleadosDuplicados > 0) {
        mensaje += `, ${empleadosDuplicados} duplicados omitidos`;
      }
      toast.success(mensaje);
      
      // Reset input
      event.target.value = '';
    } catch (error) {
      console.error('Error importing empleados:', error);
      toast.error('Error importando empleados');
    }
  };

  const handleDeleteAllEmpleados = async () => {
    try {
      setDeleteAllLoading(true);
      await dbService.clearAllEmpleados();
      setEmpleados([]);
      toast.success('Todos los empleados han sido eliminados');
      setShowDeleteAllDialog(false);
    } catch (error) {
      console.error('Error deleting all empleados:', error);
      toast.error('Error eliminando todos los empleados');
    } finally {
      setDeleteAllLoading(false);
    }
  };

  const stats = {
    total: empleados.length,
    activos: empleados.filter(emp => emp.estado === 'activo').length,
    peninsula: empleados.filter(emp => emp.ubicacion === 'Peninsula').length,
    mallorca: empleados.filter(emp => emp.ubicacion === 'Mallorca').length,
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <UsersIcon className="h-8 w-8 text-blue-600 mr-3" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Gestión de Empleados</h1>
              <p className="text-gray-600">Administrar empleados y sus objetivos mensuales</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            {/* Excel Import */}
            <div className="flex items-center space-x-2">
              <button
                onClick={handleExportEmpleados}
                disabled={empleados.length === 0}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <DocumentArrowDownIcon className="h-4 w-4 mr-1" />
                Exportar
              </button>

              <label className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 cursor-pointer focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                <ArrowUpTrayIcon className="h-4 w-4 mr-1" />
                Importar
                <input
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleImportEmpleados}
                  className="sr-only"
                />
              </label>
              
              <button
                onClick={handleDownloadTemplate}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <DocumentArrowDownIcon className="h-4 w-4 mr-1" />
                Template
              </button>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowDeleteAllDialog(true)}
                disabled={empleados.length === 0}
                className="inline-flex items-center px-3 py-2 border border-red-300 shadow-sm text-sm font-medium rounded-md text-red-700 bg-red-50 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <TrashIcon className="h-4 w-4 mr-1" />
                Borrar Todos
              </button>

              <button
                onClick={() => setShowForm(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <PlusIcon className="h-5 w-5 mr-2" />
                Nuevo Empleado
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <UsersIcon className="h-8 w-8 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total</dt>
                  <dd className="text-lg font-medium text-gray-900">{stats.total}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-xs font-bold text-white">A</span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Activos</dt>
                  <dd className="text-lg font-medium text-gray-900">{stats.activos}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-xs font-bold text-white">P</span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Peninsula</dt>
                  <dd className="text-lg font-medium text-gray-900">{stats.peninsula}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 bg-purple-500 rounded-full flex items-center justify-center">
                  <span className="text-xs font-bold text-white">M</span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Mallorca</dt>
                  <dd className="text-lg font-medium text-gray-900">{stats.mallorca}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white shadow rounded-lg p-4 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-4 sm:space-y-0">
          <div className="flex-1">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Buscar empleados..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <FunnelIcon className="h-5 w-5 text-gray-400" />
            <select
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value as any)}
              className="border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">Todas las ubicaciones</option>
              <option value="Peninsula">Peninsula</option>
              <option value="Mallorca">Mallorca</option>
            </select>
            
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">Todos los estados</option>
              <option value="activo">Activos</option>
              <option value="inactivo">Inactivos</option>
            </select>
          </div>
        </div>
      </div>

      {/* Empleados List */}
      <EmpleadosList
        empleados={filteredEmpleados}
        loading={loading}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {/* Forms and Dialogs */}
      <EmpleadoForm
        empleado={editingEmpleado || undefined}
        isOpen={showForm}
        onClose={handleCloseForm}
        onSubmit={editingEmpleado ? handleUpdate as any : handleCreate as any}
        isEditing={!!editingEmpleado}
      />

      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={confirmDelete}
        title="Eliminar Empleado"
        message={`¿Estás seguro de que quieres eliminar a ${employeeToDelete?.nombre} ${employeeToDelete?.apellidos}? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        type="danger"
        loading={deleteLoading}
      />

      <ConfirmDialog
        isOpen={showDeleteAllDialog}
        onClose={() => setShowDeleteAllDialog(false)}
        onConfirm={handleDeleteAllEmpleados}
        title="⚠️ Eliminar Todos los Empleados"
        message={`¿Estás seguro de que quieres eliminar TODOS los empleados (${empleados.length} empleados)? Esta acción no se puede deshacer y eliminará todos los datos de empleados permanentemente.`}
        confirmText="Sí, Eliminar Todos"
        type="danger"
        loading={deleteAllLoading}
      />
    </div>
  );
}