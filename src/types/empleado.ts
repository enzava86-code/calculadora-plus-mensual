export type Ubicacion = 'Mallorca' | 'Peninsula';

export interface Empleado {
  id: string;
  nombre: string;
  apellidos: string;
  ubicacion: Ubicacion;
  objetivoMensual: number; // en euros
  estado: 'activo' | 'inactivo';
  fechaCreacion: Date;
  fechaModificacion: Date;
}

export interface CreateEmpleadoDto {
  nombre: string;
  apellidos: string;
  ubicacion: Ubicacion;
  objetivoMensual: number;
}

export interface UpdateEmpleadoDto {
  nombre?: string;
  apellidos?: string;
  ubicacion?: Ubicacion;
  objetivoMensual?: number;
  estado?: 'activo' | 'inactivo';
}

export interface EmpleadoStats {
  totalEmpleados: number;
  empleadosActivos: number;
  empleadosInactivos: number;
  empleadosMallorca: number;
  empleadosPeninsula: number;
  objetivoPromedioMallorca: number;
  objetivoPromedioPeninsula: number;
  objetivoTotalMensual: number;
}