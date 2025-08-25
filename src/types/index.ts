// Tipos principales
export * from './empleado';
export * from './proyecto';
export * from './plan';
export * from './calendario';

// Tipos comunes de la aplicación
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface FilterOptions {
  search?: string;
  ubicacion?: string;
  estado?: string;
  fechaDesde?: Date;
  fechaHasta?: Date;
}

export interface ImportResult<T> {
  success: boolean;
  totalRows: number;
  importedRows: number;
  errors: ImportError[];
  data: T[];
  skippedRows: number;
}

export interface ImportError {
  row: number;
  column?: string;
  error: string;
  value?: any;
}

export interface ExportOptions {
  formato: 'excel' | 'pdf' | 'csv';
  incluirMetadata: boolean;
  templatePersonalizado?: boolean;
  columnas?: string[];
  filtros?: FilterOptions;
}

export interface NotificationOptions {
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
  persistent?: boolean;
}

// Estados globales de la aplicación
export interface AppState {
  isLoading: boolean;
  error: string | null;
  notifications: NotificationOptions[];
  currentUser?: any; // Para futuras implementaciones de autenticación
}

// Configuración de la aplicación
export interface AppConfig {
  version: string;
  buildDate: string;
  environment: 'development' | 'production' | 'test';
  apiUrl: string;
  features: {
    multitenancy: boolean;
    authentication: boolean;
    advancedReporting: boolean;
  };
}