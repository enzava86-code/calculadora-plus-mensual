export interface Festivo {
  fecha: Date;
  nombre: string;
  tipo: 'nacional' | 'autonomico' | 'local';
  fijo: boolean; // true si es fecha fija cada año (ej: 25 Dic), false si es móvil (ej: Semana Santa)
  ubicacion?: string; // para festivos autonómicos/locales
}

export interface ConfiguracionCalendario {
  año: number;
  festivos: Festivo[];
  diasLaborablesSemana: number[]; // [1,2,3,4,5] = Lunes a Viernes
  fechaCreacion: Date;
  fechaModificacion: Date;
}

export interface DiaCalendario {
  fecha: Date;
  diaSemana: number; // 0=Domingo, 1=Lunes, ..., 6=Sábado
  esLaborable: boolean;
  esFinDeSemana: boolean;
  esFestivo: boolean;
  festivo?: Festivo;
}

export interface MesCalendario {
  mes: number; // 1-12
  año: number;
  nombre: string; // "Enero", "Febrero", etc.
  dias: DiaCalendario[];
  totalDias: number;
  diasLaborables: number;
  diasFinDeSemana: number;
  diasFestivos: number;
}

export interface ResumenAnual {
  año: number;
  totalDias: number;
  totalDiasLaborables: number;
  totalFinDeSemana: number;
  totalFestivos: number;
  festivosNacionales: number;
  festivosAutonomicos: number;
  festivosLocales: number;
  meses: MesCalendario[];
}

// Festivos españoles fijos más comunes
export const FESTIVOS_NACIONALES_FIJOS = [
  { mes: 1, dia: 1, nombre: 'Año Nuevo' },
  { mes: 1, dia: 6, nombre: 'Epifanía del Señor' },
  { mes: 5, dia: 1, nombre: 'Fiesta del Trabajo' },
  { mes: 8, dia: 15, nombre: 'Asunción de la Virgen' },
  { mes: 10, dia: 12, nombre: 'Fiesta Nacional de España' },
  { mes: 11, dia: 1, nombre: 'Todos los Santos' },
  { mes: 12, dia: 6, nombre: 'Día de la Constitución Española' },
  { mes: 12, dia: 8, nombre: 'Inmaculada Concepción' },
  { mes: 12, dia: 25, nombre: 'Navidad' },
];

// Festivos móviles que requieren cálculo específico
export const FESTIVOS_MOVILES = [
  'Jueves Santo',
  'Viernes Santo',
  'Lunes de Pascua', // solo algunas comunidades
  'Corpus Christi', // solo algunas comunidades
];

// Festivos autonómicos más comunes
export const FESTIVOS_AUTONOMICOS: Record<string, { mes: number; dia: number; nombre: string }[]> = {
  'Baleares': [
    { mes: 3, dia: 1, nombre: 'Día de las Islas Baleares' },
    { mes: 12, dia: 26, nombre: 'San Esteban' },
  ],
  'Madrid': [
    { mes: 5, dia: 2, nombre: 'Día de la Comunidad de Madrid' },
  ],
  'Catalunya': [
    { mes: 9, dia: 11, nombre: 'Diada Nacional de Catalunya' },
    { mes: 6, dia: 24, nombre: 'San Juan' },
    { mes: 12, dia: 26, nombre: 'San Esteban' },
  ],
  'Valencia': [
    { mes: 10, dia: 9, nombre: 'Día de la Comunidad Valenciana' },
    { mes: 3, dia: 19, nombre: 'San José' },
  ],
};