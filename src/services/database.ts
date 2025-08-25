import { Empleado, CreateEmpleadoDto, UpdateEmpleadoDto } from '@/types/empleado';
import { Proyecto, CreateProyectoDto, UpdateProyectoDto } from '@/types/proyecto';
import { PlanMensual } from '@/types/plan';

// Simulación de base de datos local usando localStorage
// En una implementación real, esto sería SQLite o IndexedDB

class DatabaseService {
  private readonly STORAGE_KEYS = {
    empleados: 'calculadora_empleados',
    proyectos: 'calculadora_proyectos',
    planes: 'calculadora_planes',
    parametros: 'calculadora_parametros',
  };

  // EMPLEADOS
  async getEmpleados(): Promise<Empleado[]> {
    const data = localStorage.getItem(this.STORAGE_KEYS.empleados);
    return data ? JSON.parse(data).map(this.parseEmpleado) : [];
  }

  async getEmpleadoById(id: string): Promise<Empleado | null> {
    const empleados = await this.getEmpleados();
    return empleados.find(e => e.id === id) || null;
  }

  async createEmpleado(dto: CreateEmpleadoDto): Promise<Empleado> {
    const empleados = await this.getEmpleados();
    const nuevoEmpleado: Empleado = {
      id: this.generateId(),
      ...dto,
      estado: 'activo',
      fechaCreacion: new Date(),
      fechaModificacion: new Date(),
    };

    empleados.push(nuevoEmpleado);
    await this.saveEmpleados(empleados);
    return nuevoEmpleado;
  }

  async updateEmpleado(id: string, dto: UpdateEmpleadoDto): Promise<Empleado> {
    const empleados = await this.getEmpleados();
    const index = empleados.findIndex(e => e.id === id);
    
    if (index === -1) {
      throw new Error('Empleado no encontrado');
    }

    empleados[index] = {
      ...empleados[index],
      ...dto,
      fechaModificacion: new Date(),
    };

    await this.saveEmpleados(empleados);
    return empleados[index];
  }

  async deleteEmpleado(id: string): Promise<void> {
    const empleados = await this.getEmpleados();
    const filtered = empleados.filter(e => e.id !== id);
    await this.saveEmpleados(filtered);
  }

  // PROYECTOS
  async getProyectos(): Promise<Proyecto[]> {
    const data = localStorage.getItem(this.STORAGE_KEYS.proyectos);
    return data ? JSON.parse(data).map(this.parseProyecto) : [];
  }

  async getProyectoById(id: string): Promise<Proyecto | null> {
    const proyectos = await this.getProyectos();
    return proyectos.find(p => p.id === id) || null;
  }

  async getProyectosByUbicacion(ubicacion: string): Promise<Proyecto[]> {
    const proyectos = await this.getProyectos();
    return proyectos.filter(p => p.ubicacion === ubicacion);
  }

  async createProyecto(dto: CreateProyectoDto): Promise<Proyecto> {
    const proyectos = await this.getProyectos();
    const nuevoProyecto: Proyecto = {
      id: this.generateId(),
      ...dto,
      requiereDieta: dto.distanciaKm > 30, // Automático: >30km requiere dieta
    };

    proyectos.push(nuevoProyecto);
    await this.saveProyectos(proyectos);
    return nuevoProyecto;
  }

  async updateProyecto(id: string, dto: UpdateProyectoDto): Promise<Proyecto> {
    const proyectos = await this.getProyectos();
    const index = proyectos.findIndex(p => p.id === id);
    
    if (index === -1) {
      throw new Error('Proyecto no encontrado');
    }

    const updatedProyecto = {
      ...proyectos[index],
      ...dto,
    };

    // Recalcular dieta si cambió la distancia
    if (dto.distanciaKm !== undefined) {
      updatedProyecto.requiereDieta = dto.distanciaKm > 30;
    }

    proyectos[index] = updatedProyecto;
    await this.saveProyectos(proyectos);
    return updatedProyecto;
  }

  async deleteProyecto(id: string): Promise<void> {
    const proyectos = await this.getProyectos();
    const filtered = proyectos.filter(p => p.id !== id);
    await this.saveProyectos(filtered);
  }

  // PLANES MENSUALES
  async getPlanes(): Promise<PlanMensual[]> {
    const data = localStorage.getItem(this.STORAGE_KEYS.planes);
    return data ? JSON.parse(data).map(this.parsePlan) : [];
  }

  async getPlanById(id: string): Promise<PlanMensual | null> {
    const planes = await this.getPlanes();
    return planes.find(p => p.id === id) || null;
  }

  async getPlanByEmpleadoYMes(empleadoId: string, mes: number, año: number): Promise<PlanMensual | null> {
    const planes = await this.getPlanes();
    return planes.find(p => p.empleado.id === empleadoId && p.mes === mes && p.año === año) || null;
  }

  async savePlan(plan: PlanMensual): Promise<PlanMensual> {
    const planes = await this.getPlanes();
    const index = planes.findIndex(p => p.id === plan.id);
    
    if (index === -1) {
      planes.push(plan);
    } else {
      planes[index] = plan;
    }

    await this.savePlanes(planes);
    return plan;
  }

  async deletePlan(id: string): Promise<void> {
    const planes = await this.getPlanes();
    const filtered = planes.filter(p => p.id !== id);
    await this.savePlanes(filtered);
  }

  // PARÁMETROS DEL SISTEMA
  async getParametros() {
    const data = localStorage.getItem(this.STORAGE_KEYS.parametros);
    return data ? JSON.parse(data) : this.getDefaultParametros();
  }

  async saveParametros(parametros: any): Promise<void> {
    localStorage.setItem(this.STORAGE_KEYS.parametros, JSON.stringify(parametros));
  }

  private getDefaultParametros() {
    return {
      importePorKm: 0.42, // €/km más realista para España 2025
      importePorDieta: 25.00, // €/día de dieta (correcto)
      distanciaMinimaParaDieta: 30, // km mínimos para dieta
      diasMinimosBloque: 2, // mínimo 2 días consecutivos
      diasMaximosBloque: 5, // máximo 5 días consecutivos (coherente con algoritmo)
      errorMaximoPermitido: 3.00, // ±3€ más estricto para mejor precisión
      priorizarObjetivoSobreConsecutividad: true,
    };
  }

  // UTILIDADES PRIVADAS
  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  private parseEmpleado(data: any): Empleado {
    return {
      ...data,
      fechaCreacion: new Date(data.fechaCreacion),
      fechaModificacion: new Date(data.fechaModificacion),
    };
  }

  private parseProyecto(data: any): Proyecto {
    return {
      ...data,
    };
  }

  private parsePlan(data: any): PlanMensual {
    return {
      ...data,
      fechaGeneracion: new Date(data.fechaGeneracion),
      diasLaborables: data.diasLaborables.map((dia: any) => ({
        ...dia,
        fecha: new Date(dia.fecha),
      })),
      bloques: data.bloques.map((bloque: any) => ({
        ...bloque,
        fechaInicio: new Date(bloque.fechaInicio),
        fechaFin: new Date(bloque.fechaFin),
        diasLaborables: bloque.diasLaborables.map((dia: any) => ({
          ...dia,
          fecha: new Date(dia.fecha),
        })),
      })),
    };
  }

  private async saveEmpleados(empleados: Empleado[]): Promise<void> {
    localStorage.setItem(this.STORAGE_KEYS.empleados, JSON.stringify(empleados));
  }

  private async saveProyectos(proyectos: Proyecto[]): Promise<void> {
    localStorage.setItem(this.STORAGE_KEYS.proyectos, JSON.stringify(proyectos));
  }

  private async savePlanes(planes: PlanMensual[]): Promise<void> {
    localStorage.setItem(this.STORAGE_KEYS.planes, JSON.stringify(planes));
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
      await this.createEmpleado(empleado);
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
      await this.createProyecto(proyecto);
    }
  }

  // LIMPIEZA DE DATOS
  async clearAllData(): Promise<void> {
    localStorage.removeItem(this.STORAGE_KEYS.empleados);
    localStorage.removeItem(this.STORAGE_KEYS.proyectos);
    localStorage.removeItem(this.STORAGE_KEYS.planes);
    localStorage.removeItem(this.STORAGE_KEYS.parametros);
  }

  async resetParametros(): Promise<void> {
    localStorage.removeItem(this.STORAGE_KEYS.parametros);
  }

  async clearAllEmpleados(): Promise<void> {
    localStorage.removeItem(this.STORAGE_KEYS.empleados);
  }

  async clearAllProyectos(): Promise<void> {
    localStorage.removeItem(this.STORAGE_KEYS.proyectos);
  }

  // ESTADÍSTICAS
  async getEstadisticas() {
    const empleados = await this.getEmpleados();
    const proyectos = await this.getProyectos();
    const planes = await this.getPlanes();

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
        total: planes.length,
        borradores: planes.filter(p => p.estado === 'borrador').length,
        aprobados: planes.filter(p => p.estado === 'aprobado').length,
        ejecutados: planes.filter(p => p.estado === 'ejecutado').length,
      },
    };
  }
}

export const dbService = new DatabaseService();