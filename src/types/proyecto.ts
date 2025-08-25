import { Ubicacion } from './empleado';

export interface Proyecto {
  id: string;
  nombre: string;
  ubicacion: Ubicacion;
  distanciaKm: number; // distancia desde central en km
  requiereDieta: boolean; // calculado automáticamente basado en distancia
}

export interface CreateProyectoDto {
  nombre: string;
  ubicacion: Ubicacion;
  distanciaKm: number;
}

export interface UpdateProyectoDto {
  nombre?: string;
  ubicacion?: Ubicacion;
  distanciaKm?: number;
}

export interface ProyectoStats {
  totalProyectos: number;
  proyectosMallorca: number;
  proyectosPeninsula: number;
  distanciaPromedio: number;
  proyectosConDieta: number;
}