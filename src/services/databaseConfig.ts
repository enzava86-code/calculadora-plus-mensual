// Database Configuration Service
// Allows switching between localStorage and PostgreSQL backends

import { dbService as localStorageService } from './database';
import { dbApiService as postgresService } from './databaseApi';

// Configuration flag - set to true to use PostgreSQL, false for localStorage
const USE_POSTGRES = import.meta.env.VITE_USE_POSTGRES === 'true' || import.meta.env.PROD;

// Export the appropriate service based on configuration
export const dbService = USE_POSTGRES ? postgresService : localStorageService;

// Debug information
if (import.meta.env.DEV) {
  console.log(`🗄️ Database Service: ${USE_POSTGRES ? 'PostgreSQL (Neon)' : 'localStorage'}`);
}