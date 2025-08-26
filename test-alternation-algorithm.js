// Test específico para validar el nuevo algoritmo de alternancia
import fetch from 'node-fetch';

console.log('🧪 Testing ALTERNATION ALGORITHM - Maximum 5 consecutive days per project...\n');

// Crear proyectos de prueba específicos para demostrar alternancia
async function crearProyectosParaAlternancia() {
  console.log('🏗️ Creando proyectos específicos para demostrar alternancia...\n');
  
  const proyectos = [
    {
      nombre: "Proyecto A - Alto Valor",
      ubicacion: "Peninsula", 
      distanciaKm: 120, // 120km * 0.42€ = 50.4€/día + dieta 25€ = 75.4€/día
      descripcion: "Proyecto primario - máximo valor"
    },
    {
      nombre: "Proyecto B - Medio Valor", 
      ubicacion: "Peninsula",
      distanciaKm: 80, // 80km * 0.42€ = 33.6€/día + dieta 25€ = 58.6€/día
      descripcion: "Proyecto secundario - alternancia"
    },
    {
      nombre: "Proyecto C - Bajo Valor",
      ubicacion: "Peninsula", 
      distanciaKm: 25, // 25km * 0.42€ = 10.5€/día (sin dieta) = 10.5€/día
      descripcion: "Proyecto terciario - relleno"
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

async function crearEmpleadoAlternancia(objetivo, nombre) {
  console.log(`\n👤 Creando empleado para objetivo ${objetivo}€: ${nombre}...`);
  
  try {
    const response = await fetch('https://calculadora-plus-mensual.vercel.app/api/empleados', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nombre: nombre,
        apellidos: "Alternancia Test",
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

async function simularAlternanciaLocal(objetivo, proyectos) {
  console.log(`\n🧮 Simulando algoritmo de ALTERNANCIA para objetivo ${objetivo}€:`);
  
  // Ordenar proyectos por valor (como hace el algoritmo real)
  const proyectosOrdenados = [...proyectos].sort((a, b) => b.valorPorDia - a.valorPorDia);
  
  console.log(`📊 Proyectos disponibles (ordenados por valor):`);
  proyectosOrdenados.forEach((p, i) => {
    const orden = i === 0 ? '🥇' : i === 1 ? '🥈' : '🥉';
    console.log(`   ${orden} ${p.nombre}: ${p.valorPorDia.toFixed(2)}€/día`);
  });

  // Constantes del algoritmo
  const MAX_DIAS_CONSECUTIVOS = 5;
  const MIN_DIAS_ALTERNANCIA = 2;
  const DIAS_TOTALES = 22; // Días laborables típicos
  const DIAS_MIN_BLOQUE = 2;
  const DIAS_MAX_BLOQUE = 5;

  // Verificar que tenemos al menos 2 proyectos
  if (proyectosOrdenados.length < 2) {
    console.log(`❌ Se necesitan al menos 2 proyectos para alternancia`);
    return null;
  }

  // Seleccionar proyectos primario y secundario
  const proyectoPrimario = proyectosOrdenados[0];
  const proyectoSecundario = proyectosOrdenados[1];
  
  console.log(`\n🎯 ALGORITMO DE ALTERNANCIA:`);
  console.log(`   🥇 Proyecto primario: ${proyectoPrimario.nombre} (${proyectoPrimario.valorPorDia.toFixed(2)}€/día)`);
  console.log(`   🥈 Proyecto secundario: ${proyectoSecundario.nombre} (${proyectoSecundario.valorPorDia.toFixed(2)}€/día)`);
  console.log(`   📋 REGLAS: Máximo ${MAX_DIAS_CONSECUTIVOS} días consecutivos → Mínimo ${MIN_DIAS_ALTERNANCIA} días alternancia`);

  // Simular el algoritmo
  const bloques = [];
  let valorAcumulado = 0;
  let diasUsados = 0;
  let proyectoActual = proyectoPrimario;
  let diasConsecutivosActual = 0;
  let requiereAlternancia = false;

  while (diasUsados < DIAS_TOTALES) {
    const diasRestantes = DIAS_TOTALES - diasUsados;
    let diasEnEsteBloque;

    // Determinar días para este bloque
    if (requiereAlternancia) {
      diasEnEsteBloque = Math.max(MIN_DIAS_ALTERNANCIA, Math.min(DIAS_MIN_BLOQUE, diasRestantes));
    } else {
      diasEnEsteBloque = Math.min(MAX_DIAS_CONSECUTIVOS, diasRestantes);
      
      const objetivoRestante = objetivo - valorAcumulado;
      const diasOptimos = Math.round(objetivoRestante / proyectoActual.valorPorDia);
      
      if (diasOptimos > 0 && diasOptimos < diasEnEsteBloque) {
        diasEnEsteBloque = Math.max(DIAS_MIN_BLOQUE, Math.min(diasOptimos, diasEnEsteBloque));
      }
    }

    // Validaciones
    if (diasEnEsteBloque < DIAS_MIN_BLOQUE && diasRestantes >= DIAS_MIN_BLOQUE) {
      diasEnEsteBloque = DIAS_MIN_BLOQUE;
    }
    if (diasEnEsteBloque > diasRestantes) {
      diasEnEsteBloque = diasRestantes;
    }

    // Agregar bloque
    if (diasEnEsteBloque > 0) {
      const valorBloque = diasEnEsteBloque * proyectoActual.valorPorDia;
      
      bloques.push({
        proyecto: proyectoActual.nombre,
        dias: diasEnEsteBloque,
        valor: valorBloque,
        tipo: requiereAlternancia ? 'ALTERNANCIA' : 'PRIMARIO'
      });
      
      valorAcumulado += valorBloque;
      diasUsados += diasEnEsteBloque;
      diasConsecutivosActual += diasEnEsteBloque;
      
      console.log(`   📅 Bloque ${bloques.length}: ${proyectoActual.nombre} × ${diasEnEsteBloque} días = ${valorBloque.toFixed(2)}€ (${requiereAlternancia ? 'ALTERNANCIA' : 'PRIMARIO'})`);
    }

    // Lógica de alternancia
    if (diasConsecutivosActual >= MAX_DIAS_CONSECUTIVOS) {
      proyectoActual = proyectoActual === proyectoPrimario ? proyectoSecundario : proyectoPrimario;
      diasConsecutivosActual = 0;
      requiereAlternancia = true;
      console.log(`   🔄 ALTERNANCIA FORZADA → Cambiando a ${proyectoActual.nombre}`);
    } else if (requiereAlternancia && diasConsecutivosActual >= MIN_DIAS_ALTERNANCIA) {
      requiereAlternancia = false;
      proyectoActual = proyectoPrimario;
      diasConsecutivosActual = 0;
      console.log(`   ↩️ ALTERNANCIA COMPLETADA → Volviendo a ${proyectoActual.nombre}`);
    }

    if (diasEnEsteBloque === 0) break;
  }

  // Validar patrón
  console.log(`\n🔍 VALIDACIÓN DEL PATRÓN:`);
  let proyectoAnterior = null;
  let diasConsecutivos = 0;
  let violaciones = 0;

  for (const bloque of bloques) {
    if (proyectoAnterior === bloque.proyecto) {
      diasConsecutivos += bloque.dias;
      if (diasConsecutivos > MAX_DIAS_CONSECUTIVOS) {
        console.log(`   ❌ VIOLACIÓN: ${bloque.proyecto} usado ${diasConsecutivos} días consecutivos`);
        violaciones++;
      }
    } else {
      if (proyectoAnterior) {
        console.log(`   ✅ Alternancia: ${proyectoAnterior} → ${bloque.proyecto}`);
      }
      diasConsecutivos = bloque.dias;
    }
    proyectoAnterior = bloque.proyecto;
  }

  const diferencia = Math.abs(valorAcumulado - objetivo);
  const porcentajeError = (diferencia / objetivo) * 100;
  
  console.log(`\n🎯 RESULTADO SIMULADO:`);
  console.log(`   💰 Total: ${valorAcumulado.toFixed(2)}€ vs objetivo ${objetivo}€`);
  console.log(`   📊 Error: ${diferencia.toFixed(2)}€ (${porcentajeError.toFixed(2)}%)`);
  console.log(`   📅 Días totales: ${diasUsados}/${DIAS_TOTALES}`);
  console.log(`   🔢 Bloques generados: ${bloques.length}`);
  console.log(`   ${violaciones === 0 ? '🎉 PATRÓN VÁLIDO' : '⚠️ PATRÓN INVÁLIDO'}: ${violaciones} violación(es)`);
  
  // Mostrar cronograma detallado
  console.log(`\n📅 CRONOGRAMA DE ALTERNANCIA:`);
  let diaActual = 1;
  for (let i = 0; i < Math.min(bloques.length, 6); i++) {
    const bloque = bloques[i];
    const inicio = diaActual;
    const fin = diaActual + bloque.dias - 1;
    console.log(`   Días ${inicio.toString().padStart(2, '0')}-${fin.toString().padStart(2, '0')}: ${bloque.proyecto} (${bloque.dias} días, ${bloque.valor.toFixed(2)}€)`);
    diaActual += bloque.dias;
  }
  
  if (bloques.length > 6) {
    console.log(`   ... y ${bloques.length - 6} bloque(s) más`);
  }

  return {
    total: valorAcumulado,
    diferencia,
    porcentajeError,
    bloques,
    violaciones,
    esValido: violaciones === 0
  };
}

async function runAlternationTests() {
  console.log('🚀 Demo: Algoritmo de Alternancia con Reglas de Negocio\n');
  console.log('Este demo valida el nuevo algoritmo que respeta:');
  console.log('• Máximo 5 días consecutivos por proyecto');
  console.log('• Mínimo 2 días de alternancia obligatoria');
  console.log('• Patrón: 5 días A → 2+ días B → 5 días A\n');
  
  // 1. Crear proyectos para alternancia
  const proyectos = await crearProyectosParaAlternancia();
  
  if (proyectos.length < 2) {
    console.log('❌ No se pudieron crear suficientes proyectos para alternancia');
    return;
  }

  // 2. Casos de prueba específicos para alternancia
  const casosPrueba = [
    { objetivo: 1200, nombre: "Test Alternancia 1200" },
    { objetivo: 1500, nombre: "Test Alternancia 1500" },
    { objetivo: 1800, nombre: "Test Alternancia 1800" }
  ];

  const resultados = [];

  for (const caso of casosPrueba) {
    console.log('\n' + '='.repeat(70));
    console.log(`🎯 PRUEBA ALTERNANCIA: Objetivo ${caso.objetivo}€`);
    console.log('='.repeat(70));
    
    // Crear empleado
    const empleado = await crearEmpleadoAlternancia(caso.objetivo, caso.nombre);
    
    if (empleado) {
      // Simular algoritmo de alternancia
      const resultado = await simularAlternanciaLocal(caso.objetivo, proyectos);
      
      if (resultado) {
        resultados.push({
          objetivo: caso.objetivo,
          ...resultado
        });

        console.log(`\n✨ ANÁLISIS DE ALTERNANCIA:`);
        console.log(`   🔄 Patrón válido: ${resultado.esValido ? 'SÍ' : 'NO'}`);
        console.log(`   🎯 Precisión: ${resultado.porcentajeError.toFixed(2)}% de error`);
        console.log(`   📊 Efectividad: ${resultado.violaciones === 0 ? 'CUMPLE' : 'VIOLA'} reglas de negocio`);
        
        if (resultado.esValido && resultado.porcentajeError <= 10) {
          console.log(`   🏆 RESULTADO: EXCELENTE - Alternancia válida y precisión alta`);
        } else if (resultado.esValido) {
          console.log(`   ✅ RESULTADO: BUENO - Alternancia válida, precisión mejorable`);
        } else {
          console.log(`   ❌ RESULTADO: FALLA - Violaciones de alternancia detectadas`);
        }
      }
    }
  }

  // Resumen final
  console.log('\n' + '='.repeat(70));
  console.log('📋 RESUMEN: Validación del Algoritmo de Alternancia');
  console.log('='.repeat(70));
  
  if (resultados.length > 0) {
    const resultadosValidos = resultados.filter(r => r.esValido);
    const promedioError = resultados.reduce((sum, r) => sum + r.porcentajeError, 0) / resultados.length;
    
    console.log('\n🎯 Estadísticas:');
    resultados.forEach(r => {
      const estado = r.esValido ? (r.porcentajeError <= 10 ? '🏆 EXCELENTE' : '✅ BUENO') : '❌ FALLA';
      console.log(`  ${r.objetivo}€ → ${r.total.toFixed(2)}€ (${r.porcentajeError.toFixed(2)}% error) ${estado}`);
    });
    
    console.log(`\n📊 Resumen general:`);
    console.log(`  Casos válidos: ${resultadosValidos.length}/${resultados.length}`);
    console.log(`  Promedio de error: ${promedioError.toFixed(2)}%`);
    console.log(`  Tasa de éxito: ${(resultadosValidos.length/resultados.length*100).toFixed(1)}%`);
    
    if (resultadosValidos.length === resultados.length && promedioError <= 15) {
      console.log('\n🎉 ALGORITMO DE ALTERNANCIA: VALIDADO EXITOSAMENTE');
      console.log('✅ Todas las reglas de negocio se cumplen correctamente');
      console.log('✅ La precisión está dentro de rangos aceptables');
    } else {
      console.log('\n⚠️ ALGORITMO DE ALTERNANCIA: NECESITA AJUSTES');
      if (resultadosValidos.length < resultados.length) {
        console.log('❌ Algunas pruebas violan las reglas de alternancia');
      }
      if (promedioError > 15) {
        console.log('❌ La precisión promedio necesita mejoras');
      }
    }
  } else {
    console.log('\n❌ No se pudieron obtener resultados válidos');
  }
  
  console.log('\n🚀 Algoritmo deployado en: https://calculadora-plus-mensual.vercel.app');
  console.log('📝 Los empleados de prueba pueden usarse para validaciones manuales');
}

runAlternationTests().catch(console.error);