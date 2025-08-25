# 🗄️ Neon Database Setup - Complete Guide

## ✅ What's Been Done

1. **Database Integration Code Complete**
   - ✅ Neon serverless driver installed
   - ✅ Complete PostgreSQL schema created (`database/schema.sql`)
   - ✅ Vercel API functions created (`/api/empleados`, `/api/proyectos`, `/api/parametros`)
   - ✅ PostgreSQL database service implemented (`databaseApi.ts`)
   - ✅ Configuration system for localStorage ↔ PostgreSQL switching
   - ✅ All imports updated to use configurable database service
   - ✅ Vercel.json configured for API functions

## 🚀 Next Steps (To Complete Integration)

### Step 1: Set Up Database Schema
```bash
# 1. Go to Vercel Dashboard → Storage → Neon → Open in Neon Console
# 2. Open SQL Editor
# 3. Copy entire contents of `database/schema.sql` and run it
# This creates all tables and default parameters
```

### Step 2: Configure Environment Variables
```bash
# Option A: Pull from Vercel (if you're logged in)
vercel login
vercel env pull .env.development.local

# Option B: Manual setup
# Create .env.development.local with:
# DATABASE_URL=your_neon_database_url_from_vercel_dashboard
```

### Step 3: Test Database Integration

#### Test Locally with PostgreSQL:
```bash
npm run dev:postgres  # Uses PostgreSQL backend
```

#### Test Locally with localStorage (fallback):
```bash
npm run dev  # Uses localStorage backend
```

### Step 4: Deploy to Vercel
```bash
# The app is ready to deploy!
# Environment variables should already be configured in Vercel
# PostgreSQL will be used automatically in production
```

## 🔧 How It Works

### Database Backend Switching
- **Development**: Uses localStorage by default for easy testing
- **Production**: Automatically uses PostgreSQL (Neon)
- **Manual Override**: Set `VITE_USE_POSTGRES=true` to force PostgreSQL in dev

### API Endpoints Created
- `GET/POST/PUT/DELETE /api/empleados` - Employee management
- `GET/POST/PUT/DELETE /api/proyectos` - Project management
- `GET/PUT /api/parametros` - System parameters (importe per km/dieta)

### Database Schema
- **empleados** - Employee data with UUIDs
- **proyectos** - Simplified project structure (removed unnecessary fields)
- **planes_mensuales** - Monthly calculation plans
- **bloques_trabajo** - Work blocks (consecutive days)
- **dias_laborables** - Daily work details
- **parametros_sistema** - Configurable system parameters

### Data Migration
- Sample data creation included in both services
- Automatic dieta calculation based on distance (>30km)
- Compatible field mapping between localStorage and PostgreSQL

## 🎯 Benefits After Setup

1. **Persistent Data** - No more losing data on browser clear
2. **Multi-User Support** - Multiple users can access same data
3. **Backup & Recovery** - Data is safely stored in Neon cloud
4. **Performance** - Indexed database queries for better performance
5. **Scalability** - Ready for production workloads

## 🐛 Troubleshooting

### If API calls fail:
1. Check if database schema is created (Step 1)
2. Verify DATABASE_URL environment variable
3. Check Vercel function logs in deployment

### If imports fail:
1. All services now import from `databaseConfig`
2. Check that backup files (*.bak) don't interfere

### If switching doesn't work:
1. Check `VITE_USE_POSTGRES` environment variable
2. Restart development server after changing env vars

## 📝 Current Status

- ✅ **Code**: 100% Complete
- ⚠️ **Database Schema**: Needs setup in Neon Console  
- ⚠️ **Environment Variables**: Need configuration
- ⏳ **Testing**: Ready for testing after schema setup
- ⏳ **Deployment**: Ready for deployment

The app is fully prepared for Neon database integration. You just need to complete the 4 setup steps above!