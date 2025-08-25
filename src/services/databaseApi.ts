import { Empleado, CreateEmpleadoDto, UpdateEmpleadoDto } from '@/types/empleado';
import { Proyecto, CreateProyectoDto, UpdateProyectoDto } from '@/types/proyecto';
import { PlanMensual } from '@/types/plan';

// API base URL - will be different in development vs production
const API_BASE_URL = import.meta.env.PROD ? '/api' : '/api';

class DatabaseApiService {
  // EMPLEADOS
  async getEmpleados(): Promise<Empleado[]> {
    const response = await fetch(`${API_BASE_URL}/empleados`);
    if (!response.ok) {
      throw new Error('Failed to fetch empleados');
    }
    const data = await response.json();
    return data.map(this.parseEmpleado);
  }

  async getEmpleadoById(id: string): Promise<Empleado | null> {
    const response = await fetch(`${API_BASE_URL}/empleados?id=${id}`);
    if (!response.ok) {
      if (response.status === 404) return null;
      throw new Error('Failed to fetch empleado');
    }
    const data = await response.json();
    return this.parseEmpleado(data);
  }

  async createEmpleado(dto: CreateEmpleadoDto): Promise<Empleado> {
    const response = await fetch(`${API_BASE_URL}/empleados`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        nombre: dto.nombre,
        apellidos: dto.apellidos,
        ubicacion: dto.ubicacion,
        objetivoMensual: dto.objetivoMensual
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to create empleado');
    }
    const data = await response.json();
    return this.parseEmpleado(data);
  }

  async updateEmpleado(id: string, dto: UpdateEmpleadoDto): Promise<Empleado> {
    const response = await fetch(`${API_BASE_URL}/empleados?id=${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        nombre: dto.nombre,
        apellidos: dto.apellidos,
        ubicacion: dto.ubicacion,
        objetivoMensual: dto.objetivoMensual
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to update empleado');
    }
    const data = await response.json();
    return this.parseEmpleado(data);
  }

  async deleteEmpleado(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/empleados?id=${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Failed to delete empleado');
    }
  }

  async clearAllEmpleados(): Promise<void> {
    // This would need special endpoint or multiple delete calls
    const empleados = await this.getEmpleados();
    for (const empleado of empleados) {
      await this.deleteEmpleado(empleado.id);
    }
  }

  // PROYECTOS
  async getProyectos(): Promise<Proyecto[]> {
    const response = await fetch(`${API_BASE_URL}/proyectos`);
    if (!response.ok) {
      throw new Error('Failed to fetch proyectos');
    }
    const data = await response.json();
    return data.map(this.parseProyecto);
  }

  async getProyectoById(id: string): Promise<Proyecto | null> {
    const response = await fetch(`${API_BASE_URL}/proyectos?id=${id}`);
    if (!response.ok) {
      if (response.status === 404) return null;
      throw new Error('Failed to fetch proyecto');
    }
    const data = await response.json();
    return this.parseProyecto(data);
  }

  async getProyectosByUbicacion(ubicacion: string): Promise<Proyecto[]> {
    const response = await fetch(`${API_BASE_URL}/proyectos?ubicacion=${ubicacion}`);
    if (!response.ok) {
      throw new Error('Failed to fetch proyectos by ubicacion');
    }
    const data = await response.json();
    return data.map(this.parseProyecto);
  }

  async createProyecto(dto: CreateProyectoDto): Promise<Proyecto> {
    const response = await fetch(`${API_BASE_URL}/proyectos`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        nombre: dto.nombre,
        ubicacion: dto.ubicacion,
        distanciaKm: dto.distanciaKm
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to create proyecto');
    }
    const data = await response.json();
    return this.parseProyecto(data);
  }

  async updateProyecto(id: string, dto: UpdateProyectoDto): Promise<Proyecto> {
    const response = await fetch(`${API_BASE_URL}/proyectos?id=${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        nombre: dto.nombre,
        ubicacion: dto.ubicacion,
        distanciaKm: dto.distanciaKm
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to update proyecto');
    }
    const data = await response.json();
    return this.parseProyecto(data);
  }

  async deleteProyecto(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/proyectos?id=${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Failed to delete proyecto');
    }
  }

  async clearAllProyectos(): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/proyectos?all=true`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Failed to clear all proyectos');
    }
  }

  // PARÁMETROS DEL SISTEMA
  async getParametros() {
    const response = await fetch(`${API_BASE_URL}/parametros`);
    if (!response.ok) {
      throw new Error('Failed to fetch parametros');
    }
    return await response.json();
  }

  async saveParametros(parametros: any): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/parametros`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(parametros),
    });

    if (!response.ok) {
      throw new Error('Failed to save parametros');
    }
  }

  // PLANES MENSUALES (placeholder - will need full implementation)
  async getPlanes(): Promise<PlanMensual[]> {
    // For now, return empty array - will need API endpoint
    return [];
  }

  async getPlanById(id: string): Promise<PlanMensual | null> {
    // Placeholder
    return null;
  }

  async getPlanByEmpleadoYMes(empleadoId: string, mes: number, año: number): Promise<PlanMensual | null> {
    // Placeholder
    return null;
  }

  async savePlan(plan: PlanMensual): Promise<PlanMensual> {
    // Placeholder
    return plan;
  }

  async deletePlan(id: string): Promise<void> {
    // Placeholder
  }

  // ESTADÍSTICAS
  async getEstadisticas() {
    const [empleados, proyectos] = await Promise.all([
      this.getEmpleados(),
      this.getProyectos()
    ]);

    return {
      empleados: {
        total: empleados.length,
        activos: empleados.filter(e => e.estado === 'activo').length,
        peninsula: empleados.filter(e => e.ubicacion === 'Peninsula').length,
        mallorca: empleados.filter(e => e.ubicacion === 'Mallorca').length,
      },
      proyectos: {
        total: proyectos.length,
        peninsula: proyectos.filter(p => p.ubicacion === 'Peninsula').length,
        mallorca: proyectos.filter(p => p.ubicacion === 'Mallorca').length,
      },
      planes: {
        total: 0, // Will need implementation
        borradores: 0,
        aprobados: 0,
        ejecutados: 0,
      },
    };
  }

  // INICIALIZACIÓN CON DATOS DE EJEMPLO
  async initializeWithSampleData(): Promise<void> {
    const empleados = await this.getEmpleados();
    const proyectos = await this.getProyectos();

    if (empleados.length === 0) {
      await this.createSampleEmpleados();
    }

    if (proyectos.length === 0) {
      await this.createSampleProyectos();
    }
  }

  private async createSampleEmpleados(): Promise<void> {
    const sampleEmpleados: CreateEmpleadoDto[] = [
      { nombre: 'Manolo', apellidos: 'García Rodríguez', ubicacion: 'Peninsula', objetivoMensual: 200 },
      { nombre: 'Carmen', apellidos: 'López Martínez', ubicacion: 'Peninsula', objetivoMensual: 180 },
      { nombre: 'José', apellidos: 'Ramírez Fernández', ubicacion: 'Mallorca', objetivoMensual: 220 },
      { nombre: 'Ana', apellidos: 'Martínez González', ubicacion: 'Mallorca', objetivoMensual: 190 },
      { nombre: 'Pedro', apellidos: 'Sánchez López', ubicacion: 'Peninsula', objetivoMensual: 210 },
      { nombre: 'María', apellidos: 'Fernández Ruiz', ubicacion: 'Mallorca', objetivoMensual: 175 },
    ];

    for (const empleado of sampleEmpleados) {
      try {
        await this.createEmpleado(empleado);
      } catch (error) {
        console.log(`Empleado ${empleado.nombre} ${empleado.apellidos} might already exist`);
      }
    }
  }

  private async createSampleProyectos(): Promise<void> {
    const sampleProyectos: CreateProyectoDto[] = [
      // Peninsula
      { nombre: 'Hotel Barcelona Centro', ubicacion: 'Peninsula', distanciaKm: 45 },
      { nombre: 'Oficinas Madrid Norte', ubicacion: 'Peninsula', distanciaKm: 25 },
      { nombre: 'Centro Comercial Valencia', ubicacion: 'Peninsula', distanciaKm: 65 },
      { nombre: 'Residencial Sevilla', ubicacion: 'Peninsula', distanciaKm: 85 },
      { nombre: 'Fábrica Castellón', ubicacion: 'Peninsula', distanciaKm: 55 },
      
      // Mallorca
      { nombre: 'Hotel Playa Palma', ubicacion: 'Mallorca', distanciaKm: 15 },
      { nombre: 'Apartamentos Alcudia', ubicacion: 'Mallorca', distanciaKm: 35 },
      { nombre: 'Centro Comercial Inca', ubicacion: 'Mallorca', distanciaKm: 25 },
      { nombre: 'Resort Cala Millor', ubicacion: 'Mallorca', distanciaKm: 55 },
      { nombre: 'Oficinas Palma Centro', ubicacion: 'Mallorca', distanciaKm: 8 },
    ];

    for (const proyecto of sampleProyectos) {
      try {
        await this.createProyecto(proyecto);
      } catch (error) {
        console.log(`Proyecto ${proyecto.nombre} might already exist`);
      }
    }
  }

  // UTILIDADES PRIVADAS
  private parseEmpleado(data: any): Empleado {
    return {
      id: data.id,
      nombre: data.nombre,
      apellidos: data.apellidos,
      ubicacion: data.ubicacion,
      objetivoMensual: parseFloat(data.objetivo_mensual),
      estado: data.estado,
      fechaCreacion: new Date(data.fecha_creacion),
      fechaModificacion: new Date(data.fecha_modificacion),
    };
  }

  private parseProyecto(data: any): Proyecto {
    return {
      id: data.id,
      nombre: data.nombre,
      ubicacion: data.ubicacion,
      distanciaKm: parseInt(data.distancia_km),
      requiereDieta: data.requiere_dieta,
    };
  }

  // LIMPIEZA DE DATOS (placeholders)
  async clearAllData(): Promise<void> {
    await this.clearAllEmpleados();
    await this.clearAllProyectos();
  }

  async resetParametros(): Promise<void> {
    // Would need API endpoint
  }
}

export const dbApiService = new DatabaseApiService();