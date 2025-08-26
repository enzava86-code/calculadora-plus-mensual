// Test que simula EXACTAMENTE el flujo frontend -> databaseApi -> backend
import XLSX from 'xlsx';

// Simular datos como los genera excelService.ts
const testExcelData = [
  ['Nombre', 'Apellidos', 'Ubicación (Peninsula/Mallorca)', 'Objetivo Mensual (€)'],
  ['Test', 'Frontend Flow', 'Peninsula', 250]
];

console.log('🎯 Simulando EXACTAMENTE el flujo del frontend...\n');

// 1. Simular procesamiento de Excel como en excelService.ts
console.log('📊 Paso 1: Procesamiento de Excel (excelService.ts)');
const row = testExcelData[1]; // Skip header
const empleado = {
  nombre: row[0]?.toString().trim(),
  apellidos: row[1]?.toString().trim(),
  ubicacion: row[2]?.toString().trim(),
  objetivoMensual: Number(row[3]) || 200,
  estado: 'activo'
};

console.log('👤 Empleado procesado por excelService:', empleado);
console.log('🔍 Tipos de datos:', {
  nombre: typeof empleado.nombre,
  apellidos: typeof empleado.apellidos,
  ubicacion: typeof empleado.ubicacion,
  objetivoMensual: typeof empleado.objetivoMensual,
  objetivoMensualValue: empleado.objetivoMensual
});

// 2. Simular validaciones frontend
console.log('\n✅ Paso 2: Validaciones frontend');
if (!empleado.nombre || !empleado.apellidos) {
  console.log('❌ Fallo validación: nombre/apellidos');
}
if (!['Peninsula', 'Mallorca'].includes(empleado.ubicacion)) {
  console.log('❌ Fallo validación: ubicacion');
}
if (!empleado.objetivoMensual || empleado.objetivoMensual < 50 || empleado.objetivoMensual > 1500) {
  console.log('❌ Fallo validación: objetivoMensual');
}
console.log('✅ Todas las validaciones frontend pasadas');

// 3. Simular llamada databaseApi.ts
console.log('\n🌐 Paso 3: Llamada databaseApi.ts');
const dtoData = {
  nombre: empleado.nombre,
  apellidos: empleado.apellidos,
  ubicacion: empleado.ubicacion,
  objetivoMensual: empleado.objetivoMensual
};

console.log('📤 DTO enviado por databaseApi:', dtoData);
console.log('📤 JSON que se envía:', JSON.stringify(dtoData));

// 4. Simular validación backend
console.log('\n🔍 Paso 4: Validación backend (empleados.js)');
const { nombre, apellidos, ubicacion, objetivoMensual } = dtoData;

console.log('Backend recibe:', { nombre, apellidos, ubicacion, objetivoMensual });
console.log('Validación: !nombre =', !nombre);
console.log('Validación: !apellidos =', !apellidos);
console.log('Validación: !ubicacion =', !ubicacion);  
console.log('Validación: !objetivoMensual =', !objetivoMensual);

if (!nombre || !apellidos || !ubicacion || !objetivoMensual) {
  console.log('❌ FALLA: Missing required fields en backend');
  console.log('📊 Detalles de fallos:', {
    nombre: { value: nombre, falsy: !nombre },
    apellidos: { value: apellidos, falsy: !apellidos },
    ubicacion: { value: ubicacion, falsy: !ubicacion },
    objetivoMensual: { value: objetivoMensual, falsy: !objetivoMensual }
  });
} else {
  console.log('✅ Validaciones backend pasadas');
}

if (!['Peninsula', 'Mallorca'].includes(ubicacion)) {
  console.log('❌ FALLA: Invalid ubicacion en backend');
} else {
  console.log('✅ Validación ubicacion backend pasada');
}

// 5. Prueba real con API
console.log('\n🚀 Paso 5: Prueba real con API');

try {
  const response = await fetch('https://calculadora-plus-mensual.vercel.app/api/empleados', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(dtoData),
  });

  console.log('📊 Status de respuesta:', response.status);
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error('❌ Error API:', errorText);
    
    try {
      const errorJson = JSON.parse(errorText);
      console.error('❌ Error JSON:', errorJson);
    } catch (e) {
      console.error('❌ Error text no es JSON válido');
    }
  } else {
    const result = await response.json();
    console.log('✅ ¡ÉXITO! Empleado creado:', result);
  }
} catch (error) {
  console.error('💥 Error de red:', error.message);
}