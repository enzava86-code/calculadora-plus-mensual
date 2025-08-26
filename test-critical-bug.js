// Test CRÍTICO: Reproducir problema con objetivos altos que se quedan en ~300€
import fetch from 'node-fetch';

console.log('🚨 CRITICAL BUG TEST: High objectives dropping to ~300€...\n');

async function testEmpleadoCalculation(objetivo, nombre) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`🎯 TESTING: Objetivo ${objetivo}€ - ${nombre}`);
  console.log('='.repeat(60));
  
  // 1. Crear empleado
  console.log(`👤 Creando empleado para objetivo ${objetivo}€...`);
  
  try {
    const empleadoResponse = await fetch('https://calculadora-plus-mensual.vercel.app/api/empleados', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nombre: nombre,
        apellidos: "Critical Bug Test",
        ubicacion: "Peninsula", 
        objetivoMensual: objetivo
      }),
    });

    if (!empleadoResponse.ok) {
      console.log('❌ Error creando empleado:', await empleadoResponse.text());
      return;
    }

    const empleado = await empleadoResponse.json();
    console.log(`✅ Empleado creado: ID ${empleado.id}, Objetivo: ${empleado.objetivo_mensual}€`);

    // 2. Wait para que se propague
    await new Promise(resolve => setTimeout(resolve, 1000));

    // 3. Hacer cálculo via API frontend
    console.log(`\n🧮 Calculando plan mensual...`);
    
    const calculoResponse = await fetch('https://calculadora-plus-mensual.vercel.app/api/calcular-plan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        empleadoId: empleado.id,
        mes: 12,
        año: 2024,
        forzarRecalculo: true
      }),
    });

    console.log('Status del cálculo:', calculoResponse.status);

    if (calculoResponse.ok) {
      const resultado = await calculoResponse.json();
      
      console.log(`\n📊 RESULTADO OBTENIDO:`);
      console.log(`   🎯 Objetivo: ${objetivo}€`);
      console.log(`   💰 Calculado: ${resultado.totalPlan?.toFixed(2)}€`);
      console.log(`   📈 Diferencia: ${Math.abs(resultado.totalPlan - objetivo).toFixed(2)}€`);
      console.log(`   📊 Error: ${((Math.abs(resultado.totalPlan - objetivo) / objetivo) * 100).toFixed(2)}%`);
      console.log(`   📅 Días laborables: ${resultado.diasLaborables}`);
      console.log(`   🔢 Total bloques: ${resultado.bloques?.length || 0}`);
      
      // Mostrar distribución de bloques
      if (resultado.bloques && resultado.bloques.length > 0) {
        console.log(`\n📋 DISTRIBUCIÓN DE BLOQUES:`);
        resultado.bloques.forEach((bloque, i) => {
          console.log(`   ${i+1}. ${bloque.proyecto.nombre}: ${bloque.totalDias} días → ${bloque.totalBloque.toFixed(2)}€`);
        });
      }

      // Detectar si es el bug crítico
      if (resultado.totalPlan < objetivo * 0.5) {
        console.log(`\n🚨 BUG CRÍTICO DETECTADO:`);
        console.log(`   ⚠️ Resultado está por debajo del 50% del objetivo`);
        console.log(`   💥 Posible problema en algoritmo de alternancia`);
        console.log(`   🔍 Se necesita investigación inmediata`);
      } else if (Math.abs(resultado.totalPlan - objetivo) / objetivo > 0.15) {
        console.log(`\n⚠️ PRECISIÓN BAJA:`);
        console.log(`   📊 Error mayor al 15% del objetivo`);
        console.log(`   🔧 Algoritmo necesita ajustes`);
      } else {
        console.log(`\n✅ RESULTADO ACEPTABLE:`);
        console.log(`   🎯 Error dentro del rango esperado (<15%)`);
      }

      return {
        objetivo,
        calculado: resultado.totalPlan,
        diferencia: Math.abs(resultado.totalPlan - objetivo),
        porcentajeError: (Math.abs(resultado.totalPlan - objetivo) / objetivo) * 100,
        bloques: resultado.bloques?.length || 0,
        esCritico: resultado.totalPlan < objetivo * 0.5
      };

    } else {
      const error = await calculoResponse.text();
      console.log('❌ Error en cálculo:', error);
      return null;
    }

  } catch (error) {
    console.error('💥 Network error:', error.message);
    return null;
  }
}

async function runCriticalBugTest() {
  console.log('🚨 Iniciando test del bug crítico para objetivos altos...\n');
  
  // Casos específicos que están fallando según el usuario
  const casosCriticos = [
    { objetivo: 1500, nombre: "Critical Bug 1500" },
    { objetivo: 1600, nombre: "Critical Bug 1600" }, 
    { objetivo: 1700, nombre: "Critical Bug 1700" },
    { objetivo: 1800, nombre: "Critical Bug 1800" },
    // Casos de control que deberían funcionar
    { objetivo: 800, nombre: "Control 800" },
    { objetivo: 1000, nombre: "Control 1000" }
  ];

  const resultados = [];

  for (const caso of casosCriticos) {
    const resultado = await testEmpleadoCalculation(caso.objetivo, caso.nombre);
    if (resultado) {
      resultados.push(resultado);
    }
    
    // Esperar entre pruebas
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  // Análisis de resultados
  console.log('\n' + '='.repeat(80));
  console.log('📋 ANÁLISIS DEL BUG CRÍTICO');
  console.log('='.repeat(80));

  if (resultados.length === 0) {
    console.log('❌ No se pudieron obtener resultados para el análisis');
    return;
  }

  console.log('\n🎯 Resultados obtenidos:');
  resultados.forEach(r => {
    const estado = r.esCritico ? '🚨 CRÍTICO' : r.porcentajeError > 15 ? '⚠️ BAJO' : '✅ OK';
    console.log(`  ${r.objetivo}€ → ${r.calculado?.toFixed(2)}€ (${r.porcentajeError.toFixed(2)}% error, ${r.bloques} bloques) ${estado}`);
  });

  const resultadosCriticos = resultados.filter(r => r.esCritico);
  const resultadosBajos = resultados.filter(r => !r.esCritico && r.porcentajeError > 15);
  const resultadosOK = resultados.filter(r => !r.esCritico && r.porcentajeError <= 15);

  console.log(`\n📊 Estadísticas del problema:`);
  console.log(`  🚨 Casos críticos: ${resultadosCriticos.length}/${resultados.length} (${(resultadosCriticos.length/resultados.length*100).toFixed(1)}%)`);
  console.log(`  ⚠️ Casos con baja precisión: ${resultadosBajos.length}/${resultados.length} (${(resultadosBajos.length/resultados.length*100).toFixed(1)}%)`);
  console.log(`  ✅ Casos funcionando: ${resultadosOK.length}/${resultados.length} (${(resultadosOK.length/resultados.length*100).toFixed(1)}%)`);

  if (resultadosCriticos.length > 0) {
    console.log(`\n🚨 CONFIRMACIÓN DEL BUG CRÍTICO:`);
    console.log(`  💥 ${resultadosCriticos.length} caso(s) con resultados extremadamente bajos`);
    console.log(`  📉 Objetivos altos están cayendo a valores muy bajos (~300€)`);
    console.log(`  🔍 El algoritmo de alternancia tiene un fallo grave`);
    
    // Identificar patrón
    const objetivosCriticos = resultadosCriticos.map(r => r.objetivo);
    console.log(`  🎯 Objetivos afectados: ${objetivosCriticos.join(', ')}`);
    
    if (objetivosCriticos.every(obj => obj >= 1500)) {
      console.log(`  🔍 PATRÓN: El problema afecta específicamente a objetivos ≥1500€`);
    }
    
    console.log(`\n🔧 ACCIÓN REQUERIDA: Fix inmediato del algoritmo de alternancia`);
  } else {
    console.log(`\n🎉 No se detectaron casos críticos en esta ejecución`);
  }
}

runCriticalBugTest().catch(console.error);