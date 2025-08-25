# 🧮 Calculadora Plus Mensual

## Descripción

Aplicación web profesional para calcular automáticamente el plus mensual de empleados mediante un algoritmo inteligente que optimiza la distribución de proyectos y ajusta los importes de forma configurable.

## ✨ Características Principales

- **🧠 Algoritmo Híbrido v2.1**: Genera planes mensuales optimizados que se ajustan al objetivo económico
- **⚙️ Importes Configurables**: Configura los importes por kilómetro y dieta desde la interfaz
- **📅 Calendario Español**: Respeta festivos nacionales y autonómicos con algoritmo de Pascua
- **👥 Gestión Simplificada**: CRUD optimizado para empleados y proyectos
- **🗺️ Restricciones Geográficas**: Separación automática entre Peninsula y Mallorca
- **🎯 Precisión ±3€**: Alcanza los objetivos mensuales con máxima eficiencia
- **📊 Cálculo Masivo**: Genera planes para todos los empleados automáticamente
- **📑 Exportación Excel**: Exporta resultados completos con todos los detalles
- **🏗️ Arquitectura Moderna**: React + TypeScript + Tailwind CSS + Vite

## 🚀 Estado del Proyecto - COMPLETAMENTE FUNCIONAL

### ✅ Funcionalidades Implementadas:
- ✅ **Dashboard** con estadísticas en tiempo real
- ✅ **Gestión de Empleados** (CRUD completo con búsqueda/filtros)
- ✅ **Gestión de Proyectos** (CRUD simplificado con validación automática)
- ✅ **Calculadora Inteligente** con configuración de importes
- ✅ **Motor de Calendario** español completo
- ✅ **Generación Masiva** de planes para todos los empleados
- ✅ **Exportación Excel** completa con detalles
- ✅ **Base de Datos** localStorage con persistencia
- ✅ **UI/UX Profesional** con notificaciones en tiempo real

## 🛠️ Tecnologías

- **Frontend**: React 18, TypeScript, Tailwind CSS, Vite
- **Base de Datos**: localStorage (simulando SQLite) 
- **Calendario**: date-fns con cálculo de Pascua y festivos españoles
- **Iconos**: Heroicons v2
- **Notificaciones**: react-hot-toast
- **Routing**: React Router v6
- **Excel**: ExcelJS para exportación
- **Estado**: Zustand para gestión de estado

## 📦 Instalación y Ejecución

```bash
# Clonar repositorio
git clone https://github.com/[tu-usuario]/calculadora-plus-mensual.git
cd calculadora-plus-mensual

# Instalar dependencias
npm install

# Ejecutar en desarrollo
npm run dev
# 🌐 Aplicación disponible en http://localhost:5173

# Build para producción  
npm run build

# Preview de producción
npm run preview
```

## 🎮 Uso de la Aplicación

### 1. Configuración de Importes
- Ve a la pestaña **Calculadora**
- Modifica los importes por kilómetro y dieta según tus necesidades
- Guarda la configuración antes de generar planes

### 2. Gestión de Empleados
- Añade empleados con su ubicación (Peninsula/Mallorca) y objetivo mensual
- Los objetivos se usan para calcular el plan óptimo

### 3. Gestión de Proyectos
- Añade proyectos con ubicación y distancia en kilómetros
- La dieta se calcula automáticamente (>30km requiere dieta)

### 4. Generación de Planes
- En **Calculadora**, selecciona mes y año
- Click en "Generar Planes para Todos los Empleados"
- Exporta a Excel cuando esté listo

## 💡 Lógica de Negocio

### Componentes del Plus
- **Kilómetros**: `distancia × importe_por_km × días_trabajados`
- **Dietas**: `días_con_dieta × importe_por_dieta` (proyectos >30km)
- **Total Día**: `importe_km + importe_dieta`

### Restricciones
- **Geográficas**: Empleados solo van a proyectos de su ubicación
- **Días Laborables**: Solo lunes a viernes, excluyendo festivos
- **Bloques Consecutivos**: 2-5 días consecutivos por proyecto
- **Objetivo**: El algoritmo busca alcanzar exactamente el objetivo mensual

### Ejemplo de Salida
```
Empleado: Manolo García (Peninsula, Objetivo: €200)
Mes: Agosto 2025 (21 días laborables)

Proyecto: Hotel Barcelona (45km, Con dieta)
- Días: 5 días consecutivos
- Importe/día: €43.75 (45km × €0.42 + €25 dieta)
- Total bloque: €218.75

TOTAL MENSUAL: €218.75 (Diferencia: +€18.75)
```

## 📊 Datos de Ejemplo Incluidos

### Empleados
- Manolo García | Peninsula | €200
- Carmen López | Peninsula | €180  
- José Ramírez | Mallorca | €220
- Ana Martínez | Mallorca | €190
- Pedro Sánchez | Peninsula | €210
- María Fernández | Mallorca | €175

### Proyectos
**Peninsula:**
- Hotel Barcelona Centro | 45km
- Oficinas Madrid Norte | 25km
- Centro Comercial Valencia | 65km
- Residencial Sevilla | 85km
- Fábrica Castellón | 55km

**Mallorca:**
- Hotel Playa Palma | 15km
- Apartamentos Alcudia | 35km
- Centro Comercial Inca | 25km
- Resort Cala Millor | 55km
- Oficinas Palma Centro | 8km

## 🚀 Despliegue en Vercel

El proyecto está preparado para desplegarse en Vercel:

```bash
# Instalar Vercel CLI
npm i -g vercel

# Login en Vercel
vercel login

# Desplegar
vercel

# Para producción
vercel --prod
```

El archivo `vercel.json` ya está configurado para el enrutamiento SPA.

## 🔧 Scripts Disponibles

```bash
npm run dev          # Servidor de desarrollo
npm run build        # Build de producción
npm run preview      # Preview del build
npm run lint         # Linting con ESLint
npm run type-check   # Verificación de tipos TypeScript
```

## 📁 Estructura del Proyecto

```
src/
├── components/         # Componentes reutilizables
│   ├── Calculadora/   # Componentes de cálculo
│   ├── Empleados/     # Gestión de empleados
│   └── Proyectos/     # Gestión de proyectos
├── pages/             # Páginas principales
├── services/          # Lógica de negocio
├── types/             # Definiciones TypeScript
└── hooks/             # Custom hooks

public/                # Recursos estáticos
docs/                  # Documentación adicional
```

## 🤝 Contribuir

1. Fork del repositorio
2. Crear rama de feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit de cambios (`git commit -am 'Añadir nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Crear Pull Request

## 📄 Licencia

MIT License - ver archivo LICENSE para detalles

## 🆘 Soporte

Para problemas o sugerencias, crear un issue en el repositorio de GitHub.

---

**Desarrollado con ❤️ usando React + TypeScript + Tailwind CSS**