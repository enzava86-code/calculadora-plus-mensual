import * as XLSX from 'xlsx';
import { PlanMensual } from '@/types/plan';
import { Empleado } from '@/types/empleado';
import { Proyecto } from '@/types/proyecto';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export class ExcelService {
  /**
   * Exporta planes mensuales masivos con una pestaña por empleado
   */
  async exportarPlanesMasivos(planes: PlanMensual[], mes: number, año: number): Promise<void> {
    if (planes.length === 0) {
      throw new Error('No hay planes para exportar');
    }

    const wb = XLSX.utils.book_new();

    // Crear hoja de resumen general primero
    this.crearHojaResumenGeneral(wb, planes, mes, año);

    // Crear una pestaña por empleado
    planes.forEach((plan, index) => {
      const nombrePestana = this.formatearNombrePestana(plan.empleado.nombre, plan.empleado.apellidos, index);
      this.crearHojaEmpleadoCompleta(wb, plan, nombrePestana);
    });

    // Generar nombre de archivo
    const nombreArchivo = `Planes_Masivos_${this.formatearFecha(mes, año)}.xlsx`;

    // Descargar archivo
    XLSX.writeFile(wb, nombreArchivo);
  }

  /**
   * Exporta un plan mensual individual de un empleado a Excel
   */
  async exportarPlanEmpleado(plan: PlanMensual): Promise<void> {
    const wb = XLSX.utils.book_new();

    // Crear hoja principal con el resumen
    this.crearHojaResumen(wb, plan);

    // Crear hoja con el detalle diario
    this.crearHojaDetalleDiario(wb, plan);

    // Crear hoja con los bloques
    this.crearHojaBloques(wb, plan);

    // Generar nombre de archivo
    const nombreArchivo = `Plan_${plan.empleado.nombre}_${plan.empleado.apellidos}_${this.formatearFecha(plan.mes, plan.año)}.xlsx`;

    // Descargar archivo
    XLSX.writeFile(wb, nombreArchivo);
  }

  /**
   * Crea hoja de resumen general para múltiples empleados
   */
  private crearHojaResumenGeneral(wb: XLSX.WorkBook, planes: PlanMensual[], mes: number, año: number): void {
    const data: any[][] = [
      ['RESUMEN GENERAL DE PLANES MENSUALES'],
      [''],
      ['Período', this.formatearFecha(mes, año)],
      ['Total Empleados', planes.length],
      ['Fecha de Generación', format(new Date(), 'dd/MM/yyyy HH:mm', { locale: es })],
      [''],
      ['RESUMEN POR EMPLEADO'],
      [''],
      ['Nombre', 'Apellidos', 'Ubicación', 'Objetivo €', 'Generado €', 'Diferencia €', 'Cumplido', 'Días Trabajados', 'Total KM', 'Total Dietas']
    ];

    // Agregar datos de cada empleado
    planes.forEach(plan => {
      data.push([
        plan.empleado.nombre,
        plan.empleado.apellidos,
        plan.empleado.ubicacion,
        plan.empleado.objetivoMensual,
        Number(plan.totalPlan.toFixed(2)),
        Number(plan.diferenciasObjetivo.toFixed(2)),
        plan.objetivoCumplido ? 'SÍ' : 'NO',
        plan.totalDiasConProyecto,
        plan.totalKm,
        plan.totalDietas
      ]);
    });

    // Agregar totales
    const totalObjetivos = planes.reduce((sum, p) => sum + p.empleado.objetivoMensual, 0);
    const totalGenerado = planes.reduce((sum, p) => sum + p.totalPlan, 0);
    const totalDiferencia = planes.reduce((sum, p) => sum + p.diferenciasObjetivo, 0);

    data.push(['']);
    data.push([
      'TOTALES',
      '',
      '',
      Number(totalObjetivos.toFixed(2)),
      Number(totalGenerado.toFixed(2)),
      Number(totalDiferencia.toFixed(2)),
      '',
      planes.reduce((sum, p) => sum + p.totalDiasConProyecto, 0),
      planes.reduce((sum, p) => sum + p.totalKm, 0),
      planes.reduce((sum, p) => sum + p.totalDietas, 0)
    ]);

    const ws = XLSX.utils.aoa_to_sheet(data);
    
    // Formatear columnas
    // const range = XLSX.utils.decode_range(ws['!ref'] || 'A1');
    ws['!cols'] = [
      { wch: 15 }, // Nombre
      { wch: 20 }, // Apellidos  
      { wch: 12 }, // Ubicación
      { wch: 12 }, // Objetivo
      { wch: 12 }, // Generado
      { wch: 12 }, // Diferencia
      { wch: 10 }, // Cumplido
      { wch: 12 }, // Días
      { wch: 10 }, // KM
      { wch: 12 }  // Dietas
    ];

    XLSX.utils.book_append_sheet(wb, ws, 'Resumen General');
  }

  /**
   * Crea una hoja completa para un empleado con toda su información
   */
  private crearHojaEmpleadoCompleta(wb: XLSX.WorkBook, plan: PlanMensual, nombrePestana: string): void {
    const data: any[][] = [
      [`PLAN MENSUAL - ${plan.empleado.nombre.toUpperCase()} ${plan.empleado.apellidos.toUpperCase()}`],
      [''],
      ['INFORMACIÓN GENERAL'],
      ['Empleado', `${plan.empleado.nombre} ${plan.empleado.apellidos}`],
      ['Ubicación', plan.empleado.ubicacion],
      ['Período', this.formatearFecha(plan.mes, plan.año)],
      ['Objetivo Mensual', `€${plan.empleado.objetivoMensual.toFixed(2)}`],
      ['Total Generado', `€${plan.totalPlan.toFixed(2)}`],
      ['Diferencia', `€${plan.diferenciasObjetivo.toFixed(2)}`],
      ['Objetivo Cumplido', plan.objetivoCumplido ? 'SÍ' : 'NO'],
      [''],
      ['DETALLE DIARIO'],
      [''],
      ['Fecha', 'Día Semana', 'Proyecto', 'Distancia KM', 'Importe KM €', 'Dieta', 'Importe Dieta €', 'Total Día €']
    ];

    // Agregar detalle de cada día
    plan.diasLaborables.forEach(dia => {
      const diaSemana = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'][dia.diaSemana];
      data.push([
        format(dia.fecha, 'dd/MM/yyyy', { locale: es }),
        diaSemana,
        dia.proyecto?.nombre || 'Sin proyecto',
        dia.distanciaKm || 0,
        Number((dia.importeKm || 0).toFixed(2)),
        dia.tieneDieta ? 'SÍ' : 'NO',
        Number((dia.importeDieta || 0).toFixed(2)),
        Number((dia.totalDia || 0).toFixed(2))
      ]);
    });

    // Agregar totales
    const totalKm = plan.diasLaborables.reduce((sum, dia) => sum + (dia.distanciaKm || 0), 0);
    const totalImporteKm = plan.diasLaborables.reduce((sum, dia) => sum + (dia.importeKm || 0), 0);
    const totalImporteDieta = plan.diasLaborables.reduce((sum, dia) => sum + (dia.importeDieta || 0), 0);

    data.push(['']);
    data.push([
      'TOTALES',
      '',
      '',
      totalKm,
      Number(totalImporteKm.toFixed(2)),
      '',
      Number(totalImporteDieta.toFixed(2)),
      Number(plan.totalPlan.toFixed(2))
    ]);

    const ws = XLSX.utils.aoa_to_sheet(data);
    
    // Formatear columnas
    ws['!cols'] = [
      { wch: 12 }, // Fecha
      { wch: 12 }, // Día Semana
      { wch: 25 }, // Proyecto
      { wch: 12 }, // Distancia
      { wch: 12 }, // Importe KM
      { wch: 8 },  // Dieta
      { wch: 15 }, // Importe Dieta
      { wch: 12 }  // Total Día
    ];

    XLSX.utils.book_append_sheet(wb, ws, nombrePestana);
  }

  /**
   * Formatea el nombre de la pestaña para Excel
   */
  private formatearNombrePestana(nombre: string, apellidos: string, index: number): string {
    // Excel tiene límite de 31 caracteres para nombres de pestañas
    const nombreCorto = `${nombre} ${apellidos.split(' ')[0]}`.substring(0, 25);
    return `${index + 1}. ${nombreCorto}`;
  }

  /**
   * Crea la hoja de resumen del plan
   */
  private crearHojaResumen(wb: XLSX.WorkBook, plan: PlanMensual): void {
    const data = [
      ['RESUMEN DEL PLAN MENSUAL'],
      [''],
      ['Empleado', `${plan.empleado.nombre} ${plan.empleado.apellidos}`],
      ['Ubicación', plan.empleado.ubicacion],
      ['Objetivo Mensual', `€${plan.empleado.objetivoMensual.toFixed(2)}`],
      ['Período', this.formatearFecha(plan.mes, plan.año)],
      ['Fecha de Generación', format(plan.fechaGeneracion, 'dd/MM/yyyy HH:mm', { locale: es })],
      ['Estado', plan.estado.toUpperCase()],
      [''],
      ['RESULTADOS'],
      ['Total Generado', `€${plan.totalPlan.toFixed(2)}`],
      ['Diferencia Objetivo', `€${plan.diferenciasObjetivo.toFixed(2)}`],
      ['Objetivo Cumplido', plan.objetivoCumplido ? 'SÍ' : 'NO'],
      [''],
      ['DESGLOSE'],
      ['Días Laborables Totales', plan.totalDiasLaborables],
      ['Días con Proyecto', plan.totalDiasConProyecto],
      ['Total Kilómetros', plan.totalKm],
      ['Importe Kilómetros', `€${plan.totalImporteKm.toFixed(2)}`],
      ['Total Dietas', plan.totalDietas],
      ['Importe Dietas', `€${plan.totalImporteDietas.toFixed(2)}`],
      ['Número de Bloques', plan.bloques.length],
      [''],
      ['NOTAS'],
      [plan.notas || 'Sin notas adicionales']
    ];

    const ws = XLSX.utils.aoa_to_sheet(data);

    // Styling (ancho de columnas)
    ws['!cols'] = [
      { width: 25 },
      { width: 20 }
    ];

    XLSX.utils.book_append_sheet(wb, ws, 'Resumen');
  }

  /**
   * Crea la hoja con el detalle día a día
   */
  private crearHojaDetalleDiario(wb: XLSX.WorkBook, plan: PlanMensual): void {
    const headers = [
      'Fecha',
      'Día Semana',
      'Proyecto',
      'Distancia (km)',
      'Importe KM (€)',
      'Tiene Dieta',
      'Importe Dieta (€)',
      'Total Día (€)',
      'Observaciones'
    ];

    const data = [headers];

    plan.diasLaborables.forEach(dia => {
      data.push([
        format(dia.fecha, 'dd/MM/yyyy', { locale: es }),
        format(dia.fecha, 'EEEE', { locale: es }),
        dia.proyecto?.nombre || 'Sin proyecto',
        '-',
        (dia.distanciaKm || 0).toString(),
        dia.importeKm?.toFixed(2) || '0.00',
        dia.tieneDieta ? 'SÍ' : 'NO',
        dia.importeDieta?.toFixed(2) || '0.00',
        dia.totalDia?.toFixed(2) || '0.00',
        dia.esFestivo ? 'Día festivo' : ''
      ]);
    });

    // Fila de totales
    data.push([
      'TOTAL',
      '',
      '',
      '',
      plan.totalKm.toString(),
      plan.totalImporteKm.toFixed(2),
      '',
      plan.totalImporteDietas.toFixed(2),
      plan.totalPlan.toFixed(2),
      ''
    ]);

    const ws = XLSX.utils.aoa_to_sheet(data);

    // Styling
    ws['!cols'] = [
      { width: 12 }, // Fecha
      { width: 12 }, // Día
      { width: 20 }, // Proyecto
      { width: 12 }, // KM
      { width: 12 }, // Importe KM
      { width: 10 }, // Dieta
      { width: 12 }, // Importe Dieta
      { width: 12 }, // Total
      { width: 15 }  // Observaciones
    ];

    XLSX.utils.book_append_sheet(wb, ws, 'Detalle Diario');
  }

  /**
   * Crea la hoja con el detalle de bloques
   */
  private crearHojaBloques(wb: XLSX.WorkBook, plan: PlanMensual): void {
    const headers = [
      'Bloque #',
      'Proyecto',
      'Fecha Inicio',
      'Fecha Fin',
      'Días Consecutivos',
      'KM por Día',
      'Total KM',
      'Importe KM (€)',
      'Dietas',
      'Importe Dietas (€)',
      'Total Bloque (€)',
      '% del Total'
    ];

    const data = [headers];

    plan.bloques.forEach((bloque, index) => {
      const porcentaje = (bloque.totalBloque / plan.totalPlan * 100).toFixed(1);
      
      data.push([
        (index + 1).toString(),
        bloque.proyecto.nombre,
        '',
        format(bloque.fechaInicio, 'dd/MM/yyyy', { locale: es }),
        format(bloque.fechaFin, 'dd/MM/yyyy', { locale: es }),
        bloque.totalDias.toString(),
        bloque.proyecto.distanciaKm.toString(),
        bloque.totalKm.toString(),
        bloque.totalImporteKm.toFixed(2),
        bloque.totalDietas.toString(),
        bloque.totalImporteDietas.toFixed(2),
        bloque.totalBloque.toFixed(2),
        `${porcentaje}%`
      ]);
    });

    // Fila de totales
    data.push([
      'TOTAL',
      '',
      '',
      '',
      '',
      plan.totalDiasConProyecto.toString(),
      '',
      plan.totalKm.toString(),
      plan.totalImporteKm.toFixed(2),
      plan.totalDietas.toString(),
      plan.totalImporteDietas.toFixed(2),
      plan.totalPlan.toFixed(2),
      '100.0%'
    ]);

    const ws = XLSX.utils.aoa_to_sheet(data);

    // Styling
    ws['!cols'] = [
      { width: 8 },  // Bloque #
      { width: 20 }, // Proyecto
      { width: 12 }, // Fecha Inicio
      { width: 12 }, // Fecha Fin
      { width: 10 }, // Días
      { width: 10 }, // KM/día
      { width: 10 }, // Total KM
      { width: 12 }, // Importe KM
      { width: 8 },  // Dietas
      { width: 12 }, // Importe Dietas
      { width: 12 }, // Total Bloque
      { width: 8 }   // %
    ];

    XLSX.utils.book_append_sheet(wb, ws, 'Bloques');
  }

  /**
   * Exporta lista de empleados a Excel
   */
  async exportarEmpleados(empleados: Empleado[]): Promise<void> {
    const headers = [
      'ID',
      'Nombre',
      'Apellidos',
      'Nombre Completo',
      'Ubicación',
      'Objetivo Mensual (€)',
      'Estado',
      'Fecha Creación',
      'Fecha Modificación'
    ];

    const data = [headers];

    empleados.forEach(empleado => {
      data.push([
        empleado.id,
        empleado.nombre,
        empleado.apellidos,
        `${empleado.nombre} ${empleado.apellidos}`,
        empleado.ubicacion,
        empleado.objetivoMensual.toString(),
        empleado.estado,
        format(empleado.fechaCreacion, 'dd/MM/yyyy HH:mm', { locale: es }),
        format(empleado.fechaModificacion, 'dd/MM/yyyy HH:mm', { locale: es })
      ]);
    });

    const ws = XLSX.utils.aoa_to_sheet(data);
    
    // Styling
    ws['!cols'] = [
      { width: 25 }, // ID
      { width: 15 }, // Nombre
      { width: 20 }, // Apellidos
      { width: 25 }, // Nombre Completo
      { width: 12 }, // Ubicación
      { width: 15 }, // Objetivo
      { width: 10 }, // Estado
      { width: 18 }, // Fecha Creación
      { width: 18 }  // Fecha Modificación
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Empleados');

    const nombreArchivo = `Empleados_${format(new Date(), 'yyyy-MM-dd_HH-mm')}.xlsx`;
    XLSX.writeFile(wb, nombreArchivo);
  }

  /**
   * Exporta lista de proyectos a Excel
   */
  async exportarProyectos(proyectos: Proyecto[]): Promise<void> {
    const headers = [
      'ID',
      'Nombre Proyecto',
      'Ubicación',
      'Distancia (km)',
      'Requiere Dieta',
      'Descripción',
      'Estado',
      'Fecha Creación',
      'Fecha Modificación'
    ];

    const data = [headers];

    proyectos.forEach(proyecto => {
      data.push([
        proyecto.id,
        proyecto.nombre,
        proyecto.ubicacion,
        proyecto.distanciaKm.toString(),
        proyecto.requiereDieta ? 'SÍ' : 'NO',
      ]);
    });

    const ws = XLSX.utils.aoa_to_sheet(data);
    
    // Styling
    ws['!cols'] = [
      { width: 25 }, // ID
      { width: 25 }, // Nombre
      { width: 12 }, // Ubicación
      { width: 12 }, // Distancia
      { width: 12 }, // Dieta
      { width: 30 }, // Descripción
      { width: 10 }, // Estado
      { width: 18 }, // Fecha Creación
      { width: 18 }  // Fecha Modificación
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Proyectos');

    const nombreArchivo = `Proyectos_${format(new Date(), 'yyyy-MM-dd_HH-mm')}.xlsx`;
    XLSX.writeFile(wb, nombreArchivo);
  }

  /**
   * Importa empleados desde Excel
   */
  async importarEmpleados(file: File): Promise<{ empleados: Partial<Empleado>[], errores: string[] }> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          console.log('Iniciando importación de empleados...');
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const wb = XLSX.read(data, { type: 'array' });
          console.log('Archivo Excel leído, hojas disponibles:', wb.SheetNames);
          const ws = wb.Sheets[wb.SheetNames[0]];
          const jsonData = XLSX.utils.sheet_to_json(ws, { header: 1 });
          console.log('Datos extraídos del Excel:', jsonData);

          const empleados: Partial<Empleado>[] = [];
          const errores: string[] = [];

          // Saltar encabezados (primera fila)
          for (let i = 1; i < jsonData.length; i++) {
            const row = jsonData[i] as any[];
            console.log(`Procesando fila ${i + 1}:`, row);
            
            try {
              const empleado: Partial<Empleado> = {
                nombre: row[0]?.toString().trim(),
                apellidos: row[1]?.toString().trim(),
                ubicacion: row[2]?.toString().trim() as 'Peninsula' | 'Mallorca',
                objetivoMensual: Number(row[3]) || 200,
                estado: 'activo' as 'activo' | 'inactivo' // Por defecto activo
              };
              
              console.log(`Empleado extraído:`, empleado);

              // Validaciones básicas
              if (!empleado.nombre || !empleado.apellidos) {
                errores.push(`Fila ${i + 1}: Nombre y apellidos son obligatorios`);
                continue;
              }

              if (!['Peninsula', 'Mallorca'].includes(empleado.ubicacion || '')) {
                errores.push(`Fila ${i + 1}: Ubicación debe ser 'Peninsula' o 'Mallorca'`);
                continue;
              }

              if (!empleado.objetivoMensual || empleado.objetivoMensual < 50 || empleado.objetivoMensual > 1500) {
                errores.push(`Fila ${i + 1}: Objetivo mensual debe estar entre 50€ y 1500€`);
                continue;
              }

              empleados.push(empleado);
            } catch (error) {
              errores.push(`Fila ${i + 1}: Error procesando datos`);
            }
          }

          resolve({ empleados, errores });
        } catch (error) {
          reject(error);
        }
      };

      reader.readAsArrayBuffer(file);
    });
  }

  /**
   * Importa proyectos desde Excel
   */
  async importarProyectos(file: File): Promise<{ proyectos: Partial<Proyecto>[], errores: string[] }> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          console.log('Iniciando importación de proyectos...');
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const wb = XLSX.read(data, { type: 'array' });
          console.log('Archivo Excel leído, hojas disponibles:', wb.SheetNames);
          const ws = wb.Sheets[wb.SheetNames[0]];
          const jsonData = XLSX.utils.sheet_to_json(ws, { header: 1 });
          console.log('Datos extraídos del Excel:', jsonData);

          const proyectos: Partial<Proyecto>[] = [];
          const errores: string[] = [];

          // Saltar encabezados (primera fila)
          for (let i = 1; i < jsonData.length; i++) {
            const row = jsonData[i] as any[];
            console.log(`Procesando fila ${i + 1}:`, row);
            
            try {
              const requiereDietaTexto = row[3]?.toString().trim().toLowerCase();
              const requiereDieta = requiereDietaTexto === 'si' || requiereDietaTexto === 'sí' || requiereDietaTexto === 'yes' || requiereDietaTexto === 'true';
              
              const proyecto: Partial<Proyecto> = {
                nombre: row[0]?.toString().trim(),
                ubicacion: row[1]?.toString().trim() as 'Peninsula' | 'Mallorca',
                distanciaKm: Number(row[2]) || 25,
                requiereDieta,
              };
              
              console.log(`Proyecto extraído:`, proyecto);

              // Validaciones básicas
              if (!proyecto.nombre) {
                errores.push(`Fila ${i + 1}: Nombre del proyecto es obligatorio`);
                continue;
              }

              if (!['Peninsula', 'Mallorca'].includes(proyecto.ubicacion || '')) {
                errores.push(`Fila ${i + 1}: Ubicación debe ser 'Peninsula' o 'Mallorca'`);
                continue;
              }

              if (!proyecto.distanciaKm || proyecto.distanciaKm < 1 || proyecto.distanciaKm > 200) {
                errores.push(`Fila ${i + 1}: Distancia debe estar entre 1km y 200km`);
                continue;
              }

              proyectos.push(proyecto);
            } catch (error) {
              errores.push(`Fila ${i + 1}: Error procesando datos`);
            }
          }

          resolve({ proyectos, errores });
        } catch (error) {
          reject(error);
        }
      };

      reader.readAsArrayBuffer(file);
    });
  }

  /**
   * Formatea fecha para nombres de archivo
   */
  private formatearFecha(mes: number, año: number): string {
    const meses = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    return `${meses[mes - 1]}_${año}`;
  }

  /**
   * Genera template de empleados para importación
   */
  async generarTemplateEmpleados(): Promise<void> {
    const headers = [
      'Nombre',
      'Apellidos',
      'Ubicación (Peninsula/Mallorca)',
      'Objetivo Mensual (€)'
    ];

    const ejemplos = [
      ['Juan', 'García López', 'Peninsula', 200],
      ['María', 'Rodríguez Pérez', 'Mallorca', 180],
      ['Pedro', 'Martínez Sánchez', 'Peninsula', 220],
      ['Ana', 'Fernández Ruiz', 'Mallorca', 190],
      ['Carlos', 'López Torres', 'Peninsula', 210]
    ];

    const data = [headers, ...ejemplos];
    const ws = XLSX.utils.aoa_to_sheet(data);
    
    // Styling
    ws['!cols'] = [
      { width: 15 }, // Nombre
      { width: 20 }, // Apellidos
      { width: 20 }, // Ubicación
      { width: 18 }  // Objetivo
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Template Empleados');

    XLSX.writeFile(wb, 'Template_Empleados.xlsx');
  }

  /**
   * Genera template de proyectos para importación
   */
  async generarTemplateProyectos(): Promise<void> {
    const headers = [
      'Nombre Proyecto',
      'Ubicación (Peninsula/Mallorca)',
      'Distancia (km)',
      'Requiere Dieta (SI/NO)'
    ];

    const ejemplos = [
      ['Hotel Barcelona Centro', 'Peninsula', 45, 'SI'],
      ['Oficinas Madrid Norte', 'Peninsula', 25, 'NO'],
      ['Resort Cala Millor', 'Mallorca', 55, 'SI'],
      ['Centro Comercial Valencia', 'Peninsula', 35, 'SI'],
      ['Hotel Playa Palma', 'Mallorca', 20, 'NO']
    ];

    const data = [headers, ...ejemplos];
    const ws = XLSX.utils.aoa_to_sheet(data);
    
    // Styling
    ws['!cols'] = [
      { width: 25 }, // Nombre Proyecto
      { width: 20 }, // Ubicación
      { width: 15 }, // Distancia
      { width: 18 }  // Requiere Dieta
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Template Proyectos');

    XLSX.writeFile(wb, 'Template_Proyectos.xlsx');
  }
}

export const excelService = new ExcelService();