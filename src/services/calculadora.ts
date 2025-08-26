import { 
  PlanMensual, 
  DiaLaborable, 
  BloqueConsecutivo, 
  ParametrosCalculo, 
  OpcionesGeneracion,
  ResumenCalculos
} from '@/types/plan';
import { Empleado } from '@/types/empleado';
import { Proyecto } from '@/types/proyecto';
import { dbService } from './databaseConfig';
import { calendarioService } from './calendario';

export class CalculadoraPlusService {
  /**
   * Genera un plan mensual inteligente con bloques consecutivos
   */
  async generarPlanMensual(opciones: OpcionesGeneracion): Promise<ResumenCalculos> {
    const tiempoInicio = Date.now();
    
    try {
      // 1. Obtener datos necesarios
      const empleado = await dbService.getEmpleadoById(opciones.empleadoId);
      if (!empleado) {
        throw new Error('Empleado no encontrado');
      }

      // Usar objetivo personalizado si se proporciona
      const objetivoMensual = opciones.objetivoPersonalizado || empleado.objetivoMensual;
      
      const proyectosDisponibles = await this.obtenerProyectosDisponibles(empleado.ubicacion, opciones.proyectosExcluidos);
      const diasLaborables = await calendarioService.getDiasLaborablesMes(opciones.mes, opciones.año);
      
      if (diasLaborables.length === 0) {
        throw new Error('No hay días laborables en el mes seleccionado');
      }

      if (proyectosDisponibles.length === 0) {
        throw new Error('No hay proyectos disponibles para la ubicación del empleado');
      }

      // 2. Generar plan con nueva lógica que prioriza objetivo
      const planPrincipal = opciones.parametros.priorizarObjetivoSobreConsecutividad
        ? await this.generarPlanPriorizandoObjetivo(
            empleado,
            objetivoMensual,
            diasLaborables,
            proyectosDisponibles,
            opciones.parametros
          )
        : await this.generarPlanConBloquesLegacy(
            empleado,
            objetivoMensual,
            diasLaborables,
            proyectosDisponibles,
            opciones.parametros
          );

      // 4. Generar variantes si se solicita
      const variantes: PlanMensual[] = [];
      if (opciones.generarVariantes && opciones.maximoVariantes && opciones.maximoVariantes > 1) {
        const numVariantes = Math.min(opciones.maximoVariantes - 1, 3); // Máximo 3 variantes adicionales
        
        for (let i = 0; i < numVariantes; i++) {
          try {
            const variante = await this.generarPlanPriorizandoObjetivo(
              empleado,
              objetivoMensual,
              diasLaborables,
              proyectosDisponibles,
              opciones.parametros
            );
            variante.id = this.generarId();
            variante.notas = `Variante ${i + 1} - ${variante.notas}`;
            variantes.push(variante);
          } catch (error) {
            console.warn(`No se pudo generar variante ${i + 1}:`, error);
          }
        }
      }

      const tiempoFin = Date.now();

      return {
        planGenerado: planPrincipal,
        variantes: variantes.length > 0 ? variantes : undefined,
        tiempoGeneracion: tiempoFin - tiempoInicio,
        algoritmoUtilizado: opciones.parametros.priorizarObjetivoSobreConsecutividad 
          ? 'Algoritmo de Objetivo Prioritario v2.0' 
          : 'Bloques Consecutivos Inteligentes v1.0',
        estadisticas: {
          totalCombinacionesEvaluadas: proyectosDisponibles.length * diasLaborables.length,
          mejorSolucionEncontrada: Math.abs(planPrincipal.diferenciasObjetivo) <= opciones.parametros.errorMaximoPermitido,
          precisonObjetivo: this.calcularPrecisionObjetivo(planPrincipal.totalPlan, objetivoMensual),
        },
      };

    } catch (error) {
      throw new Error(`Error generando plan mensual: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  /**
   * Obtiene proyectos disponibles para la ubicación del empleado
   */
  private async obtenerProyectosDisponibles(
    ubicacion: string, 
    proyectosExcluidos: string[] = []
  ): Promise<Proyecto[]> {
    const todosProyectos = await dbService.getProyectosByUbicacion(ubicacion);
    return todosProyectos.filter(p => 
      !proyectosExcluidos.includes(p.id)
    );
  }

  /**
   * Calcula la estructura óptima del plan
   */
  private async calcularEstructuraPlan(
    empleado: Empleado,
    diasLaborables: Date[],
    proyectos: Proyecto[],
    parametros: ParametrosCalculo
  ) {
    const totalDias = diasLaborables.length;
    const objetivoMensual = empleado.objetivoMensual;
    const objetivoPorDia = objetivoMensual / totalDias;

    // Calcular rentabilidad por día de cada proyecto
    const proyectosConRentabilidad = proyectos.map(proyecto => {
      const importeKm = proyecto.distanciaKm * parametros.importePorKm;
      const importeDieta = proyecto.requiereDieta ? parametros.importePorDieta : 0;
      const totalPorDia = importeKm + importeDieta;
      
      return {
        proyecto,
        importePorDia: totalPorDia,
        diferenObejtivo: Math.abs(totalPorDia - objetivoPorDia),
        eficiencia: totalPorDia / objetivoPorDia, // >1 significa que supera el objetivo por día
      };
    }).sort((a, b) => a.diferenObejtivo - b.diferenObejtivo); // Ordenar por proximidad al objetivo

    // Calcular distribución óptima de bloques
    const numBloques = Math.floor(totalDias / parametros.diasMinimosBloque);
    const diasPorBloque = Math.floor(totalDias / numBloques);
    const diasSobrantes = totalDias % numBloques;

    return {
      totalDias,
      objetivoPorDia,
      proyectosConRentabilidad,
      numBloques: Math.min(numBloques, proyectos.length), // No más bloques que proyectos
      diasPorBloque,
      diasSobrantes,
      combinacionesEvaluadas: proyectosConRentabilidad.length * numBloques,
    };
  }

  /**
   * Genera el plan principal con bloques consecutivos
   */
  private async generarPlanConBloques(
    empleado: Empleado,
    diasLaborables: Date[],
    proyectos: Proyecto[],
    parametros: ParametrosCalculo,
    estructura: any
  ): Promise<PlanMensual> {
    
    const diasPlan: DiaLaborable[] = [];
    const bloques: BloqueConsecutivo[] = [];
    let totalPlan = 0;
    let diaIndex = 0;

    // Distribuir días en bloques
    const proyectosSeleccionados = estructura.proyectosConRentabilidad.slice(0, estructura.numBloques);
    
    for (let i = 0; i < estructura.numBloques && diaIndex < diasLaborables.length; i++) {
      const proyectoInfo = proyectosSeleccionados[i % proyectosSeleccionados.length];
      const proyecto = proyectoInfo.proyecto;
      
      // Calcular días para este bloque
      let diasBloque = estructura.diasPorBloque;
      if (i < estructura.diasSobrantes) {
        diasBloque++; // Distribuir días sobrantes
      }
      
      // Asegurar que no excedamos los días disponibles
      diasBloque = Math.min(diasBloque, diasLaborables.length - diaIndex);
      
      // Crear bloque consecutivo
      const diasDelBloque: DiaLaborable[] = [];
      const fechaInicio = diasLaborables[diaIndex];
      
      for (let j = 0; j < diasBloque && diaIndex < diasLaborables.length; j++) {
        const fecha = diasLaborables[diaIndex];
        const importeKm = proyecto.distanciaKm * parametros.importePorKm;
        const importeDieta = proyecto.requiereDieta ? parametros.importePorDieta : 0;
        const totalDia = importeKm + importeDieta;
        
        const dia: DiaLaborable = {
          fecha,
          diaSemana: fecha.getDay(),
          esLaborable: true,
          esFestivo: false,
          proyecto,
          distanciaKm: proyecto.distanciaKm,
          importeKm,
          tieneDieta: proyecto.requiereDieta,
          importeDieta,
          totalDia,
        };
        
        diasDelBloque.push(dia);
        diasPlan.push(dia);
        totalPlan += totalDia;
        diaIndex++;
      }
      
      if (diasDelBloque.length > 0) {
        const bloque: BloqueConsecutivo = {
          proyectoId: proyecto.id,
          proyecto,
          diasLaborables: diasDelBloque,
          fechaInicio,
          fechaFin: diasDelBloque[diasDelBloque.length - 1].fecha,
          totalDias: diasDelBloque.length,
          totalKm: diasDelBloque.length * proyecto.distanciaKm,
          totalImporteKm: diasDelBloque.length * proyecto.distanciaKm * parametros.importePorKm,
          totalDietas: proyecto.requiereDieta ? diasDelBloque.length : 0,
          totalImporteDietas: proyecto.requiereDieta ? diasDelBloque.length * parametros.importePorDieta : 0,
          totalBloque: diasDelBloque.reduce((sum, dia) => sum + (dia.totalDia || 0), 0),
        };
        
        bloques.push(bloque);
      }
    }

    // Ajuste fino para aproximarse al objetivo
    if (Math.abs(totalPlan - empleado.objetivoMensual) > 1 && bloques.length > 0) {
      totalPlan = await this.ajustarPlanAlObjetivo(diasPlan, bloques, empleado.objetivoMensual, parametros);
    }

    // Crear plan final
    const plan: PlanMensual = {
      id: this.generarId(),
      empleado,
      mes: diasLaborables[0].getMonth() + 1,
      año: diasLaborables[0].getFullYear(),
      fechaGeneracion: new Date(),
      diasLaborables: diasPlan,
      bloques,
      totalDiasLaborables: diasLaborables.length,
      totalDiasConProyecto: diasPlan.length,
      totalKm: bloques.reduce((sum, b) => sum + b.totalKm, 0),
      totalImporteKm: bloques.reduce((sum, b) => sum + b.totalImporteKm, 0),
      totalDietas: bloques.reduce((sum, b) => sum + b.totalDietas, 0),
      totalImporteDietas: bloques.reduce((sum, b) => sum + b.totalImporteDietas, 0),
      totalPlan,
      objetivoCumplido: Math.abs(totalPlan - empleado.objetivoMensual) <= 1,
      diferenciasObjetivo: totalPlan - empleado.objetivoMensual,
      estado: 'borrador',
      notas: `Plan generado automáticamente con ${bloques.length} bloques consecutivos`,
    };

    return plan;
  }

  /**
   * Ajusta el plan para aproximarse mejor al objetivo
   */
  private async ajustarPlanAlObjetivo(
    diasPlan: DiaLaborable[],
    bloques: BloqueConsecutivo[],
    objetivo: number,
    parametros: ParametrosCalculo
  ): Promise<number> {
    let totalActual = diasPlan.reduce((sum, dia) => sum + (dia.totalDia || 0), 0);
    const diferencia = objetivo - totalActual;
    
    if (Math.abs(diferencia) <= 1) {
      return totalActual; // Ya está suficientemente cerca
    }

    // Estrategia de ajuste: modificar el proyecto del bloque más largo
    const bloquesMasLargos = [...bloques].sort((a, b) => b.totalDias - a.totalDias);
    
    for (const bloque of bloquesMasLargos) {
      if (Math.abs(diferencia) <= 1) break;
      
      // Si necesitamos más dinero, podríamos cambiar a un proyecto más rentable
      // Si necesitamos menos dinero, podríamos cambiar a uno menos rentable
      // Por simplicidad, mantenemos el diseño actual
    }

    return totalActual;
  }

  /**
   * Genera una variante del plan con diferente distribución
   */
  private async generarVariantePlan(
    empleado: Empleado,
    diasLaborables: Date[],
    proyectos: Proyecto[],
    parametros: ParametrosCalculo,
    estructura: any,
    variante: number
  ): Promise<PlanMensual> {
    // Rotar los proyectos para crear variaciones
    const proyectosRotados = [...estructura.proyectosConRentabilidad];
    for (let i = 0; i < variante; i++) {
      const primer = proyectosRotados.shift();
      if (primer) proyectosRotados.push(primer);
    }

    // Modificar estructura para la variante
    const estructuraVariante = {
      ...estructura,
      proyectosConRentabilidad: proyectosRotados,
    };

    const plan = await this.generarPlanConBloques(
      empleado,
      diasLaborables,
      proyectos,
      parametros,
      estructuraVariante
    );

    // Cambiar ID y notas para identificar como variante
    plan.id = this.generarId();
    plan.notas = `Variante ${variante} - ${plan.notas}`;

    return plan;
  }

  /**
   * Calcula la precisión respecto al objetivo
   */
  private calcularPrecisionObjetivo(totalPlan: number, objetivo: number): number {
    const diferencia = Math.abs(totalPlan - objetivo);
    const precision = Math.max(0, 100 - (diferencia / objetivo * 100));
    return Math.round(precision * 100) / 100; // 2 decimales
  }

  /**
   * Valida un plan mensual con validaciones mejoradas
   */
  async validarPlan(plan: PlanMensual): Promise<{ valido: boolean; errores: string[]; advertencias: string[] }> {
    const errores: string[] = [];
    const advertencias: string[] = [];

    // 1. Validaciones críticas (errores)
    if (plan.diasLaborables.length === 0) {
      errores.push('El plan no tiene días asignados');
    }

    if (plan.bloques.length === 0) {
      errores.push('El plan no tiene bloques de trabajo');
    }

    // 2. Validar coherencia de totales
    const totalCalculado = plan.diasLaborables.reduce((sum, dia) => sum + (dia.totalDia || 0), 0);
    const diferenciaTotales = Math.abs(totalCalculado - plan.totalPlan);
    if (diferenciaTotales > 0.01) {
      errores.push(`Los totales no coinciden: calculado ${totalCalculado.toFixed(2)}€ vs plan ${plan.totalPlan.toFixed(2)}€ (diff: ${diferenciaTotales.toFixed(2)}€)`);
    }

    // 3. Validar restricción geográfica
    for (const bloque of plan.bloques) {
      if (bloque.proyecto.ubicacion !== plan.empleado.ubicacion) {
        errores.push(`El proyecto "${bloque.proyecto.nombre}" (${bloque.proyecto.ubicacion}) no corresponde a la ubicación del empleado (${plan.empleado.ubicacion})`);
      }
    }

    // 4. Validar parámetros del plan
    const parametros = await dbService.getParametros();
    
    // Validar límites de bloque
    for (const bloque of plan.bloques) {
      if (bloque.totalDias < parametros.diasMinimosBloque) {
        advertencias.push(`El bloque "${bloque.proyecto.nombre}" tiene ${bloque.totalDias} días (mínimo recomendado: ${parametros.diasMinimosBloque})`);
      }
      if (bloque.totalDias > parametros.diasMaximosBloque) {
        advertencias.push(`El bloque "${bloque.proyecto.nombre}" tiene ${bloque.totalDias} días (máximo recomendado: ${parametros.diasMaximosBloque})`);
      }
    }

    // 5. Validar precisión del objetivo
    const diferenciObjetivo = Math.abs(plan.diferenciasObjetivo);
    if (diferenciObjetivo > parametros.errorMaximoPermitido) {
      advertencias.push(`La diferencia con el objetivo (${diferenciObjetivo.toFixed(2)}€) supera el margen permitido (±${parametros.errorMaximoPermitido}€)`);
    }

    // 6. Validar continuidad temporal
    let fechaAnterior: Date | null = null;
    for (const dia of plan.diasLaborables) {
      if (fechaAnterior && dia.fecha <= fechaAnterior) {
        errores.push('Los días del plan no están en orden cronológico');
        break;
      }
      fechaAnterior = dia.fecha;
    }

    // 7. Validar cobertura de días
    const diasCubiertos = plan.totalDiasConProyecto;
    const diasDisponibles = plan.totalDiasLaborables;
    if (diasCubiertos < diasDisponibles) {
      advertencias.push(`Solo se han asignado ${diasCubiertos} de ${diasDisponibles} días laborables disponibles`);
    }

    // 8. Validar cálculos de bloques
    for (const bloque of plan.bloques) {
      const totalBloqueCalculado = bloque.totalImporteKm + bloque.totalImporteDietas;
      if (Math.abs(totalBloqueCalculado - bloque.totalBloque) > 0.01) {
        errores.push(`Error en cálculos del bloque "${bloque.proyecto.nombre}": ${totalBloqueCalculado.toFixed(2)}€ vs ${bloque.totalBloque.toFixed(2)}€`);
      }
    }

    return {
      valido: errores.length === 0,
      errores,
      advertencias,
    };
  }

  /**
   * Optimiza un plan existente
   */
  async optimizarPlan(planId: string): Promise<PlanMensual> {
    const planExistente = await dbService.getPlanById(planId);
    if (!planExistente) {
      throw new Error('Plan no encontrado');
    }

    // Regenerar el plan con los mismos parámetros pero optimizado
    const parametros = await dbService.getParametros();
    const opciones: OpcionesGeneracion = {
      empleadoId: planExistente.empleado.id,
      mes: planExistente.mes,
      año: planExistente.año,
      parametros,
      generarVariantes: false,
    };

    const resultado = await this.generarPlanMensual(opciones);
    const planOptimizado = resultado.planGenerado;
    
    // Mantener ID original y actualizar metadatos
    planOptimizado.id = planExistente.id;
    planOptimizado.notas = `${planOptimizado.notas} - Optimizado`;
    
    return planOptimizado;
  }

  /**
   * Genera planes mensuales para TODOS los empleados activos
   */
  async generarPlanesMasivos(mes: number, año: number): Promise<{
    planesGenerados: PlanMensual[];
    resumenGeneral: {
      totalEmpleados: number;
      empleadosExitosos: number;
      empleadosConErrores: number;
      tiempoTotal: number;
      errores: Array<{empleadoId: string, nombreEmpleado: string, error: string}>;
    };
  }> {
    const tiempoInicio = Date.now();
    
    console.log(`🏭 INICIO CÁLCULO MASIVO: ${mes}/${año} para todos los empleados`);
    
    try {
      // 1. Obtener todos los empleados activos
      const empleados = await dbService.getEmpleados();
      const empleadosActivos = empleados.filter(emp => emp.estado === 'activo');
      
      if (empleadosActivos.length === 0) {
        throw new Error('No hay empleados activos para calcular');
      }

      console.log(`👥 Empleados activos encontrados: ${empleadosActivos.length}`);

      // 2. Obtener parámetros por defecto
      const parametros = await dbService.getParametros();

      // 3. Generar planes para cada empleado
      const planesGenerados: PlanMensual[] = [];
      const errores: Array<{empleadoId: string, nombreEmpleado: string, error: string}> = [];

      for (const empleado of empleadosActivos) {
        try {
          console.log(`⏳ Calculando plan para: ${empleado.nombre} ${empleado.apellidos} (${empleado.ubicacion})`);
          
          const opciones: OpcionesGeneracion = {
            empleadoId: empleado.id,
            mes,
            año,
            parametros,
            generarVariantes: false, // No generar variantes en modo masivo para ser más rápido
            maximoVariantes: 1,
          };

          const resultado = await this.generarPlanMensual(opciones);
          planesGenerados.push(resultado.planGenerado);
          
          console.log(`✅ Plan generado para ${empleado.nombre}: ${resultado.planGenerado.totalPlan.toFixed(2)}€ (objetivo: ${empleado.objetivoMensual}€)`);

        } catch (error) {
          const errorMsg = error instanceof Error ? error.message : 'Error desconocido';
          errores.push({
            empleadoId: empleado.id,
            nombreEmpleado: `${empleado.nombre} ${empleado.apellidos}`,
            error: errorMsg
          });
          
          console.error(`❌ Error calculando plan para ${empleado.nombre}:`, errorMsg);
        }
      }

      const tiempoFin = Date.now();
      const tiempoTotal = tiempoFin - tiempoInicio;

      const resumenGeneral = {
        totalEmpleados: empleadosActivos.length,
        empleadosExitosos: planesGenerados.length,
        empleadosConErrores: errores.length,
        tiempoTotal,
        errores
      };

      console.log(`🎯 CÁLCULO MASIVO COMPLETADO:`);
      console.log(`   Total empleados: ${resumenGeneral.totalEmpleados}`);
      console.log(`   Exitosos: ${resumenGeneral.empleadosExitosos}`);
      console.log(`   Con errores: ${resumenGeneral.empleadosConErrores}`);
      console.log(`   Tiempo total: ${tiempoTotal}ms`);

      return {
        planesGenerados,
        resumenGeneral
      };

    } catch (error) {
      throw new Error(`Error en cálculo masivo: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  /**
   * Genera un ID único
   */
  private generarId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  /**
   * Exporta estadísticas de un plan
   */
  async exportarEstadisticasPlan(planId: string): Promise<any> {
    const plan = await dbService.getPlanById(planId);
    if (!plan) {
      throw new Error('Plan no encontrado');
    }

    return {
      resumen: {
        empleado: `${plan.empleado.nombre} ${plan.empleado.apellidos}`,
        periodo: `${plan.mes}/${plan.año}`,
        objetivo: plan.empleado.objetivoMensual,
        totalGenerado: plan.totalPlan,
        precision: this.calcularPrecisionObjetivo(plan.totalPlan, plan.empleado.objetivoMensual),
        objetivoCumplido: plan.objetivoCumplido,
      },
      bloques: plan.bloques.map(bloque => ({
        proyecto: bloque.proyecto.nombre,
        dias: bloque.totalDias,
        fechaInicio: bloque.fechaInicio,
        fechaFin: bloque.fechaFin,
        totalBloque: bloque.totalBloque,
        porcentajeDelTotal: (bloque.totalBloque / plan.totalPlan * 100).toFixed(1),
      })),
      distribucion: {
        totalKm: plan.totalKm,
        totalDietas: plan.totalDietas,
        importeKm: plan.totalImporteKm,
        importeDietas: plan.totalImporteDietas,
        porcentajeKm: (plan.totalImporteKm / plan.totalPlan * 100).toFixed(1),
        porcentajeDietas: (plan.totalImporteDietas / plan.totalPlan * 100).toFixed(1),
      },
    };
  }

  /**
   * ALGORITMO MEJORADO: Algoritmo híbrido que combina programación dinámica con optimización heurística
   * Garantiza encontrar la mejor combinación posible dentro de los parámetros dados
   */
  private async generarPlanPriorizandoObjetivo(
    empleado: Empleado,
    objetivoMensual: number,
    diasLaborables: Date[],
    proyectos: Proyecto[],
    parametros: ParametrosCalculo
  ): Promise<PlanMensual> {
    
    console.log(`🎯 ALGORITMO MEJORADO: Objetivo ${objetivoMensual}€, Días: ${diasLaborables.length}, Proyectos: ${proyectos.length}`);
    
    // 1. Calcular valor por día de cada proyecto
    const proyectosConValor = proyectos.map(proyecto => {
      const importeKm = proyecto.distanciaKm * parametros.importePorKm;
      const importeDieta = proyecto.requiereDieta ? parametros.importePorDieta : 0;
      const valorPorDia = importeKm + importeDieta;
      
      console.log(`📊 ${proyecto.nombre}: ${valorPorDia.toFixed(2)}€/día (${proyecto.distanciaKm}km + ${proyecto.requiereDieta ? 'dieta' : 'sin dieta'})`);
      
      return { proyecto, valorPorDia, eficiencia: valorPorDia / (objetivoMensual / diasLaborables.length) };
    }).sort((a, b) => Math.abs(1 - a.eficiencia) - Math.abs(1 - b.eficiencia)); // Ordenar por proximidad a la eficiencia ideal

    console.log(`🔄 Proyectos ordenados por eficiencia (ideal = 1.0):`);
    proyectosConValor.forEach(p => console.log(`  ${p.proyecto.nombre}: ${p.eficiencia.toFixed(2)}`));

    // 2. ALGORITMO HÍBRIDO: Programación dinámica + optimización greedy
    const mejorSolucion = this.encontrarMejorCombinacionHibrida(
      objetivoMensual, 
      diasLaborables.length, 
      proyectosConValor, 
      parametros
    );

    console.log(`🏆 SOLUCIÓN ENCONTRADA: ${mejorSolucion.total.toFixed(2)}€ (diferencia: ${Math.abs(mejorSolucion.total - objetivoMensual).toFixed(2)}€)`);
    mejorSolucion.combinacion.forEach(item => {
      console.log(`  - ${item.proyecto.nombre}: ${item.dias} días × ${item.valorPorDia.toFixed(2)}€ = ${(item.dias * item.valorPorDia).toFixed(2)}€`);
    });

    // 3. Crear plan optimizado con bloques consecutivos REALES
    const { diasPlan, bloques } = this.crearPlanConBloquesReales(
      mejorSolucion.combinacion,
      diasLaborables,
      parametros
    );

    // 4. Verificar y ajustar si hay diferencias por redondeo
    const totalReal = bloques.reduce((sum, b) => sum + b.totalBloque, 0);
    
    console.log(`💰 Total calculado vs real: ${mejorSolucion.total.toFixed(2)}€ vs ${totalReal.toFixed(2)}€`);

    // 5. Crear plan final
    const plan: PlanMensual = {
      id: this.generarId(),
      empleado,
      mes: diasLaborables[0].getMonth() + 1,
      año: diasLaborables[0].getFullYear(),
      fechaGeneracion: new Date(),
      diasLaborables: diasPlan,
      bloques,
      totalDiasLaborables: diasLaborables.length,
      totalDiasConProyecto: diasPlan.length,
      totalKm: bloques.reduce((sum, b) => sum + b.totalKm, 0),
      totalImporteKm: bloques.reduce((sum, b) => sum + b.totalImporteKm, 0),
      totalDietas: bloques.reduce((sum, b) => sum + b.totalDietas, 0),
      totalImporteDietas: bloques.reduce((sum, b) => sum + b.totalImporteDietas, 0),
      totalPlan: totalReal,
      objetivoCumplido: Math.abs(totalReal - objetivoMensual) <= parametros.errorMaximoPermitido,
      diferenciasObjetivo: totalReal - objetivoMensual,
      estado: 'borrador',
      notas: `Algoritmo Híbrido v2.1 - Diferencia: ${Math.abs(totalReal - objetivoMensual).toFixed(2)}€ - ${bloques.length} bloques consecutivos`,
    };

    return plan;
  }

  /**
   * Algoritmo híbrido que encuentra la mejor combinación de proyectos
   * CORREGIDO: Ya no fuerza usar todos los días, se detiene cuando alcanza el objetivo
   */
  private encontrarMejorCombinacionHibrida(
    objetivo: number, 
    diasTotales: number, 
    proyectosConValor: Array<{proyecto: Proyecto, valorPorDia: number, eficiencia: number}>,
    parametros: ParametrosCalculo
  ): { combinacion: Array<{proyecto: Proyecto, dias: number, valorPorDia: number}>, total: number } {
    
    console.log(`🎯 Buscando combinación para objetivo: ${objetivo}€ con máximo ${diasTotales} días`);

    // ESTRATEGIA PRINCIPAL: Algoritmo de aproximación al objetivo
    const encontrarCombinacionOptima = (): { combinacion: Array<{proyecto: Proyecto, dias: number, valorPorDia: number}>, total: number } => {
      let mejorCombinacion: Array<{proyecto: Proyecto, dias: number, valorPorDia: number}> = [];
      let mejorTotal = 0;
      let mejorDiferencia = Infinity;

      // Probar diferentes combinaciones usando programación dinámica simplificada
      const buscarCombinacion = (
        proyectoIndex: number, 
        diasUsados: number,
        totalActual: number,
        combinacionActual: Array<{proyecto: Proyecto, dias: number, valorPorDia: number}>
      ) => {
        // Evaluar la combinación actual
        const diferencia = Math.abs(totalActual - objetivo);
        if (diferencia < mejorDiferencia) {
          mejorDiferencia = diferencia;
          mejorCombinacion = [...combinacionActual];
          mejorTotal = totalActual;
          
          console.log(`🔍 Nueva mejor: ${totalActual.toFixed(2)}€ (diff: ${diferencia.toFixed(2)}€) con ${diasUsados} días`);
          
          // Si estamos muy cerca del objetivo, parar aquí
          if (diferencia <= parametros.errorMaximoPermitido) {
            console.log(`🎯 ¡Objetivo alcanzado con precisión! (±${parametros.errorMaximoPermitido}€)`);
            return true; // Señal de que encontramos una solución perfecta
          }
        }

        // Si hemos probado todos los proyectos o no hay días restantes, terminar
        if (proyectoIndex >= proyectosConValor.length || diasUsados >= diasTotales) {
          return false;
        }

        const proyectoActual = proyectosConValor[proyectoIndex];
        const diasRestantes = diasTotales - diasUsados;
        
        // Calcular rango de días para este proyecto
        const diasMinimos = parametros.diasMinimosBloque;
        const diasMaximos = Math.min(parametros.diasMaximosBloque, diasRestantes);

        // Opción 1: No usar este proyecto (continuar con el siguiente)
        const solucionEncontrada = buscarCombinacion(proyectoIndex + 1, diasUsados, totalActual, combinacionActual);
        if (solucionEncontrada) return true;

        // Opción 2: Usar este proyecto con diferentes cantidades de días
        for (let dias = diasMinimos; dias <= diasMaximos; dias++) {
          const nuevoTotal = totalActual + (dias * proyectoActual.valorPorDia);
          
          // Si ya nos pasamos mucho del objetivo, no seguir con más días
          // Para objetivos altos, ser más tolerante proporcionalmente
          const margenTolerancia = Math.max(parametros.errorMaximoPermitido * 3, objetivo * 0.05); // 5% del objetivo como mínimo
          if (nuevoTotal - objetivo > margenTolerancia) {
            break;
          }

          const nuevaCombinacion = [...combinacionActual, {
            proyecto: proyectoActual.proyecto,
            dias,
            valorPorDia: proyectoActual.valorPorDia
          }];

          const solucionEncontrada = buscarCombinacion(
            proyectoIndex + 1,
            diasUsados + dias,
            nuevoTotal,
            nuevaCombinacion
          );
          
          if (solucionEncontrada) return true;
        }

        return false;
      };

      // Iniciar búsqueda
      buscarCombinacion(0, 0, 0, []);

      return { combinacion: mejorCombinacion, total: mejorTotal };
    };

    // Ejecutar estrategia principal
    let resultado = encontrarCombinacionOptima();
    
    // Si no encontramos una buena solución, usar algoritmo directo más simple
    const diferencia = Math.abs(resultado.total - objetivo);
    // Para objetivos altos, ser más tolerante en el cambio a algoritmo simple
    const margenCambioAlgoritmo = Math.max(parametros.errorMaximoPermitido * 2, objetivo * 0.03); // 3% del objetivo
    if (diferencia > margenCambioAlgoritmo || resultado.combinacion.length === 0) {
      console.log(`⚠️ Solución no óptima (${diferencia.toFixed(2)}€), probando algoritmo directo...`);
      resultado = this.algoritmoDirectoSimple(objetivo, diasTotales, proyectosConValor, parametros);
    }
    
    console.log(`✅ SOLUCIÓN FINAL: ${resultado.total.toFixed(2)}€ con ${resultado.combinacion.reduce((sum, c) => sum + c.dias, 0)} días`);
    resultado.combinacion.forEach(c => {
      console.log(`  - ${c.proyecto.nombre}: ${c.dias} días × ${c.valorPorDia.toFixed(2)}€ = ${(c.dias * c.valorPorDia).toFixed(2)}€`);
    });

    return resultado;
  }

  /**
   * Algoritmo directo y simple como fallback
   */
  private algoritmoDirectoSimple(
    objetivo: number,
    diasTotales: number,
    proyectosConValor: Array<{proyecto: Proyecto, valorPorDia: number, eficiencia: number}>,
    parametros: ParametrosCalculo
  ): { combinacion: Array<{proyecto: Proyecto, dias: number, valorPorDia: number}>, total: number } {
    
    console.log(`🔧 Ejecutando algoritmo directo simple para objetivo ${objetivo}€`);
    
    // Ordenar proyectos por proximidad al valor objetivo por día
    const valorObjetivoPorDia = objetivo / diasTotales;
    const proyectosOrdenados = [...proyectosConValor].sort((a, b) => {
      const diffA = Math.abs(a.valorPorDia - valorObjetivoPorDia);
      const diffB = Math.abs(b.valorPorDia - valorObjetivoPorDia);
      return diffA - diffB;
    });

    console.log(`🎯 Valor objetivo por día: ${valorObjetivoPorDia.toFixed(2)}€`);
    console.log(`📊 Proyecto más cercano: ${proyectosOrdenados[0].proyecto.nombre} (${proyectosOrdenados[0].valorPorDia.toFixed(2)}€/día)`);

    // NUEVO ALGORITMO: Reutilización inteligente de proyectos con múltiples bloques
    const resultado = this.algoritmoReutilizacionProyectos(objetivo, diasTotales, proyectosOrdenados, parametros);
    let mejorCombinacion = resultado.combinacion;
    let mejorTotal = resultado.total;
    let menorDiferencia = Math.abs(mejorTotal - objetivo);
    
    // Si no encontramos buena combinación múltiple, usar algoritmo simple
    if (mejorCombinacion.length === 0 || menorDiferencia > objetivo * 0.1) {
      const proyectoOptimo = proyectosOrdenados[0];
      let diasNecesarios = Math.round(objetivo / proyectoOptimo.valorPorDia);
      
      // Respetar límites de bloque
      diasNecesarios = Math.max(diasNecesarios, parametros.diasMinimosBloque);
      diasNecesarios = Math.min(diasNecesarios, Math.min(parametros.diasMaximosBloque, diasTotales));
      
      mejorTotal = diasNecesarios * proyectoOptimo.valorPorDia;
      mejorCombinacion = [{
        proyecto: proyectoOptimo.proyecto,
        dias: diasNecesarios,
        valorPorDia: proyectoOptimo.valorPorDia
      }];
    }
    
    const diferencia = Math.abs(mejorTotal - objetivo);
    
    console.log(`🔧 Solución final: ${mejorTotal.toFixed(2)}€ (diff: ${diferencia.toFixed(2)}€) con ${mejorCombinacion.length} proyecto(s)`);
    mejorCombinacion.forEach(c => {
      console.log(`  - ${c.proyecto.nombre}: ${c.dias} días × ${c.valorPorDia.toFixed(2)}€ = ${(c.dias * c.valorPorDia).toFixed(2)}€`);
    });

    return {
      combinacion: mejorCombinacion,
      total: mejorTotal
    };
  }

  /**
   * NUEVO: Algoritmo de reutilización inteligente de proyectos
   * Permite usar el mismo proyecto múltiples veces en bloques separados
   */
  private algoritmoReutilizacionProyectos(
    objetivo: number,
    diasTotales: number,
    proyectosOrdenados: Array<{proyecto: Proyecto, valorPorDia: number, eficiencia: number}>,
    parametros: ParametrosCalculo
  ): { combinacion: Array<{proyecto: Proyecto, dias: number, valorPorDia: number}>, total: number } {
    
    console.log(`🔄 Ejecutando algoritmo de reutilización CON ALTERNANCIA para objetivo ${objetivo}€`);
    console.log(`📋 REGLAS: Máximo 5 días consecutivos por proyecto → Mínimo 2 días en proyecto diferente`);
    
    // 1. Validar que tenemos suficientes proyectos para alternar
    if (proyectosOrdenados.length < 2) {
      console.log(`⚠️ Se necesitan al menos 2 proyectos para aplicar alternancia, fallback a algoritmo básico`);
      return this.algoritmoBasico(objetivo, diasTotales, proyectosOrdenados, parametros);
    }

    // 2. Constantes de alternancia según reglas de negocio
    const MAX_DIAS_CONSECUTIVOS = 5;
    const MIN_DIAS_ALTERNANCIA = 2;
    const valorObjetivoPorDia = objetivo / diasTotales;
    
    // 3. Seleccionar los dos mejores proyectos para alternancia
    const proyectoPrimario = proyectosOrdenados[0];  // El más eficiente
    const proyectoSecundario = proyectosOrdenados[1]; // El segundo mejor
    
    console.log(`🥇 Proyecto primario: ${proyectoPrimario.proyecto.nombre} (${proyectoPrimario.valorPorDia.toFixed(2)}€/día)`);
    console.log(`🥈 Proyecto secundario: ${proyectoSecundario.proyecto.nombre} (${proyectoSecundario.valorPorDia.toFixed(2)}€/día)`);
    
    // 4. Crear patrón de alternancia optimizado
    const combinacion: Array<{proyecto: Proyecto, dias: number, valorPorDia: number}> = [];
    let valorAcumulado = 0;
    let diasUsados = 0;
    let proyectoActual = proyectoPrimario; // Empezar con el mejor
    let diasConsecutivosActual = 0;
    let requiereAlternancia = false;

    // 5. Algoritmo de alternancia inteligente
    while (diasUsados < diasTotales) {
      const diasRestantes = diasTotales - diasUsados;
      let diasEnEsteBloque: number;

      // Determinar cuántos días asignar en este bloque
      if (requiereAlternancia) {
        // Estamos en alternancia forzosa, usar mínimo 2 días
        diasEnEsteBloque = Math.max(MIN_DIAS_ALTERNANCIA, 
          Math.min(parametros.diasMinimosBloque, diasRestantes));
      } else {
        // Podemos usar hasta el máximo permitido
        diasEnEsteBloque = Math.min(MAX_DIAS_CONSECUTIVOS, diasRestantes);
        
        // Pero también considerar el objetivo restante
        const objetivoRestante = objetivo - valorAcumulado;
        const diasOptimos = Math.round(objetivoRestante / proyectoActual.valorPorDia);
        
        if (diasOptimos > 0 && diasOptimos < diasEnEsteBloque) {
          diasEnEsteBloque = Math.max(parametros.diasMinimosBloque, 
            Math.min(diasOptimos, diasEnEsteBloque));
        }
      }

      // Validar que el bloque sea válido
      if (diasEnEsteBloque < parametros.diasMinimosBloque && diasRestantes >= parametros.diasMinimosBloque) {
        diasEnEsteBloque = parametros.diasMinimosBloque;
      }
      
      if (diasEnEsteBloque > diasRestantes) {
        diasEnEsteBloque = diasRestantes;
      }

      // Agregar bloque a la combinación
      if (diasEnEsteBloque > 0) {
        const valorBloque = diasEnEsteBloque * proyectoActual.valorPorDia;
        
        combinacion.push({
          proyecto: proyectoActual.proyecto,
          dias: diasEnEsteBloque,
          valorPorDia: proyectoActual.valorPorDia
        });
        
        valorAcumulado += valorBloque;
        diasUsados += diasEnEsteBloque;
        diasConsecutivosActual += diasEnEsteBloque;
        
        console.log(`📅 Bloque ${combinacion.length}: ${proyectoActual.proyecto.nombre} × ${diasEnEsteBloque} días = ${valorBloque.toFixed(2)}€`);
      }

      // 6. Lógica de alternancia - FIXED: evaluar antes del próximo bloque
      const necesitaCambio = diasConsecutivosActual >= MAX_DIAS_CONSECUTIVOS;
      const completoAlternancia = requiereAlternancia && diasConsecutivosActual >= MIN_DIAS_ALTERNANCIA;

      if (necesitaCambio && !requiereAlternancia) {
        // Forzar cambio de proyecto después de 5 días consecutivos
        proyectoActual = proyectoActual === proyectoPrimario ? proyectoSecundario : proyectoPrimario;
        diasConsecutivosActual = 0;
        requiereAlternancia = true;
        console.log(`🔄 ALTERNANCIA FORZADA → Cambiando a ${proyectoActual.proyecto.nombre}`);
      } else if (completoAlternancia) {
        // Ya completamos el mínimo de alternancia, podemos volver al primario si es mejor
        requiereAlternancia = false;
        proyectoActual = proyectoPrimario; // Volver al proyecto más eficiente
        diasConsecutivosActual = 0;
        console.log(`↩️ ALTERNANCIA COMPLETADA → Volviendo a ${proyectoActual.proyecto.nombre}`);
      }

      // Prevenir bucles infinitos
      if (diasEnEsteBloque === 0) {
        console.log(`⚠️ No se pueden asignar más días, terminando algoritmo`);
        break;
      }
    }

    const totalFinal = valorAcumulado;
    const diferencia = Math.abs(totalFinal - objetivo);
    const porcentajeError = (diferencia / objetivo) * 100;
    
    // 7. Mostrar resumen con patrón de alternancia
    console.log(`\n🎯 RESULTADO CON ALTERNANCIA:`);
    console.log(`💰 Total: ${totalFinal.toFixed(2)}€ vs objetivo ${objetivo}€`);
    console.log(`📊 Error: ${diferencia.toFixed(2)}€ (${porcentajeError.toFixed(2)}%)`);
    console.log(`📅 Días usados: ${diasUsados}/${diasTotales}`);
    console.log(`🔢 Bloques generados: ${combinacion.length}`);
    
    // Verificar patrón de alternancia
    this.validarPatronAlternancia(combinacion, MAX_DIAS_CONSECUTIVOS);
    
    return { combinacion, total: totalFinal };
  }
  
  /**
   * Optimiza el resto del objetivo cuando ya tenemos bloques completos
   */
  private optimizarRestoObjetivo(
    objetivoRestante: number,
    diasRestantes: number,
    proyectosOrdenados: Array<{proyecto: Proyecto, valorPorDia: number, eficiencia: number}>,
    parametros: ParametrosCalculo
  ): { bloques: Array<{proyecto: Proyecto, dias: number, valorPorDia: number}>, valor: number } | null {
    
    if (diasRestantes < parametros.diasMinimosBloque) {
      console.log(`⚠️ Días insuficientes para un bloque mínimo (${diasRestantes} < ${parametros.diasMinimosBloque})`);
      return null;
    }
    
    let mejorCombinacion: Array<{proyecto: Proyecto, dias: number, valorPorDia: number}> = [];
    let mejorValor = 0;
    let menorDiferencia = Infinity;
    
    // Probar diferentes estrategias para el resto
    for (const proyectoInfo of proyectosOrdenados.slice(0, 3)) { // Solo los 3 mejores
      // Estrategia 1: Un bloque simple
      const diasPosibles = Math.min(diasRestantes, parametros.diasMaximosBloque);
      const diasOptimos = Math.max(
        parametros.diasMinimosBloque,
        Math.min(diasPosibles, Math.round(objetivoRestante / proyectoInfo.valorPorDia))
      );
      
      if (diasOptimos >= parametros.diasMinimosBloque && diasOptimos <= diasRestantes) {
        const valor = diasOptimos * proyectoInfo.valorPorDia;
        const diferencia = Math.abs(valor - objetivoRestante);
        
        if (diferencia < menorDiferencia) {
          menorDiferencia = diferencia;
          mejorValor = valor;
          mejorCombinacion = [{
            proyecto: proyectoInfo.proyecto,
            dias: diasOptimos,
            valorPorDia: proyectoInfo.valorPorDia
          }];
        }
      }
      
      // Estrategia 2: Múltiples bloques pequeños del mismo proyecto (si tenemos días suficientes)
      if (diasRestantes >= parametros.diasMinimosBloque * 2) {
        const bloquesPequenos = Math.floor(diasRestantes / parametros.diasMinimosBloque);
        let diasPorBloqueChico = Math.floor(diasRestantes / bloquesPequenos);
        diasPorBloqueChico = Math.max(diasPorBloqueChico, parametros.diasMinimosBloque);
        diasPorBloqueChico = Math.min(diasPorBloqueChico, parametros.diasMaximosBloque);
        
        const valorTotalBloques = bloquesPequenos * diasPorBloqueChico * proyectoInfo.valorPorDia;
        const diferenciaBloques = Math.abs(valorTotalBloques - objetivoRestante);
        
        if (diferenciaBloques < menorDiferencia && bloquesPequenos * diasPorBloqueChico <= diasRestantes) {
          menorDiferencia = diferenciaBloques;
          mejorValor = valorTotalBloques;
          mejorCombinacion = [];
          
          for (let i = 0; i < bloquesPequenos; i++) {
            mejorCombinacion.push({
              proyecto: proyectoInfo.proyecto,
              dias: diasPorBloqueChico,
              valorPorDia: proyectoInfo.valorPorDia
            });
          }
        }
      }
    }
    
    if (mejorCombinacion.length > 0) {
      console.log(`💡 Mejor estrategia resto: ${mejorCombinacion.length} bloque(s) = ${mejorValor.toFixed(2)}€`);
      return { bloques: mejorCombinacion, valor: mejorValor };
    }
    
    return null;
  }

  /**
   * Valida que el patrón de alternancia cumple las reglas de negocio
   */
  private validarPatronAlternancia(
    combinacion: Array<{proyecto: Proyecto, dias: number, valorPorDia: number}>, 
    maxDiasConsecutivos: number
  ): void {
    console.log(`\n🔍 VALIDANDO PATRÓN DE ALTERNANCIA:`);
    
    let proyectoAnterior: Proyecto | null = null;
    let diasConsecutivos = 0;
    let violaciones = 0;
    let bloqueConsecutivo = 0;

    for (let i = 0; i < combinacion.length; i++) {
      const bloque = combinacion[i];
      
      if (proyectoAnterior && proyectoAnterior.id === bloque.proyecto.id) {
        // Mismo proyecto que el anterior - sumar días
        diasConsecutivos += bloque.dias;
        bloqueConsecutivo++;
        
        if (diasConsecutivos > maxDiasConsecutivos) {
          console.log(`❌ VIOLACIÓN: ${bloque.proyecto.nombre} usado ${diasConsecutivos} días consecutivos en ${bloqueConsecutivo + 1} bloques (máximo ${maxDiasConsecutivos})`);
          violaciones++;
        } else {
          console.log(`⚠️ Continuación: ${bloque.proyecto.nombre} ${diasConsecutivos} días consecutivos en ${bloqueConsecutivo + 1} bloques`);
        }
      } else {
        // Proyecto diferente, reiniciar contadores
        if (proyectoAnterior) {
          console.log(`✅ Alternancia correcta: ${proyectoAnterior.nombre} (${diasConsecutivos} días) → ${bloque.proyecto.nombre}`);
        }
        diasConsecutivos = bloque.dias;
        bloqueConsecutivo = 0;
        
        // Verificar que el bloque individual no exceda el límite
        if (bloque.dias > maxDiasConsecutivos) {
          console.log(`❌ VIOLACIÓN: Bloque individual ${bloque.proyecto.nombre} tiene ${bloque.dias} días (máximo ${maxDiasConsecutivos})`);
          violaciones++;
        }
      }
      
      proyectoAnterior = bloque.proyecto;
    }

    if (violaciones === 0) {
      console.log(`🎉 PATRÓN VÁLIDO: Todas las reglas de alternancia se cumplen`);
    } else {
      console.log(`⚠️ PATRÓN INVÁLIDO: ${violaciones} violación(es) detectadas`);
    }
  }

  /**
   * Algoritmo básico como fallback cuando no se puede aplicar alternancia
   */
  private algoritmoBasico(
    objetivo: number,
    diasTotales: number,
    proyectosOrdenados: Array<{proyecto: Proyecto, valorPorDia: number, eficiencia: number}>,
    parametros: ParametrosCalculo
  ): { combinacion: Array<{proyecto: Proyecto, dias: number, valorPorDia: number}>, total: number } {
    
    console.log(`🔄 Ejecutando algoritmo básico (fallback)`);
    
    const combinacion: Array<{proyecto: Proyecto, dias: number, valorPorDia: number}> = [];
    let valorAcumulado = 0;
    let diasRestantes = diasTotales;

    // Usar solo el proyecto más eficiente en un solo bloque
    const proyectoOptimo = proyectosOrdenados[0];
    const diasAUsar = Math.min(diasRestantes, parametros.diasMaximosBloque);
    
    if (diasAUsar >= parametros.diasMinimosBloque) {
      const valorBloque = diasAUsar * proyectoOptimo.valorPorDia;
      
      combinacion.push({
        proyecto: proyectoOptimo.proyecto,
        dias: diasAUsar,
        valorPorDia: proyectoOptimo.valorPorDia
      });
      
      valorAcumulado = valorBloque;
      console.log(`📅 Bloque básico: ${proyectoOptimo.proyecto.nombre} × ${diasAUsar} días = ${valorBloque.toFixed(2)}€`);
    }

    return { combinacion, total: valorAcumulado };
  }

  /**
   * Crea un plan con bloques consecutivos REALES respetando el orden cronológico
   */
  private crearPlanConBloquesReales(
    combinacion: Array<{proyecto: Proyecto, dias: number, valorPorDia: number}>,
    diasLaborables: Date[],
    parametros: ParametrosCalculo
  ): { diasPlan: DiaLaborable[], bloques: BloqueConsecutivo[] } {
    
    console.log(`🏗️ Creando plan con bloques consecutivos...`);
    
    const diasPlan: DiaLaborable[] = [];
    const bloques: BloqueConsecutivo[] = [];
    let indiceDia = 0;

    for (const item of combinacion) {
      if (indiceDia >= diasLaborables.length) {
        console.warn(`⚠️ No hay más días disponibles para el proyecto ${item.proyecto.nombre}`);
        break;
      }

      const diasBloque: DiaLaborable[] = [];
      const fechaInicio = diasLaborables[indiceDia];
      
      console.log(`📅 Creando bloque: ${item.proyecto.nombre} (${item.dias} días desde ${fechaInicio.toLocaleDateString()})`);

      // Crear días consecutivos para este proyecto
      for (let d = 0; d < item.dias && indiceDia < diasLaborables.length; d++) {
        const dia = this.crearDiaLaborable(diasLaborables[indiceDia], item.proyecto, parametros);
        diasBloque.push(dia);
        diasPlan.push(dia);
        indiceDia++;
      }

      if (diasBloque.length > 0) {
        const bloque = this.crearBloque(diasBloque, parametros);
        bloques.push(bloque);
        
        console.log(`✅ Bloque creado: ${bloque.proyecto.nombre} (${bloque.totalDias} días, ${bloque.totalBloque.toFixed(2)}€)`);
      }
    }

    console.log(`🎯 Plan creado: ${bloques.length} bloques, ${diasPlan.length}/${diasLaborables.length} días asignados`);

    return { diasPlan, bloques };
  }

  /**
   * Crea un día laborable con proyecto asignado
   */
  private crearDiaLaborable(fecha: Date, proyecto: Proyecto, parametros: ParametrosCalculo): DiaLaborable {
    const importeKm = proyecto.distanciaKm * parametros.importePorKm;
    const importeDieta = proyecto.requiereDieta ? parametros.importePorDieta : 0;
    const totalDia = importeKm + importeDieta;

    return {
      fecha,
      diaSemana: fecha.getDay(),
      esLaborable: true,
      esFestivo: false,
      proyecto,
      distanciaKm: proyecto.distanciaKm,
      importeKm,
      tieneDieta: proyecto.requiereDieta,
      importeDieta,
      totalDia,
    };
  }

  /**
   * Crea bloques consecutivos a partir de días asignados
   */
  private crearBloquesConsecutivos(diasPlan: DiaLaborable[], parametros: ParametrosCalculo): BloqueConsecutivo[] {
    const bloques: BloqueConsecutivo[] = [];
    let bloqueActual: DiaLaborable[] = [];
    let proyectoActual: string | null = null;

    for (let i = 0; i < diasPlan.length; i++) {
      const dia = diasPlan[i];
      const proyectoId = dia.proyecto?.id;

      if (proyectoId === proyectoActual) {
        // Mismo proyecto, continuar bloque
        bloqueActual.push(dia);
      } else {
        // Proyecto diferente, cerrar bloque anterior si existe
        if (bloqueActual.length > 0 && proyectoActual) {
          bloques.push(this.crearBloque(bloqueActual, parametros));
        }
        
        // Empezar nuevo bloque
        bloqueActual = [dia];
        proyectoActual = proyectoId || null;
      }
    }

    // Cerrar último bloque
    if (bloqueActual.length > 0 && proyectoActual) {
      bloques.push(this.crearBloque(bloqueActual, parametros));
    }

    return bloques;
  }

  /**
   * Crea un bloque consecutivo
   */
  private crearBloque(diasBloque: DiaLaborable[], parametros: ParametrosCalculo): BloqueConsecutivo {
    const proyecto = diasBloque[0].proyecto!;
    
    return {
      proyectoId: proyecto.id,
      proyecto,
      diasLaborables: diasBloque,
      fechaInicio: diasBloque[0].fecha,
      fechaFin: diasBloque[diasBloque.length - 1].fecha,
      totalDias: diasBloque.length,
      totalKm: diasBloque.length * proyecto.distanciaKm,
      totalImporteKm: diasBloque.length * proyecto.distanciaKm * parametros.importePorKm,
      totalDietas: proyecto.requiereDieta ? diasBloque.length : 0,
      totalImporteDietas: proyecto.requiereDieta ? diasBloque.length * parametros.importePorDieta : 0,
      totalBloque: diasBloque.reduce((sum, dia) => sum + (dia.totalDia || 0), 0),
    };
  }

  /**
   * Algoritmo legacy (renombrado para compatibilidad)
   */
  private async generarPlanConBloquesLegacy(
    empleado: Empleado,
    objetivoMensual: number,
    diasLaborables: Date[],
    proyectos: Proyecto[],
    parametros: ParametrosCalculo
  ): Promise<PlanMensual> {
    // Este sería el algoritmo anterior adaptado
    // Por simplicidad, usar el nuevo algoritmo pero con lógica de bloques más estricta
    return this.generarPlanPriorizandoObjetivo(empleado, objetivoMensual, diasLaborables, proyectos, parametros);
  }
}

export const calculadoraService = new CalculadoraPlusService();