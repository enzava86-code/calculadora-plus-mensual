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
        return await getProyectos(req, res);
      case 'POST':
        return await createProyecto(req, res);
      case 'PUT':
        return await updateProyecto(req, res);
      case 'DELETE':
        return await deleteProyecto(req, res);
      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function getProyectos(req, res) {
  const { id, ubicacion } = req.query;

  if (id) {
    // Get specific proyecto
    const result = await sql`
      SELECT * FROM proyectos WHERE id = ${id}
    `;
    const proyecto = result[0];
    if (!proyecto) {
      return res.status(404).json({ error: 'Proyecto not found' });
    }
    return res.json(proyecto);
  } else if (ubicacion) {
    // Get proyectos by ubicacion
    const proyectos = await sql`
      SELECT * FROM proyectos 
      WHERE ubicacion = ${ubicacion}
      ORDER BY nombre
    `;
    return res.json(proyectos);
  } else {
    // Get all proyectos
    const proyectos = await sql`
      SELECT * FROM proyectos 
      ORDER BY ubicacion, nombre
    `;
    return res.json(proyectos);
  }
}

async function createProyecto(req, res) {
  const { nombre, ubicacion, distanciaKm } = req.body;

  if (!nombre || !ubicacion || distanciaKm === undefined) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  if (!['Peninsula', 'Mallorca'].includes(ubicacion)) {
    return res.status(400).json({ error: 'Invalid ubicacion' });
  }

  const requiereDieta = distanciaKm > 30;

  const result = await sql`
    INSERT INTO proyectos (nombre, ubicacion, distancia_km, requiere_dieta)
    VALUES (${nombre}, ${ubicacion}, ${distanciaKm}, ${requiereDieta})
    ON CONFLICT (nombre, ubicacion) 
    DO UPDATE SET 
      distancia_km = EXCLUDED.distancia_km,
      requiere_dieta = EXCLUDED.requiere_dieta
    RETURNING *
  `;

  return res.status(201).json(result[0]);
}

async function updateProyecto(req, res) {
  const { id } = req.query;
  const { nombre, ubicacion, distanciaKm } = req.body;

  if (!id) {
    return res.status(400).json({ error: 'Missing proyecto ID' });
  }

  const requiereDieta = distanciaKm > 30;

  const result = await sql`
    UPDATE proyectos 
    SET nombre = ${nombre}, 
        ubicacion = ${ubicacion}, 
        distancia_km = ${distanciaKm},
        requiere_dieta = ${requiereDieta}
    WHERE id = ${id}
    RETURNING *
  `;

  if (result.length === 0) {
    return res.status(404).json({ error: 'Proyecto not found' });
  }

  return res.json(result[0]);
}

async function deleteProyecto(req, res) {
  const { id, all } = req.query;

  if (all === 'true') {
    // Delete all proyectos
    await sql`DELETE FROM proyectos`;
    return res.json({ success: true });
  }

  if (!id) {
    return res.status(400).json({ error: 'Missing proyecto ID' });
  }

  await sql`DELETE FROM proyectos WHERE id = ${id}`;
  return res.json({ success: true });
}