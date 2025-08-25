import { 
  Festivo, 
  ConfiguracionCalendario, 
  DiaCalendario, 
  MesCalendario, 
  ResumenAnual,
  FESTIVOS_NACIONALES_FIJOS,
  FESTIVOS_AUTONOMICOS
} from '@/types/calendario';
import { addDays, format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, getMonth, getYear } from 'date-fns';
import { es } from 'date-fns/locale';

class CalendarioService {
  private readonly STORAGE_KEY = 'calculadora_calendario_config';

  /**
   * Obtiene la configuración del calendario para un año específico
   */
  async getConfiguracion(año: number): Promise<ConfiguracionCalendario> {
    const data = localStorage.getItem(`${this.STORAGE_KEY}_${año}`);
    if (data) {
      const config = JSON.parse(data);
      return {
        ...config,
        fechaCreacion: new Date(config.fechaCreacion),
        fechaModificacion: new Date(config.fechaModificacion),
        festivos: config.festivos.map((f: any) => ({
          ...f,
          fecha: new Date(f.fecha),
        })),
      };
    }

    // Crear configuración por defecto
    return this.crearConfiguracionDefault(año);
  }

  /**
   * Genera la configuración por defecto para un año
   */
  private async crearConfiguracionDefault(año: number): Promise<ConfiguracionCalendario> {
    const festivos = await this.calcularFestivosAño(año);
    
    const config: ConfiguracionCalendario = {
      año,
      festivos,
      diasLaborablesSemana: [1, 2, 3, 4, 5], // Lunes a Viernes
      fechaCreacion: new Date(),
      fechaModificacion: new Date(),
    };

    await this.saveConfiguracion(config);
    return config;
  }

  /**
   * Calcula todos los festivos para un año específico
   */
  private async calcularFestivosAño(año: number, comunidadAutonoma: string = 'Nacional'): Promise<Festivo[]> {
    const festivos: Festivo[] = [];

    // Festivos nacionales fijos
    for (const festivo of FESTIVOS_NACIONALES_FIJOS) {
      festivos.push({
        fecha: new Date(año, festivo.mes - 1, festivo.dia),
        nombre: festivo.nombre,
        tipo: 'nacional',
        fijo: true,
      });
    }

    // Festivos móviles (Semana Santa)
    const semanaSanta = this.calcularSemanaSanta(año);
    festivos.push(
      {
        fecha: semanaSanta.juevesSanto,
        nombre: 'Jueves Santo',
        tipo: 'nacional',
        fijo: false,
      },
      {
        fecha: semanaSanta.viernesSanto,
        nombre: 'Viernes Santo',
        tipo: 'nacional',
        fijo: false,
      }
    );

    // Festivos autonómicos para Baleares (por defecto)
    if (comunidadAutonoma === 'Baleares' || comunidadAutonoma === 'Nacional') {
      const baleares = FESTIVOS_AUTONOMICOS['Baleares'] || [];
      for (const festivo of baleares) {
        festivos.push({
          fecha: new Date(año, festivo.mes - 1, festivo.dia),
          nombre: festivo.nombre,
          tipo: 'autonomico',
          fijo: true,
          ubicacion: 'Baleares',
        });
      }
    }

    return festivos.sort((a, b) => a.fecha.getTime() - b.fecha.getTime());
  }

  /**
   * Calcula las fechas de Semana Santa para un año específico
   * Algoritmo de Gauss para calcular el Domingo de Pascua
   */
  private calcularSemanaSanta(año: number) {
    const a = año % 19;
    const b = Math.floor(año / 100);
    const c = año % 100;
    const d = Math.floor(b / 4);
    const e = b % 4;
    const f = Math.floor((b + 8) / 25);
    const g = Math.floor((b - f + 1) / 3);
    const h = (19 * a + b - d - g + 15) % 30;
    const i = Math.floor(c / 4);
    const k = c % 4;
    const l = (32 + 2 * e + 2 * i - h - k) % 7;
    const m = Math.floor((a + 11 * h + 22 * l) / 451);
    const n = Math.floor((h + l - 7 * m + 114) / 31);
    const p = (h + l - 7 * m + 114) % 31;

    const domingoPascua = new Date(año, n - 1, p + 1);
    
    return {
      domingoPascua,
      juevesSanto: new Date(domingoPascua.getTime() - 3 * 24 * 60 * 60 * 1000), // -3 días
      viernesSanto: new Date(domingoPascua.getTime() - 2 * 24 * 60 * 60 * 1000), // -2 días
      lunesPascua: new Date(domingoPascua.getTime() + 1 * 24 * 60 * 60 * 1000), // +1 día
    };
  }

  /**
   * Genera el calendario completo para un mes específico
   */
  async generarMesCalendario(mes: number, año: number): Promise<MesCalendario> {
    const config = await this.getConfiguracion(año);
    const primerDia = startOfMonth(new Date(año, mes - 1, 1));
    const ultimoDia = endOfMonth(primerDia);
    
    const todosDias = eachDayOfInterval({ start: primerDia, end: ultimoDia });
    
    const dias: DiaCalendario[] = todosDias.map(fecha => {
      const diaSemana = getDay(fecha); // 0=Domingo, 1=Lunes, etc.
      const esFinDeSemana = diaSemana === 0 || diaSemana === 6;
      const festivo = config.festivos.find(f => 
        f.fecha.getDate() === fecha.getDate() &&
        f.fecha.getMonth() === fecha.getMonth() &&
        f.fecha.getFullYear() === fecha.getFullYear()
      );
      const esFestivo = !!festivo;
      const esLaborable = config.diasLaborablesSemana.includes(diaSemana) && !esFestivo;

      return {
        fecha,
        diaSemana,
        esLaborable,
        esFinDeSemana,
        esFestivo,
        festivo,
      };
    });

    const diasLaborables = dias.filter(d => d.esLaborable).length;
    const diasFinDeSemana = dias.filter(d => d.esFinDeSemana).length;
    const diasFestivos = dias.filter(d => d.esFestivo).length;

    return {
      mes,
      año,
      nombre: format(primerDia, 'MMMM', { locale: es }),
      dias,
      totalDias: dias.length,
      diasLaborables,
      diasFinDeSemana,
      diasFestivos,
    };
  }

  /**
   * Genera el resumen anual completo
   */
  async generarResumenAnual(año: number): Promise<ResumenAnual> {
    const config = await this.getConfiguracion(año);
    const meses: MesCalendario[] = [];
    
    for (let mes = 1; mes <= 12; mes++) {
      const mesCalendario = await this.generarMesCalendario(mes, año);
      meses.push(mesCalendario);
    }

    const totales = meses.reduce((acc, mes) => ({
      totalDias: acc.totalDias + mes.totalDias,
      totalDiasLaborables: acc.totalDiasLaborables + mes.diasLaborables,
      totalFinDeSemana: acc.totalFinDeSemana + mes.diasFinDeSemana,
      totalFestivos: acc.totalFestivos + mes.diasFestivos,
    }), {
      totalDias: 0,
      totalDiasLaborables: 0,
      totalFinDeSemana: 0,
      totalFestivos: 0,
    });

    const festivosNacionales = config.festivos.filter(f => f.tipo === 'nacional').length;
    const festivosAutonomicos = config.festivos.filter(f => f.tipo === 'autonomico').length;
    const festivosLocales = config.festivos.filter(f => f.tipo === 'local').length;

    return {
      año,
      ...totales,
      festivosNacionales,
      festivosAutonomicos,
      festivosLocales,
      meses,
    };
  }

  /**
   * Obtiene solo los días laborables de un mes
   */
  async getDiasLaborablesMes(mes: number, año: number): Promise<Date[]> {
    const mesCalendario = await this.generarMesCalendario(mes, año);
    return mesCalendario.dias
      .filter(dia => dia.esLaborable)
      .map(dia => dia.fecha);
  }

  /**
   * Verifica si una fecha específica es laborable
   */
  async esDiaLaborable(fecha: Date): Promise<boolean> {
    const año = getYear(fecha);
    const mes = getMonth(fecha) + 1;
    const mesCalendario = await this.generarMesCalendario(mes, año);
    
    const dia = mesCalendario.dias.find(d => 
      d.fecha.getDate() === fecha.getDate() &&
      d.fecha.getMonth() === fecha.getMonth() &&
      d.fecha.getFullYear() === fecha.getFullYear()
    );

    return dia?.esLaborable || false;
  }

  /**
   * Obtiene el siguiente día laborable a partir de una fecha
   */
  async getSiguienteDiaLaborable(fecha: Date): Promise<Date> {
    let siguienteFecha = addDays(fecha, 1);
    
    while (!(await this.esDiaLaborable(siguienteFecha))) {
      siguienteFecha = addDays(siguienteFecha, 1);
    }
    
    return siguienteFecha;
  }

  /**
   * Cuenta los días laborables entre dos fechas (inclusive)
   */
  async contarDiasLaborables(fechaInicio: Date, fechaFin: Date): Promise<number> {
    const dias = eachDayOfInterval({ start: fechaInicio, end: fechaFin });
    let count = 0;
    
    for (const dia of dias) {
      if (await this.esDiaLaborable(dia)) {
        count++;
      }
    }
    
    return count;
  }

  /**
   * Guarda la configuración del calendario
   */
  async saveConfiguracion(config: ConfiguracionCalendario): Promise<void> {
    const updatedConfig = {
      ...config,
      fechaModificacion: new Date(),
    };
    
    localStorage.setItem(`${this.STORAGE_KEY}_${config.año}`, JSON.stringify(updatedConfig));
  }

  /**
   * Añade un festivo personalizado
   */
  async addFestivoPersonalizado(año: number, festivo: Omit<Festivo, 'fijo'>): Promise<void> {
    const config = await this.getConfiguracion(año);
    
    config.festivos.push({
      ...festivo,
      fijo: false, // Los festivos personalizados no son fijos
    });
    
    // Ordenar por fecha
    config.festivos.sort((a, b) => a.fecha.getTime() - b.fecha.getTime());
    
    await this.saveConfiguracion(config);
  }

  /**
   * Elimina un festivo personalizado
   */
  async removeFestivo(año: number, fechaFestivo: Date): Promise<void> {
    const config = await this.getConfiguracion(año);
    
    config.festivos = config.festivos.filter(f => 
      f.fecha.getTime() !== fechaFestivo.getTime() || f.fijo // No eliminar festivos fijos
    );
    
    await this.saveConfiguracion(config);
  }

  /**
   * Actualiza los días laborables de la semana
   */
  async updateDiasLaborables(año: number, diasLaborablesSemana: number[]): Promise<void> {
    const config = await this.getConfiguracion(año);
    config.diasLaborablesSemana = diasLaborablesSemana;
    await this.saveConfiguracion(config);
  }

  /**
   * Exporta la configuración del calendario para backup
   */
  async exportarConfiguracion(año: number): Promise<string> {
    const config = await this.getConfiguracion(año);
    return JSON.stringify(config, null, 2);
  }

  /**
   * Importa una configuración desde backup
   */
  async importarConfiguracion(configJson: string): Promise<void> {
    const config = JSON.parse(configJson);
    config.fechaCreacion = new Date(config.fechaCreacion);
    config.fechaModificacion = new Date();
    config.festivos = config.festivos.map((f: any) => ({
      ...f,
      fecha: new Date(f.fecha),
    }));
    
    await this.saveConfiguracion(config);
  }
}

export const calendarioService = new CalendarioService();