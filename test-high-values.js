// Test específico para objetivos altos >1000€
import fetch from 'node-fetch';

const testCases = [
  { objetivo: 1200, empleado: "Test High 1", ubicacion: "Peninsula" },
  { objetivo: 1500, empleado: "Test High 2", ubicacion: "Mallorca" },  
  { objetivo: 1800, empleado: "Test High 3", ubicacion: "Peninsula" },
  { objetivo: 2000, empleado: "Test High 4", ubicacion: "Peninsula" }
];

console.log('🧪 Testing calculadora con objetivos altos (>1000€)...\n');

async function testEmpleadoCreation(testCase) {
  console.log(`👤 Creando empleado para objetivo ${testCase.objetivo}€:`);
  
  try {
    const response = await fetch('https://calculadora-plus-mensual.vercel.app/api/empleados', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nombre: testCase.empleado,
        apellidos: "High Value Test", 
        ubicacion: testCase.ubicacion,
        objetivoMensual: testCase.objetivo
      }),
    });

    console.log('Status:', response.status);
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Empleado creado:', {
        id: data.id,
        nombre: data.nombre,
        objetivo_mensual: data.objetivo_mensual
      });
      return data.id;
    } else {
      const error = await response.text();
      console.log('❌ Error creando empleado:', error);
      return null;
    }
  } catch (error) {
    console.error('💥 Network error:', error.message);
    return null;
  }
}

async function testCalculation(empleadoId, objetivo, ubicacion) {
  console.log(`\n🧮 Probando cálculo para objetivo ${objetivo}€:`);
  
  try {
    const response = await fetch('https://calculadora-plus-mensual.vercel.app/api/calcular', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        empleadoId: empleadoId,
        mes: 12,
        año: 2024,
        ubicacion: ubicacion
      }),
    });

    console.log('Status:', response.status);
    if (response.ok) {
      const resultado = await response.json();
      const diferencia = Math.abs(resultado.totalCalculado - objetivo);
      const porcentajeError = (diferencia / objetivo) * 100;
      
      console.log('✅ Cálculo realizado:');
      console.log(`  Objetivo: ${objetivo}€`);
      console.log(`  Calculado: ${resultado.totalCalculado?.toFixed(2)}€`);
      console.log(`  Diferencia: ${diferencia.toFixed(2)}€ (${porcentajeError.toFixed(2)}%)`);
      console.log(`  Algoritmo: ${resultado.algoritmoUtilizado}`);
      console.log(`  Días usados: ${resultado.diasLaborables}`);
      
      // Validar si es aceptable (menos del 10% de diferencia)
      if (porcentajeError <= 10) {
        console.log('🎯 Resultado ACEPTABLE (≤10% error)');
      } else {
        console.log('⚠️ Resultado MEJORABLE (>10% error)');
      }
      
      return { objetivo, calculado: resultado.totalCalculado, diferencia, porcentajeError, algoritmo: resultado.algoritmoUtilizado };
    } else {
      const error = await response.text();
      console.log('❌ Error en cálculo:', error);
      return null;
    }
  } catch (error) {
    console.error('💥 Network error:', error.message);
    return null;
  }
}

async function runHighValueTests() {
  console.log('🚀 Iniciando pruebas para objetivos altos...\n');
  
  const resultados = [];
  
  for (const testCase of testCases) {
    console.log(`\n${'='.repeat(50)}`);
    console.log(`🎯 TEST: Objetivo ${testCase.objetivo}€ en ${testCase.ubicacion}`);
    console.log('='.repeat(50));
    
    // Crear empleado
    const empleadoId = await testEmpleadoCreation(testCase);
    
    if (empleadoId) {
      // Wait for deployment
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Probar cálculo
      const resultado = await testCalculation(empleadoId, testCase.objetivo, testCase.ubicacion);
      if (resultado) {
        resultados.push(resultado);
      }
    }
    
    console.log('\n');
  }
  
  // Resumen final
  console.log('\n' + '='.repeat(60));
  console.log('📊 RESUMEN DE PRUEBAS PARA OBJETIVOS ALTOS');
  console.log('='.repeat(60));
  
  if (resultados.length > 0) {
    console.log('\n🎯 Resultados obtenidos:');
    resultados.forEach(r => {
      const estado = r.porcentajeError <= 10 ? '✅ ACEPTABLE' : '⚠️ MEJORABLE';
      console.log(`  ${r.objetivo}€ → ${r.calculado?.toFixed(2)}€ (${r.porcentajeError?.toFixed(2)}% error) ${estado}`);
      console.log(`    Algoritmo: ${r.algoritmo}`);
    });
    
    const promedioPorcentajeError = resultados.reduce((sum, r) => sum + r.porcentajeError, 0) / resultados.length;
    const resultadosAceptables = resultados.filter(r => r.porcentajeError <= 10).length;
    
    console.log(`\n📈 Estadísticas:`);
    console.log(`  Promedio de error: ${promedioPorcentajeError.toFixed(2)}%`);
    console.log(`  Resultados aceptables: ${resultadosAceptables}/${resultados.length} (${((resultadosAceptables/resultados.length)*100).toFixed(1)}%)`);
    
    if (promedioPorcentajeError <= 10) {
      console.log('\n🎉 PRUEBAS EXITOSAS: El algoritmo maneja correctamente objetivos altos');
    } else {
      console.log('\n⚠️ NECESITA MEJORAS: El algoritmo aún tiene dificultades con objetivos altos');
    }
  } else {
    console.log('\n❌ No se pudieron obtener resultados válidos');
  }
  
  console.log('\n✅ Pruebas completadas. Los empleados de prueba permanecen en el sistema para verificaciones adicionales.');
}

runHighValueTests().catch(console.error);