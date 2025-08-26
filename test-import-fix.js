// Test que el fix de UPSERT funciona correctamente
import fetch from 'node-fetch';

// Datos de prueba - mismo empleado que causaba el error
const testEmpleado = {
  nombre: "Test Request Compare",
  apellidos: "Debug Session", 
  ubicacion: "Peninsula",
  objetivoMensual: 350
};

const testEmpleadoUpdated = {
  nombre: "Test Request Compare",
  apellidos: "Debug Session",
  ubicacion: "Peninsula", 
  objetivoMensual: 400  // Objetivo diferente para probar UPDATE
};

const testProyecto = {
  nombre: "Test Project",
  ubicacion: "Peninsula",
  distanciaKm: 45
};

console.log('🧪 Testing UPSERT functionality after fix...\n');

async function testEmpleadoUpsert() {
  console.log('👤 Testing empleado UPSERT:');
  
  // Primera inserción - debería crear
  console.log('\n1️⃣ First insert (should CREATE):');
  try {
    const response1 = await fetch('https://calculadora-plus-mensual.vercel.app/api/empleados', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testEmpleado),
    });

    console.log('Status:', response1.status);
    if (response1.ok) {
      const data1 = await response1.json();
      console.log('✅ Success - Created empleado:', {
        id: data1.id,
        nombre: data1.nombre,
        objetivo_mensual: data1.objetivo_mensual,
        fecha_creacion: data1.fecha_creacion
      });
    } else {
      const error1 = await response1.text();
      console.log('❌ Error:', error1);
    }
  } catch (error) {
    console.error('💥 Network error:', error.message);
  }

  // Segunda inserción - debería actualizar
  console.log('\n2️⃣ Second insert with different objective (should UPDATE):');
  try {
    const response2 = await fetch('https://calculadora-plus-mensual.vercel.app/api/empleados', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testEmpleadoUpdated),
    });

    console.log('Status:', response2.status);
    if (response2.ok) {
      const data2 = await response2.json();
      console.log('✅ Success - Updated empleado:', {
        id: data2.id,
        nombre: data2.nombre,
        objetivo_mensual: data2.objetivo_mensual,
        fecha_modificacion: data2.fecha_modificacion
      });
    } else {
      const error2 = await response2.text();
      console.log('❌ Error:', error2);
    }
  } catch (error) {
    console.error('💥 Network error:', error.message);
  }
}

async function testProyectoUpsert() {
  console.log('\n\n🏗️ Testing proyecto UPSERT:');
  
  // Primera inserción
  console.log('\n1️⃣ First insert (should CREATE):');
  try {
    const response1 = await fetch('https://calculadora-plus-mensual.vercel.app/api/proyectos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testProyecto),
    });

    console.log('Status:', response1.status);
    if (response1.ok) {
      const data1 = await response1.json();
      console.log('✅ Success - Created proyecto:', {
        id: data1.id,
        nombre: data1.nombre,
        distancia_km: data1.distancia_km,
        requiere_dieta: data1.requiere_dieta
      });
    } else {
      const error1 = await response1.text();
      console.log('❌ Error:', error1);
    }
  } catch (error) {
    console.error('💥 Network error:', error.message);
  }

  // Segunda inserción con distancia diferente
  console.log('\n2️⃣ Second insert with different distance (should UPDATE):');
  const testProyectoUpdated = { ...testProyecto, distanciaKm: 65 };
  
  try {
    const response2 = await fetch('https://calculadora-plus-mensual.vercel.app/api/proyectos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testProyectoUpdated),
    });

    console.log('Status:', response2.status);
    if (response2.ok) {
      const data2 = await response2.json();
      console.log('✅ Success - Updated proyecto:', {
        id: data2.id,
        nombre: data2.nombre,
        distancia_km: data2.distancia_km,
        requiere_dieta: data2.requiere_dieta
      });
    } else {
      const error2 = await response2.text();
      console.log('❌ Error:', error2);
    }
  } catch (error) {
    console.error('💥 Network error:', error.message);
  }
}

async function testBrowserStyleRequest() {
  console.log('\n\n🌐 Testing with browser-style headers (the original failing scenario):');
  
  const browserHeaders = {
    'Content-Type': 'application/json',
    'Accept': 'application/json, text/plain, */*',
    'Origin': 'https://calculadora-plus-mensual.vercel.app',
    'Referer': 'https://calculadora-plus-mensual.vercel.app/',
    'Sec-Fetch-Mode': 'cors',
    'Sec-Fetch-Site': 'same-origin',
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
  };

  try {
    const response = await fetch('https://calculadora-plus-mensual.vercel.app/api/empleados', {
      method: 'POST',
      headers: browserHeaders,
      body: JSON.stringify({
        nombre: "Browser Test",
        apellidos: "UPSERT Fix",
        ubicacion: "Mallorca",
        objetivoMensual: 275
      }),
    });

    console.log('Status:', response.status);
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Success - Browser-style request now works:', {
        id: data.id,
        nombre: data.nombre,
        apellidos: data.apellidos,
        objetivo_mensual: data.objetivo_mensual
      });
    } else {
      const error = await response.text();
      console.log('❌ Still failing:', error);
    }
  } catch (error) {
    console.error('💥 Network error:', error.message);
  }
}

// Ejecutar todas las pruebas
async function runTests() {
  console.log('🚀 Starting UPSERT functionality tests...\n');
  
  await testEmpleadoUpsert();
  await testProyectoUpsert();
  await testBrowserStyleRequest();
  
  console.log('\n\n🎯 Test Summary:');
  console.log('- UPSERT functionality should now prevent 500 errors');  
  console.log('- Duplicate imports should update existing records instead of failing');
  console.log('- Browser-style requests should work the same as direct API calls');
  console.log('\n✅ Fix deployed and ready for frontend testing!');
}

runTests().catch(console.error);