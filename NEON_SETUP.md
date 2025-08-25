# Neon Database Setup Guide

## Step 1: Database Schema Setup

1. Go to your Vercel Dashboard
2. Navigate to Storage -> Neon -> Open in Neon Console
3. Open the SQL Editor in Neon Console
4. Copy and run the entire contents of `database/schema.sql`

This will create all the necessary tables and insert default parameters.

## Step 2: Environment Variables Setup

1. In your project directory, run:
   ```bash
   vercel login
   vercel env pull .env.development.local
   ```

2. Alternatively, create `.env.development.local` manually with:
   ```
   DATABASE_URL=your_database_url_from_vercel
   ```

## Step 3: Database Service Migration

The app has been configured to support both localStorage (current) and PostgreSQL (new). 

### To switch to PostgreSQL:

1. Update `src/services/database.ts`:
   ```typescript
   // Change this line:
   export { dbService } from './database'; // localStorage version

   // To this:
   export { dbApiService as dbService } from './databaseApi'; // PostgreSQL version
   ```

2. Or create a new service file that imports the correct service based on environment.

## Step 4: API Functions

The following Vercel API functions have been created:
- `/api/empleados` - CRUD operations for employees
- `/api/proyectos` - CRUD operations for projects  
- `/api/parametros` - Get/set system parameters

## Step 5: Testing

1. Ensure your database schema is created (Step 1)
2. Run the development server: `npm run dev`
3. Switch to the PostgreSQL service (Step 3)
4. Test the application functionality

## Step 6: Deploy

1. Commit and push changes to GitHub
2. Deploy to Vercel - the environment variables should already be configured
3. The database will be automatically connected

## Database Structure

The database includes:
- `empleados` - Employee data
- `proyectos` - Project data (simplified structure)
- `planes_mensuales` - Monthly plans
- `bloques_trabajo` - Work blocks
- `dias_laborables` - Work days detail
- `parametros_sistema` - System parameters

## Migration Notes

- The PostgreSQL structure maintains compatibility with the existing localStorage structure
- Field names are converted between snake_case (DB) and camelCase (frontend)
- UUIDs are used instead of string IDs for better database performance
- Automatic dieta calculation based on distance (>30km)