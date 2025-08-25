import { Ubicacion } from './empleado';

export interface Proyecto {
  id: string;
  nombre: string;
  ubicacion: Ubicacion;
  distanciaKm: number; // distancia desde central en km
  requiereDieta: boolean; // calculado automáticamente basado en distancia
  estado: 'activo' | 'inactivo' | 'finalizado';
  fechaCreacion: Date;
  fechaModificacion: Date;
  descripcion?: string;
  cliente?: string;
}

export interface CreateProyectoDto {
  nombre: string;
  ubicacion: Ubicacion;
  distanciaKm: number;
  descripcion?: string;
  cliente?: string;
}

export interface UpdateProyectoDto {
  nombre?: string;
  ubicacion?: Ubicacion;
  distanciaKm?: number;
  estado?: 'activo' | 'inactivo' | 'finalizado';
  descripcion?: string;
  cliente?: string;
}

export interface ProyectoStats {
  totalProyectos: number;
  proyectosActivos: number;
  proyectosInactivos: number;
  proyectosFinalizados: number;
  proyectosMallorca: number;
  proyectosPeninsula: number;
  distanciaPromedio: number;
  proyectosConDieta: number;
}