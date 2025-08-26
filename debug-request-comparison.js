// Compare frontend request vs direct API call
import fetch from 'node-fetch';

// Test data
const testData = {
  nombre: "Test Request Compare",
  apellidos: "Debug Session",
  ubicacion: "Peninsula",
  objetivoMensual: 350
};

console.log('🧪 Comparing request formats...\n');

// Function to make direct API call (we know this works)
async function directApiCall() {
  console.log('📤 Direct API Call:');
  console.log('URL:', 'https://calculadora-plus-mensual.vercel.app/api/empleados');
  console.log('Method:', 'POST');
  console.log('Headers:', {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'User-Agent': 'node-fetch'
  });
  console.log('Body:', JSON.stringify(testData, null, 2));
  
  try {
    const response = await fetch('https://calculadora-plus-mensual.vercel.app/api/empleados', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'node-fetch'
      },
      body: JSON.stringify(testData),
    });

    console.log('\n📊 Direct API Response:');
    console.log('Status:', response.status);
    console.log('StatusText:', response.statusText);
    console.log('Headers:', Object.fromEntries(response.headers.entries()));
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Success Response:', data);
    } else {
      const errorText = await response.text();
      console.log('❌ Error Response:', errorText);
    }
  } catch (error) {
    console.error('💥 Network Error:', error.message);
  }
}

// Function that simulates browser request (what frontend should send)
async function simulatedBrowserCall() {
  console.log('\n\n📱 Simulated Browser Request:');
  console.log('URL:', 'https://calculadora-plus-mensual.vercel.app/api/empleados');
  console.log('Method:', 'POST');
  
  // Headers that a browser would typically send
  const browserHeaders = {
    'Content-Type': 'application/json',
    'Accept': 'application/json, text/plain, */*',
    'Accept-Language': 'en-US,en;q=0.9',
    'Accept-Encoding': 'gzip, deflate, br',
    'Origin': 'https://calculadora-plus-mensual.vercel.app',
    'Referer': 'https://calculadora-plus-mensual.vercel.app/',
    'Sec-Ch-Ua': '"Google Chrome";v="121", "Not A(Brand";v="99", "Chromium";v="121"',
    'Sec-Ch-Ua-Mobile': '?0',
    'Sec-Ch-Ua-Platform': '"macOS"',
    'Sec-Fetch-Dest': 'empty',
    'Sec-Fetch-Mode': 'cors',
    'Sec-Fetch-Site': 'same-origin',
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36'
  };
  
  console.log('Headers:', browserHeaders);
  console.log('Body:', JSON.stringify(testData, null, 2));
  
  try {
    const response = await fetch('https://calculadora-plus-mensual.vercel.app/api/empleados', {
      method: 'POST',
      headers: browserHeaders,
      body: JSON.stringify(testData),
    });

    console.log('\n📊 Browser-like Response:');
    console.log('Status:', response.status);
    console.log('StatusText:', response.statusText);
    console.log('Headers:', Object.fromEntries(response.headers.entries()));
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Success Response:', data);
    } else {
      const errorText = await response.text();
      console.log('❌ Error Response:', errorText);
      
      // Try to parse error as JSON
      try {
        const errorJson = JSON.parse(errorText);
        console.log('📝 Parsed Error:', errorJson);
      } catch (parseError) {
        console.log('📝 Raw Error Text:', errorText);
      }
    }
  } catch (error) {
    console.error('💥 Network Error:', error.message);
  }
}

// Test different scenarios
async function runComparison() {
  console.log('🔍 Running Request Comparison Analysis\n');
  
  // Test 1: Direct API call
  await directApiCall();
  
  // Test 2: Browser-like call
  await simulatedBrowserCall();
  
  // Test 3: Check if CORS is the issue
  console.log('\n\n🌐 CORS Test:');
  try {
    const response = await fetch('https://calculadora-plus-mensual.vercel.app/api/empleados', {
      method: 'OPTIONS'
    });
    
    console.log('OPTIONS request status:', response.status);
    console.log('CORS headers:', {
      'Access-Control-Allow-Origin': response.headers.get('Access-Control-Allow-Origin'),
      'Access-Control-Allow-Methods': response.headers.get('Access-Control-Allow-Methods'),
      'Access-Control-Allow-Headers': response.headers.get('Access-Control-Allow-Headers'),
    });
  } catch (error) {
    console.error('CORS test failed:', error.message);
  }
  
  // Test 4: Different content types
  console.log('\n\n📝 Content-Type Test:');
  try {
    const response = await fetch('https://calculadora-plus-mensual.vercel.app/api/empleados', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams(testData).toString(),
    });
    
    console.log('URL-encoded request status:', response.status);
    if (!response.ok) {
      const errorText = await response.text();
      console.log('URL-encoded error:', errorText.substring(0, 200) + '...');
    }
  } catch (error) {
    console.error('URL-encoded test failed:', error.message);
  }
}

// Run the comparison
runComparison().catch(console.error);