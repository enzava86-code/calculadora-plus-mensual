// Script para debuggear importación de empleados simulando el comportamiento del frontend
import XLSX from 'xlsx';
import fs from 'fs';

// Crear archivo Excel de prueba
const empleadosPrueba = [
  ['Nombre', 'Apellidos', 'Ubicación (Peninsula/Mallorca)', 'Objetivo Mensual (€)'],
  ['Juan', 'Pérez García', 'Peninsula', 250],
  ['María', 'López Ruiz', 'Mallorca', 300],
  ['Pedro', 'González Martín', 'Peninsula', 200]
];

const ws = XLSX.utils.aoa_to_sheet(empleadosPrueba);
const wb = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(wb, ws, 'Empleados');

// Guardar archivo Excel
const archivoExcel = '/Users/enriczaragozavalero/01-PROYECTOS/IA-Development/Apps/calculadora-plus-mensual/empleados-test.xlsx';
XLSX.writeFile(wb, archivoExcel);
console.log('✅ Archivo Excel creado:', archivoExcel);

// Leer y procesar el archivo como lo hace la aplicación
const workbook = XLSX.readFile(archivoExcel);
const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];
const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

console.log('📊 Datos leídos del Excel:', JSON.stringify(data, null, 2));

// Procesar datos como lo hace excelService.ts
const empleados = [];
const errores = [];

// Skip header row
for (let i = 1; i < data.length; i++) {
  const row = data[i];
  console.log(`\n🔍 Procesando fila ${i + 1}:`, row);
  
  if (!row || row.length === 0) {
    console.log(`⚠️ Fila ${i + 1} vacía, omitiendo`);
    continue;
  }

  const empleado = {
    nombre: row[0]?.toString().trim() || '',
    apellidos: row[1]?.toString().trim() || '',
    ubicacion: row[2]?.toString().trim() || '',
    objetivoMensual: Number(row[3]) || 200,
    estado: 'activo'
  };

  console.log('👤 Empleado procesado:', empleado);

  // Validaciones como en excelService.ts
  if (!empleado.nombre || !empleado.apellidos) {
    errores.push(`Fila ${i + 1}: Nombre y apellidos son obligatorios`);
    continue;
  }

  if (!['Peninsula', 'Mallorca'].includes(empleado.ubicacion)) {
    errores.push(`Fila ${i + 1}: Ubicación debe ser 'Peninsula' o 'Mallorca', recibido: '${empleado.ubicacion}'`);
    continue;
  }

  if (!empleado.objetivoMensual || empleado.objetivoMensual < 50 || empleado.objetivoMensual > 1500) {
    errores.push(`Fila ${i + 1}: Objetivo mensual debe estar entre 50€ y 1500€, recibido: ${empleado.objetivoMensual}`);
    continue;
  }

  empleados.push(empleado);
}

console.log('\n✅ Empleados válidos:', JSON.stringify(empleados, null, 2));
console.log('\n❌ Errores encontrados:', errores);

// Simular llamada API
console.log('\n🌐 Simulando llamadas a la API...');
for (const empleado of empleados) {
  try {
    const response = await fetch('https://calculadora-plus-mensual.vercel.app/api/empleados', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(empleado),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ Error API para ${empleado.nombre}:`, {
        status: response.status,
        statusText: response.statusText,
        body: errorText,
        sentData: empleado
      });
    } else {
      const result = await response.json();
      console.log(`✅ Empleado creado exitosamente: ${empleado.nombre} ${empleado.apellidos} (ID: ${result.id})`);
    }
  } catch (error) {
    console.error(`💥 Error de red para ${empleado.nombre}:`, error.message);
  }
}