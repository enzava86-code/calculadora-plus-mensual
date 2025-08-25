# 🧮 Calculadora Plus Mensual

## Descripción

Aplicación web profesional para calcular automáticamente el plus mensual de empleados mediante un algoritmo inteligente que optimiza la distribución de proyectos en bloques de días consecutivos.

## ✨ Características Principales

- **🧠 Algoritmo Inteligente**: Genera planes mensuales con bloques consecutivos de 2-4 días por proyecto
- **📅 Calendario Español**: Respeta festivos nacionales, autonómicos y locales con algoritmo de Pascua
- **👥 Gestión Completa**: CRUD completo para empleados, proyectos y planes con interfaz moderna
- **🗺️ Restricciones Geográficas**: Separación automática entre Peninsula y Mallorca
- **🎯 Optimización de Objetivos**: Alcanza los objetivos mensuales con máxima eficiencia (±1€ precisión)
- **🔄 Múltiples Variantes**: Genera hasta 5 variantes de planes para comparar opciones
- **📊 Dashboard Avanzado**: Estadísticas en tiempo real con gráficos y métricas
- **🏗️ Arquitectura Moderna**: React + TypeScript + Tailwind CSS con componentes reutilizables

## 🚀 Estado del Proyecto - FUNCIONAL

### ✅ Completado (100% funcional):
- ✅ **Dashboard** con estadísticas en tiempo real
- ✅ **Gestión de Empleados** (CRUD completo con búsqueda/filtros)
- ✅ **Gestión de Proyectos** (CRUD completo con validación automática de dietas)
- ✅ **Calculadora Inteligente** con algoritmo de 400+ líneas
- ✅ **Motor de Calendario** español con festivos y Semana Santa
- ✅ **Base de Datos** simulada con localStorage
- ✅ **UI/UX Profesional** con notificaciones y estados de carga
- ✅ **Sistema de Validación** completo con manejo de errores

### 🔄 En Desarrollo:
- 🔄 **Exportación a Excel/PDF**
- 🔄 **Importación desde Excel**
- 🔄 **Gestión Avanzada de Planes**
- 🔄 **Tests Unitarios**

## 🛠️ Tecnologías

- **Frontend**: React 18, TypeScript, Tailwind CSS, Vite
- **Base de Datos**: localStorage (simulando SQLite) 
- **Calendario**: date-fns con algoritmo de cálculo de Pascua
- **Iconos**: Heroicons v2
- **Notificaciones**: react-hot-toast
- **Routing**: React Router v6
- **Excel**: ExcelJS (pendiente integración)

## 📦 Instalación y Ejecución

```bash
# Clonar repositorio
git clone [repo-url]
cd calculadora-plus-mensual

# Instalar dependencias
npm install

# Ejecutar en desarrollo
npm run dev
# 🌐 Aplicación disponible en http://localhost:3000

# Build para producción  
npm run build

# Preview de producción
npm run preview
```

## Funcionalidad Principal

### Lógica de Negocio
- **Objetivo**: Cada empleado tiene un objetivo económico mensual específico
- **Componentes del plus**: 
  - Kilómetros: distancia a proyectos × €/km
  - Dietas: días con dieta × importe fijo por día
- **Restricción geográfica**: Empleados de Mallorca solo van a proyectos de Mallorca, empleados de Península solo a proyectos de Península
- **Output**: Plan mensual día a día que sume exactamente el objetivo económico

### Algoritmo Inteligente
- **Distribución por bloques consecutivos**: 2-4 días laborables al mismo proyecto
- **Solo días laborables**: Excluye automáticamente fines de semana y festivos
- **Gestión de interrupciones**: Si hay festivo en medio de bloque, continúa después
- **Realismo operativo**: Evita cambios diarios de proyecto

## Casos de Uso

### Ejemplo de Output
```
Empleado: Manolo García
Mes: Agosto 2025
Objetivo: 200,00€
Días laborables: 21 días (excluye S-D y 15 Agosto)

Día      | Fecha | Proyecto        | KM    | Dieta | Total
---------|-------|-----------------|-------|-------|-------
Lunes    | 1 Ago | Hotel Barcelona | 45 km | Sí    | 40,75€
Martes   | 2 Ago | Hotel Barcelona | 45 km | Sí    | 40,75€
Miércoles| 3 Ago | Hotel Barcelona | 45 km | Sí    | 40,75€
...

TOTAL MENSUAL: 200,00€ ✓
```

## Datos de Ejemplo

### Empleados
- Manolo García | Peninsula | 200€
- Carmen López | Peninsula | 180€  
- José Ramírez | Mallorca | 220€

### Proyectos
- Hotel Barcelona | 45km | Peninsula
- Oficinas Madrid | 25km | Peninsula
- Centro Valencia | 65km | Peninsula

## Contribuir

1. Fork del repositorio
2. Crear rama de feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit de cambios (`git commit -am 'Añadir nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Crear Pull Request

## Licencia

MIT License - ver archivo LICENSE para detalles