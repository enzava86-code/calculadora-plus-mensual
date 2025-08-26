// Script para simular exactamente el comportamiento del frontend
const API_BASE_URL = '/api'; // Como está definido en el frontend

const testEmpleado = {
  nombre: "Test Frontend",
  apellidos: "Debugging",
  ubicacion: "Peninsula",
  objetivoMensual: 250
};

console.log('🧪 Simulando comportamiento exacto del frontend...');
console.log('🔗 API_BASE_URL:', API_BASE_URL);
console.log('📝 Datos a enviar:', testEmpleado);

// Simular la llamada tal como la hace databaseApi.ts
async function testFrontendCall() {
  try {
    // Esto falla porque es una URL relativa desde Node.js
    const response = await fetch(`${API_BASE_URL}/empleados`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testEmpleado),
    });

    console.log('📊 Response status:', response.status);
    console.log('📊 Response headers:', [...response.headers.entries()]);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ API Error Response:', {
        status: response.status,
        statusText: response.statusText,
        body: errorText,
        sentData: testEmpleado
      });
      
      try {
        const errorJson = JSON.parse(errorText);
        throw new Error(`Failed to create empleado: ${errorJson.error || 'Unknown error'} - ${errorJson.details || ''}`);
      } catch (parseError) {
        throw new Error(`Failed to create empleado: ${response.status} ${response.statusText} - ${errorText}`);
      }
    }
    
    const data = await response.json();
    console.log('✅ Success! Employee created:', data);
    
  } catch (error) {
    console.error('💥 Network/Fetch Error:', error.message);
    console.error('📍 Error type:', error.constructor.name);
  }
}

// Probar también con URL completa
async function testWithFullURL() {
  try {
    console.log('\n🌐 Probando con URL completa...');
    const response = await fetch('https://calculadora-plus-mensual.vercel.app/api/empleados', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...testEmpleado,
        nombre: "Test Full URL",
        apellidos: "Complete Path"
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Full URL Error:', errorText);
    } else {
      const data = await response.json();
      console.log('✅ Full URL Success:', data);
    }
    
  } catch (error) {
    console.error('💥 Full URL Error:', error.message);
  }
}

testFrontendCall();
testWithFullURL();