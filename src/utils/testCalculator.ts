// Test utility to verify the calculator functionality
import { calculadoraService } from '../services/calculadora';
import { dbService } from '../services/database';
import { OpcionesGeneracion } from '../types/plan';

export async function testCalculatorFlow() {
  try {
    console.log('🧪 Iniciando test del flujo completo de la calculadora...');

    // 1. Initialize with sample data
    await dbService.initializeWithSampleData();
    console.log('✅ Datos de ejemplo inicializados');

    // 2. Get first active employee
    const empleados = await dbService.getEmpleados();
    const empleadoActivo = empleados.find(emp => emp.estado === 'activo');
    
    if (!empleadoActivo) {
      throw new Error('No se encontró ningún empleado activo');
    }

    console.log(`✅ Empleado seleccionado: ${empleadoActivo.nombre} ${empleadoActivo.apellidos}`);

    // 3. Get default parameters
    const parametros = await dbService.getParametros();
    console.log('✅ Parámetros cargados:', parametros);

    // 4. Configure calculation options
    const opciones: OpcionesGeneracion = {
      empleadoId: empleadoActivo.id,
      mes: new Date().getMonth() + 1, // Current month
      año: new Date().getFullYear(), // Current year
      parametros,
      generarVariantes: true,
      maximoVariantes: 3,
      proyectosExcluidos: [],
    };

    console.log('✅ Opciones configuradas para:', 
      `${opciones.mes}/${opciones.año}`, 
      `- Objetivo: €${empleadoActivo.objetivoMensual}`);

    // 5. Generate plan using the algorithm
    console.log('🔄 Ejecutando algoritmo de bloques consecutivos...');
    const startTime = Date.now();
    
    const resultado = await calculadoraService.generarPlanMensual(opciones);
    
    const endTime = Date.now();
    console.log(`✅ Plan generado en ${endTime - startTime}ms`);

    // 6. Display results
    console.log('\n📊 RESULTADO DEL CÁLCULO:');
    console.log('='.repeat(50));
    console.log(`Empleado: ${empleadoActivo.nombre} ${empleadoActivo.apellidos}`);
    console.log(`Objetivo mensual: €${empleadoActivo.objetivoMensual}`);
    console.log(`Algoritmo: ${resultado.algoritmoUtilizado}`);
    console.log(`Tiempo de generación: ${resultado.tiempoGeneracion}ms`);
    
    // Main plan
    const planPrincipal = resultado.planGenerado;
    console.log('\n🎯 PLAN PRINCIPAL:');
    console.log(`  Total generado: €${planPrincipal.totalPlan.toFixed(2)}`);
    console.log(`  Diferencia objetivo: €${planPrincipal.diferenciasObjetivo.toFixed(2)}`);
    console.log(`  Objetivo cumplido: ${planPrincipal.objetivoCumplido ? '✅' : '❌'}`);
    console.log(`  Días laborables: ${planPrincipal.totalDiasLaborables}`);
    console.log(`  Días con proyecto: ${planPrincipal.totalDiasConProyecto}`);
    console.log(`  Número de bloques: ${planPrincipal.bloques.length}`);
    console.log(`  Total km: ${planPrincipal.totalKm}`);
    console.log(`  Total dietas: ${planPrincipal.totalDietas}`);

    // Block details
    console.log('\n🏗️  BLOQUES GENERADOS:');
    planPrincipal.bloques.forEach((bloque, index) => {
      console.log(`  Bloque ${index + 1}: ${bloque.proyecto.nombre}`);
      console.log(`    Días: ${bloque.totalDias} (${bloque.fechaInicio.toLocaleDateString()} - ${bloque.fechaFin.toLocaleDateString()})`);
      console.log(`    Importe: €${bloque.totalBloque.toFixed(2)} (${bloque.totalKm}km + ${bloque.totalDietas} dietas)`);
    });

    // Variants
    if (resultado.variantes && resultado.variantes.length > 0) {
      console.log('\n🔄 VARIANTES GENERADAS:');
      resultado.variantes.forEach((variante, index) => {
        console.log(`  Variante ${index + 1}: €${variante.totalPlan.toFixed(2)} (${variante.objetivoCumplido ? '✅' : '❌'})`);
      });
    }

    // Statistics
    if (resultado.estadisticas) {
      console.log('\n📈 ESTADÍSTICAS:');
      console.log(`  Combinaciones evaluadas: ${resultado.estadisticas.totalCombinacionesEvaluadas}`);
      console.log(`  Mejor solución encontrada: ${resultado.estadisticas.mejorSolucionEncontrada ? '✅' : '❌'}`);
      console.log(`  Precisión objetivo: ${resultado.estadisticas.precisonObjetivo?.toFixed(2)}%`);
    }

    // 7. Test plan validation
    console.log('\n🔍 VALIDANDO PLAN...');
    const validacion = await calculadoraService.validarPlan(planPrincipal);
    console.log(`Validación: ${validacion.valido ? '✅ Válido' : '❌ Inválido'}`);
    
    if (!validacion.valido && validacion.errores.length > 0) {
      console.log('❌ ERRORES:');
      validacion.errores.forEach(error => console.log(`  • ${error}`));
    }
    
    if ('advertencias' in validacion && validacion.advertencias.length > 0) {
      console.log('⚠️ ADVERTENCIAS:');
      validacion.advertencias.forEach(adv => console.log(`  • ${adv}`));
    }

    // 8. Save plan to database
    console.log('\n💾 GUARDANDO PLAN...');
    const planGuardado = await dbService.savePlan({
      ...planPrincipal,
      estado: 'borrador'
    });
    console.log(`✅ Plan guardado con ID: ${planGuardado.id}`);

    console.log('\n🎉 ¡Test completado exitosamente!');
    console.log('='.repeat(50));

    return {
      success: true,
      resultado,
      planGuardado,
      validacion
    };

  } catch (error) {
    console.error('❌ Error en el test:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido'
    };
  }
}

// Export for use in console or components
(window as any).testCalculator = testCalculatorFlow;