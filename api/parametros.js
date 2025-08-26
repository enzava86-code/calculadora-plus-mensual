import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    switch (req.method) {
      case 'GET':
        return await getParametros(req, res);
      case 'PUT':
        return await updateParametros(req, res);
      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function getParametros(req, res) {
  const parametros = await sql`
    SELECT clave, valor_numerico, valor_texto, valor_booleano, descripcion 
    FROM parametros_sistema
    ORDER BY clave
  `;

  // Convert to the format expected by the frontend
  const parametrosObj = {};
  
  parametros.forEach(param => {
    let value = param.valor_numerico ?? param.valor_texto ?? param.valor_booleano;
    
    // Convert specific keys to match frontend expectations
    switch (param.clave) {
      case 'importe_por_km':
        parametrosObj.importePorKm = value;
        break;
      case 'importe_por_dieta':
        parametrosObj.importePorDieta = value;
        break;
      case 'distancia_minima_para_dieta':
        parametrosObj.distanciaMinimaParaDieta = value;
        break;
      case 'dias_minimos_bloque':
        parametrosObj.diasMinimosBloque = value;
        break;
      case 'dias_maximos_bloque':
        parametrosObj.diasMaximosBloque = value;
        break;
      case 'error_maximo_permitido':
        parametrosObj.errorMaximoPermitido = value;
        break;
      case 'priorizar_objetivo_sobre_consecutividad':
        parametrosObj.priorizarObjetivoSobreConsecutividad = value;
        break;
      default:
        parametrosObj[param.clave] = value;
    }
  });

  return res.json(parametrosObj);
}

async function updateParametros(req, res) {
  const {
    importePorKm,
    importePorDieta,
    distanciaMinimaParaDieta,
    diasMinimosBloque,
    diasMaximosBloque,
    errorMaximoPermitido,
    priorizarObjetivoSobreConsecutividad
  } = req.body;

  // Update parameters
  const updates = [
    { clave: 'importe_por_km', valor: importePorKm },
    { clave: 'importe_por_dieta', valor: importePorDieta },
    { clave: 'distancia_minima_para_dieta', valor: distanciaMinimaParaDieta },
    { clave: 'dias_minimos_bloque', valor: diasMinimosBloque },
    { clave: 'dias_maximos_bloque', valor: diasMaximosBloque },
    { clave: 'error_maximo_permitido', valor: errorMaximoPermitido },
    { clave: 'priorizar_objetivo_sobre_consecutividad', valor: priorizarObjetivoSobreConsecutividad }
  ];

  for (const update of updates) {
    if (update.valor !== undefined) {
      if (typeof update.valor === 'boolean') {
        await sql`
          UPDATE parametros_sistema 
          SET valor_booleano = ${update.valor}, fecha_modificacion = NOW()
          WHERE clave = ${update.clave}
        `;
      } else {
        await sql`
          UPDATE parametros_sistema 
          SET valor_numerico = ${update.valor}, fecha_modificacion = NOW()
          WHERE clave = ${update.clave}
        `;
      }
    }
  }

  return res.json({ success: true });
}