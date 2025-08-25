import { Empleado } from './empleado';
import { Proyecto } from './proyecto';

export interface DiaLaborable {
  fecha: Date;
  diaSemana: number; // 1-7 (Lunes-Domingo)
  esLaborable: boolean;
  esFestivo: boolean;
  nombreFestivo?: string;
  proyecto?: Proyecto;
  distanciaKm?: number;
  importeKm?: number;
  tieneDieta?: boolean;
  importeDieta?: number;
  totalDia?: number;
}

export interface BloqueConsecutivo {
  proyectoId: string;
  proyecto: Proyecto;
  diasLaborables: DiaLaborable[];
  fechaInicio: Date;
  fechaFin: Date;
  totalDias: number;
  totalKm: number;
  totalImporteKm: number;
  totalDietas: number;
  totalImporteDietas: number;
  totalBloque: number;
}

export interface PlanMensual {
  id: string;
  empleado: Empleado;
  mes: number; // 1-12
  año: number;
  fechaGeneracion: Date;
  diasLaborables: DiaLaborable[];
  bloques: BloqueConsecutivo[];
  totalDiasLaborables: number;
  totalDiasConProyecto: number;
  totalKm: number;
  totalImporteKm: number;
  totalDietas: number;
  totalImporteDietas: number;
  totalPlan: number;
  objetivoCumplido: boolean;
  diferenciasObjetivo: number; // positivo si se pasa, negativo si falta
  notas?: string;
  estado: 'borrador' | 'aprobado' | 'ejecutado';
}

export interface ParametrosCalculo {
  importePorKm: number; // euros por kilómetro
  importePorDieta: number; // euros por día de dieta
  distanciaMinimaParaDieta: number; // km mínimos para tener dieta
  diasMinimosBloque: number; // días mínimos por bloque (1-4)
  diasMaximosBloque: number; // días máximos por bloque (1-7)
  errorMaximoPermitido: number; // máximo error permitido en euros (5€)
  priorizarObjetivoSobreConsecutividad: boolean; // priorizar objetivo vs consecutividad
}

export interface OpcionesGeneracion {
  empleadoId: string;
  mes: number;
  año: number;
  objetivoPersonalizado?: number; // objetivo económico definido por usuario (sobrescribe empleado.objetivoMensual)
  parametros: ParametrosCalculo;
  proyectosExcluidos?: string[]; // IDs de proyectos a excluir
  proyectosPrioritarios?: string[]; // IDs de proyectos prioritarios
  generarVariantes?: boolean; // generar múltiples opciones
  maximoVariantes?: number; // máximo número de variantes
}

export interface ResumenCalculos {
  planGenerado: PlanMensual;
  variantes?: PlanMensual[];
  tiempoGeneracion: number; // milliseconds
  algoritmoUtilizado: string;
  estadisticas: {
    totalCombinacionesEvaluadas: number;
    mejorSolucionEncontrada: boolean;
    precisonObjetivo: number; // % de precisión respecto al objetivo
  };
}