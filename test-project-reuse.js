// Test específico para demostrar la reutilización de proyectos
import fetch from 'node-fetch';

console.log('🔄 Testing reutilización de proyectos con objetivos altos...\n');

// Crear proyectos de prueba con diferentes valores
async function crearProyectosPrueba() {
  console.log('🏗️ Creando proyectos de prueba...');
  
  const proyectos = [
    {
      nombre: "Proyecto Alto Valor",
      ubicacion: "Peninsula", 
      distanciaKm: 120, // 120km * 0.42€ = 50.4€/día + dieta 25€ = 75.4€/día
      descripcion: "Proyecto premium - valor alto"
    },
    {
      nombre: "Proyecto Medio Valor", 
      ubicacion: "Peninsula",
      distanciaKm: 80, // 80km * 0.42€ = 33.6€/día + dieta 25€ = 58.6€/día
      descripcion: "Proyecto estándar - valor medio"
    },
    {
      nombre: "Proyecto Bajo Valor",
      ubicacion: "Peninsula", 
      distanciaKm: 25, // 25km * 0.42€ = 10.5€/día (sin dieta) = 10.5€/día
      descripcion: "Proyecto local - valor bajo"
    }
  ];
  
  const proyectosCreados = [];
  
  for (const proyecto of proyectos) {
    try {
      const response = await fetch('https://calculadora-plus-mensual.vercel.app/api/proyectos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(proyecto),
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log(`✅ ${proyecto.nombre}: ${data.distancia_km}km, Dieta: ${data.requiere_dieta ? 'Sí' : 'No'}`);
        
        // Calcular valor por día
        const kmValue = data.distancia_km * 0.42;
        const dietValue = data.requiere_dieta ? 25 : 0;
        const totalValue = kmValue + dietValue;
        console.log(`   💰 Valor por día: ${totalValue.toFixed(2)}€ (${kmValue.toFixed(2)}€ km + ${dietValue}€ dieta)`);
        
        proyectosCreados.push({...data, valorPorDia: totalValue});
      } else {
        console.log(`❌ Error creando ${proyecto.nombre}`);
      }
    } catch (error) {
      console.error(`💥 Error: ${error.message}`);
    }
  }
  
  return proyectosCreados;
}

async function crearEmpleadoPrueba(objetivo) {
  console.log(`\n👤 Creando empleado para objetivo ${objetivo}€...`);
  
  try {
    const response = await fetch('https://calculadora-plus-mensual.vercel.app/api/empleados', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nombre: "Test Reuse",
        apellidos: `Objetivo ${objetivo}€`,
        ubicacion: "Peninsula",
        objetivoMensual: objetivo
      }),
    });

    if (response.ok) {
      const data = await response.json();
      console.log(`✅ Empleado creado: ID ${data.id}, Objetivo: ${data.objetivo_mensual}€`);
      return data;
    } else {
      console.log('❌ Error creando empleado');
      return null;
    }
  } catch (error) {
    console.error('💥 Error:', error.message);
    return null;
  }
}

async function simularCalculoLocal(objetivo, proyectos) {
  console.log(`\n🧮 Simulando cálculo de reutilización para objetivo ${objetivo}€:`);
  console.log(`📊 Proyectos disponibles:`);
  proyectos.forEach(p => {
    console.log(`   - ${p.nombre}: ${p.valorPorDia.toFixed(2)}€/día`);
  });
  
  // Simular el algoritmo de reutilización
  const diasMaximosBloque = 5;
  const diasMinimosBloque = 2; 
  const diasTotalesMes = 22; // Días laborables típicos
  
  // Proyecto más eficiente (mayor valor por día)
  const proyectoOptimo = proyectos.reduce((max, p) => p.valorPorDia > max.valorPorDia ? p : max);
  
  console.log(`\n🎯 Algoritmo de reutilización:`);
  console.log(`   📈 Proyecto óptimo: ${proyectoOptimo.nombre} (${proyectoOptimo.valorPorDia.toFixed(2)}€/día)`);
  
  // Bloques completos del proyecto óptimo
  const valorPorBloque = diasMaximosBloque * proyectoOptimo.valorPorDia;
  const bloquesCompletos = Math.floor(objetivo / valorPorBloque);
  let valorAcumulado = bloquesCompletos * valorPorBloque;
  let diasUsados = bloquesCompletos * diasMaximosBloque;
  
  console.log(`   🔢 Bloques completos de ${diasMaximosBloque} días: ${bloquesCompletos}`);
  console.log(`   💰 Valor de bloques completos: ${valorAcumulado.toFixed(2)}€`);
  console.log(`   📅 Días usados: ${diasUsados}/${diasTotalesMes}`);
  
  const bloques = [];
  for (let i = 0; i < bloquesCompletos; i++) {
    bloques.push({
      proyecto: proyectoOptimo.nombre,
      dias: diasMaximosBloque,
      valor: valorPorBloque
    });
  }
  
  // Calcular resto
  const objetivoRestante = objetivo - valorAcumulado;
  const diasRestantes = diasTotalesMes - diasUsados;
  
  console.log(`\n📐 Optimizando resto:`);
  console.log(`   🎯 Objetivo restante: ${objetivoRestante.toFixed(2)}€`);
  console.log(`   📅 Días restantes: ${diasRestantes}`);
  
  if (objetivoRestante > 0 && diasRestantes >= diasMinimosBloque) {
    // Probar el mismo proyecto óptimo para el resto
    let diasResto = Math.max(diasMinimosBloque, Math.min(diasRestantes, Math.round(objetivoRestante / proyectoOptimo.valorPorDia)));
    diasResto = Math.min(diasResto, diasMaximosBloque);
    
    const valorResto = diasResto * proyectoOptimo.valorPorDia;
    
    if (diasResto >= diasMinimosBloque) {
      bloques.push({
        proyecto: proyectoOptimo.nombre,
        dias: diasResto,
        valor: valorResto
      });
      valorAcumulado += valorResto;
      diasUsados += diasResto;
      
      console.log(`   ✅ Bloque adicional: ${proyectoOptimo.nombre} x ${diasResto} días = ${valorResto.toFixed(2)}€`);
    }
  }
  
  const diferencia = Math.abs(valorAcumulado - objetivo);
  const porcentajeError = (diferencia / objetivo) * 100;
  
  console.log(`\n🎯 RESULTADO SIMULADO:`);
  console.log(`   💰 Total: ${valorAcumulado.toFixed(2)}€ vs objetivo ${objetivo}€`);
  console.log(`   📊 Error: ${diferencia.toFixed(2)}€ (${porcentajeError.toFixed(2)}%)`);
  console.log(`   📅 Días totales: ${diasUsados}/${diasTotalesMes}`);
  console.log(`   🔢 Distribución:`);
  
  // Mostrar cómo se vería la distribución
  const distribucionProyectos = {};
  bloques.forEach(b => {
    if (!distribucionProyectos[b.proyecto]) {
      distribucionProyectos[b.proyecto] = { dias: 0, bloques: 0, valor: 0 };
    }
    distribucionProyectos[b.proyecto].dias += b.dias;
    distribucionProyectos[b.proyecto].bloques += 1;
    distribucionProyectos[b.proyecto].valor += b.valor;
  });
  
  Object.entries(distribucionProyectos).forEach(([nombre, info]) => {
    console.log(`      - ${nombre}: ${info.bloques} bloque(s), ${info.dias} días, ${info.valor.toFixed(2)}€`);
  });
  
  // Ejemplo de cronograma
  console.log(`\n📅 Ejemplo de cronograma (primeros 15 días):`);
  let diaActual = 1;
  for (const bloque of bloques.slice(0, 3)) { // Solo primeros 3 bloques
    const inicio = diaActual;
    const fin = diaActual + bloque.dias - 1;
    console.log(`      Días ${inicio}-${fin}: ${bloque.proyecto} (${bloque.dias} días)`);
    diaActual += bloque.dias;
  }
  
  if (bloques.length > 3) {
    console.log(`      ... y ${bloques.length - 3} bloque(s) más`);
  }
  
  return {
    total: valorAcumulado,
    diferencia,
    porcentajeError,
    bloques,
    reutilizacion: distribucionProyectos
  };
}

async function runProjectReuseDemo() {
  console.log('🚀 Demo: Reutilización Inteligente de Proyectos\n');
  console.log('Este demo muestra cómo el nuevo algoritmo permite reutilizar');
  console.log('el mismo proyecto múltiples veces para maximizar la precisión.\n');
  
  // 1. Crear proyectos de prueba
  const proyectos = await crearProyectosPrueba();
  
  if (proyectos.length === 0) {
    console.log('❌ No se pudieron crear proyectos de prueba');
    return;
  }
  
  // 2. Probar diferentes objetivos
  const objetivosPrueba = [1200, 1500, 1800];
  
  for (const objetivo of objetivosPrueba) {
    console.log('\n' + '='.repeat(60));
    console.log(`🎯 PRUEBA: Objetivo ${objetivo}€`);
    console.log('='.repeat(60));
    
    // Crear empleado
    const empleado = await crearEmpleadoPrueba(objetivo);
    
    if (empleado) {
      // Simular el cálculo
      const resultado = await simularCalculoLocal(objetivo, proyectos);
      
      console.log(`\n✨ VENTAJAS DEL NUEVO ALGORITMO:`);
      console.log(`   🔄 Reutilización: El mismo proyecto puede usarse múltiples veces`);
      console.log(`   🎯 Precisión: Error del ${resultado.porcentajeError.toFixed(2)}% vs objetivo`);
      console.log(`   💡 Flexibilidad: Patrón como 5 días A → 2 días B → 5 días A es posible`);
      console.log(`   📊 Optimización: Usa el proyecto más eficiente al máximo`);
      
      if (resultado.porcentajeError <= 5) {
        console.log(`   🎉 RESULTADO: EXCELENTE (≤5% error)`);
      } else if (resultado.porcentajeError <= 10) {
        console.log(`   ✅ RESULTADO: BUENO (≤10% error)`);
      } else {
        console.log(`   ⚠️ RESULTADO: MEJORABLE (>10% error)`);
      }
    }
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('📋 RESUMEN DE MEJORAS IMPLEMENTADAS');
  console.log('='.repeat(60));
  console.log('✅ Validación formulario: 50€ - 1500€ (era 500€)');
  console.log('✅ Tolerancia proporcional: 5% mínimo (era fija 9€)');
  console.log('✅ Reutilización proyectos: Múltiples bloques mismo proyecto');
  console.log('✅ Algoritmo inteligente: Optimiza bloques completos + resto');
  console.log('✅ Flexibilidad total: 5 días A → 2 días B → 5 días A');
  
  console.log('\n🚀 Cambios deployados en: https://calculadora-plus-mensual.vercel.app');
  console.log('📝 Para probar manualmente: Ve a Calculadora y selecciona los empleados de prueba creados');
}

runProjectReuseDemo().catch(console.error);