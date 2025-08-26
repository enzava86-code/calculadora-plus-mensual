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
        return await getEmpleados(req, res);
      case 'POST':
        return await createEmpleado(req, res);
      case 'PUT':
        return await updateEmpleado(req, res);
      case 'DELETE':
        return await deleteEmpleado(req, res);
      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function getEmpleados(req, res) {
  try {
    const { id } = req.query;

    if (id) {
      // Get specific empleado
      const result = await sql`
        SELECT * FROM empleados 
        WHERE id = ${id} AND estado = 'activo'
      `;
      const empleado = result[0];
      if (!empleado) {
        return res.status(404).json({ error: 'Empleado not found' });
      }
      return res.json(empleado);
    } else {
      // Get all empleados
      const empleados = await sql`
        SELECT * FROM empleados 
        WHERE estado = 'activo'
        ORDER BY apellidos, nombre
      `;
      return res.json(empleados);
    }
  } catch (error) {
    console.error('Error getting empleados:', error);
    return res.status(500).json({ 
      error: 'Error getting empleados', 
      details: error.message 
    });
  }
}

async function createEmpleado(req, res) {
  try {
    const { nombre, apellidos, ubicacion, objetivoMensual } = req.body;

    console.log('Creating empleado with data:', { nombre, apellidos, ubicacion, objetivoMensual });

    if (!nombre || !apellidos || !ubicacion || !objetivoMensual) {
      console.error('Missing required fields:', { nombre, apellidos, ubicacion, objetivoMensual });
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (!['Peninsula', 'Mallorca'].includes(ubicacion)) {
      console.error('Invalid ubicacion:', ubicacion);
      return res.status(400).json({ error: 'Invalid ubicacion' });
    }

    const result = await sql`
      INSERT INTO empleados (nombre, apellidos, ubicacion, objetivo_mensual)
      VALUES (${nombre}, ${apellidos}, ${ubicacion}, ${objetivoMensual})
      ON CONFLICT (nombre, apellidos, ubicacion) 
      DO UPDATE SET 
        objetivo_mensual = EXCLUDED.objetivo_mensual,
        fecha_modificacion = NOW()
      RETURNING *
    `;

    console.log('Empleado created/updated successfully:', result[0]);
    return res.status(201).json(result[0]);
  } catch (error) {
    console.error('Error creating empleado:', error);
    return res.status(500).json({ 
      error: 'Error creating empleado', 
      details: error.message,
      code: error.code 
    });
  }
}

async function updateEmpleado(req, res) {
  const { id } = req.query;
  const { nombre, apellidos, ubicacion, objetivoMensual } = req.body;

  if (!id) {
    return res.status(400).json({ error: 'Missing empleado ID' });
  }

  const result = await sql`
    UPDATE empleados 
    SET nombre = ${nombre}, 
        apellidos = ${apellidos}, 
        ubicacion = ${ubicacion}, 
        objetivo_mensual = ${objetivoMensual},
        fecha_modificacion = NOW()
    WHERE id = ${id} AND estado = 'activo'
    RETURNING *
  `;

  if (result.length === 0) {
    return res.status(404).json({ error: 'Empleado not found' });
  }

  return res.json(result[0]);
}

async function deleteEmpleado(req, res) {
  const { id, hard } = req.query;

  if (!id) {
    return res.status(400).json({ error: 'Missing empleado ID' });
  }

  if (hard === 'true') {
    // Hard delete
    await sql`DELETE FROM empleados WHERE id = ${id}`;
  } else {
    // Soft delete
    await sql`
      UPDATE empleados 
      SET estado = 'inactivo', fecha_modificacion = NOW()
      WHERE id = ${id}
    `;
  }

  return res.json({ success: true });
}