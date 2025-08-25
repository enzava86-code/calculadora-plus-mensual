-- Calculadora Plus Mensual Database Schema
-- PostgreSQL schema for Neon database

-- Enable UUID extension for generating IDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Empleados table
CREATE TABLE IF NOT EXISTS empleados (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre VARCHAR(100) NOT NULL,
    apellidos VARCHAR(200) NOT NULL,
    ubicacion VARCHAR(20) NOT NULL CHECK (ubicacion IN ('Peninsula', 'Mallorca')),
    objetivo_mensual DECIMAL(10,2) NOT NULL CHECK (objetivo_mensual > 0),
    estado VARCHAR(20) NOT NULL DEFAULT 'activo' CHECK (estado IN ('activo', 'inactivo')),
    fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    fecha_modificacion TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT empleados_unique_name_ubicacion UNIQUE (nombre, apellidos, ubicacion)
);

-- Proyectos table (simplified structure)
CREATE TABLE IF NOT EXISTS proyectos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre VARCHAR(200) NOT NULL,
    ubicacion VARCHAR(20) NOT NULL CHECK (ubicacion IN ('Peninsula', 'Mallorca')),
    distancia_km INTEGER NOT NULL CHECK (distancia_km >= 0),
    requiere_dieta BOOLEAN NOT NULL DEFAULT FALSE,
    CONSTRAINT proyectos_unique_name_ubicacion UNIQUE (nombre, ubicacion)
);

-- Planes mensuales table
CREATE TABLE IF NOT EXISTS planes_mensuales (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    empleado_id UUID NOT NULL REFERENCES empleados(id) ON DELETE CASCADE,
    mes INTEGER NOT NULL CHECK (mes BETWEEN 1 AND 12),
    año INTEGER NOT NULL CHECK (año >= 2020 AND año <= 2100),
    estado VARCHAR(20) NOT NULL DEFAULT 'borrador' CHECK (estado IN ('borrador', 'aprobado', 'ejecutado')),
    fecha_generacion TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    objetivo_mensual DECIMAL(10,2) NOT NULL,
    total_calculado DECIMAL(10,2) NOT NULL DEFAULT 0,
    diferencia DECIMAL(10,2) NOT NULL DEFAULT 0,
    dias_laborables INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT planes_unique_empleado_mes_año UNIQUE (empleado_id, mes, año)
);

-- Bloques de trabajo (períodos consecutivos en proyectos)
CREATE TABLE IF NOT EXISTS bloques_trabajo (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    plan_id UUID NOT NULL REFERENCES planes_mensuales(id) ON DELETE CASCADE,
    proyecto_id UUID NOT NULL REFERENCES proyectos(id) ON DELETE CASCADE,
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE NOT NULL,
    dias_consecutivos INTEGER NOT NULL CHECK (dias_consecutivos > 0),
    importe_total DECIMAL(10,2) NOT NULL DEFAULT 0,
    CHECK (fecha_fin >= fecha_inicio)
);

-- Días laborables (detalle diario de cada plan)
CREATE TABLE IF NOT EXISTS dias_laborables (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    plan_id UUID NOT NULL REFERENCES planes_mensuales(id) ON DELETE CASCADE,
    bloque_id UUID REFERENCES bloques_trabajo(id) ON DELETE SET NULL,
    proyecto_id UUID REFERENCES proyectos(id) ON DELETE SET NULL,
    fecha DATE NOT NULL,
    es_festivo BOOLEAN NOT NULL DEFAULT FALSE,
    distancia_km INTEGER DEFAULT 0,
    tiene_dieta BOOLEAN DEFAULT FALSE,
    importe_km DECIMAL(10,2) DEFAULT 0,
    importe_dieta DECIMAL(10,2) DEFAULT 0,
    total_dia DECIMAL(10,2) DEFAULT 0,
    CONSTRAINT dias_unique_plan_fecha UNIQUE (plan_id, fecha)
);

-- Parámetros del sistema
CREATE TABLE IF NOT EXISTS parametros_sistema (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clave VARCHAR(100) NOT NULL UNIQUE,
    valor_numerico DECIMAL(10,4),
    valor_texto VARCHAR(500),
    valor_booleano BOOLEAN,
    descripcion TEXT,
    fecha_modificacion TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default system parameters
INSERT INTO parametros_sistema (clave, valor_numerico, descripcion) VALUES
('importe_por_km', 0.42, 'Importe por kilómetro en euros')
ON CONFLICT (clave) DO NOTHING;

INSERT INTO parametros_sistema (clave, valor_numerico, descripcion) VALUES
('importe_por_dieta', 25.00, 'Importe por dieta diaria en euros')
ON CONFLICT (clave) DO NOTHING;

INSERT INTO parametros_sistema (clave, valor_numerico, descripcion) VALUES
('distancia_minima_para_dieta', 30, 'Distancia mínima en km para requerir dieta')
ON CONFLICT (clave) DO NOTHING;

INSERT INTO parametros_sistema (clave, valor_numerico, descripcion) VALUES
('dias_minimos_bloque', 2, 'Días mínimos consecutivos por bloque')
ON CONFLICT (clave) DO NOTHING;

INSERT INTO parametros_sistema (clave, valor_numerico, descripcion) VALUES
('dias_maximos_bloque', 5, 'Días máximos consecutivos por bloque')
ON CONFLICT (clave) DO NOTHING;

INSERT INTO parametros_sistema (clave, valor_numerico, descripcion) VALUES
('error_maximo_permitido', 3.00, 'Error máximo permitido en euros para alcanzar objetivo')
ON CONFLICT (clave) DO NOTHING;

INSERT INTO parametros_sistema (clave, valor_booleano, descripcion) VALUES
('priorizar_objetivo_sobre_consecutividad', true, 'Priorizar alcanzar objetivo sobre mantener días consecutivos')
ON CONFLICT (clave) DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_empleados_ubicacion ON empleados(ubicacion);
CREATE INDEX IF NOT EXISTS idx_empleados_estado ON empleados(estado);
CREATE INDEX IF NOT EXISTS idx_proyectos_ubicacion ON proyectos(ubicacion);
CREATE INDEX IF NOT EXISTS idx_planes_empleado_mes_año ON planes_mensuales(empleado_id, mes, año);
CREATE INDEX IF NOT EXISTS idx_bloques_plan_proyecto ON bloques_trabajo(plan_id, proyecto_id);
CREATE INDEX IF NOT EXISTS idx_dias_plan_fecha ON dias_laborables(plan_id, fecha);

-- Create update trigger for fecha_modificacion
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.fecha_modificacion = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE OR REPLACE TRIGGER update_empleados_modtime 
    BEFORE UPDATE ON empleados 
    FOR EACH ROW EXECUTE FUNCTION update_modified_column();

CREATE OR REPLACE TRIGGER update_parametros_modtime 
    BEFORE UPDATE ON parametros_sistema 
    FOR EACH ROW EXECUTE FUNCTION update_modified_column();