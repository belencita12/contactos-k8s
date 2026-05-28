const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'contactosdb',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
});

// Inicializar tabla
async function initDB() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS contactos (
        id SERIAL PRIMARY KEY,
        nombre VARCHAR(100) NOT NULL,
        email VARCHAR(150) UNIQUE NOT NULL,
        telefono VARCHAR(20),
        empresa VARCHAR(100),
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);
    // Datos de ejemplo
    const count = await pool.query('SELECT COUNT(*) FROM contactos');
    if (parseInt(count.rows[0].count) === 0) {
      await pool.query(`
        INSERT INTO contactos (nombre, email, telefono, empresa) VALUES
        ('Ana García', 'ana.garcia@email.com', '+595 981 123456', 'TechCorp'),
        ('Carlos López', 'carlos.lopez@email.com', '+595 982 234567', 'DevStudio'),
        ('María Martínez', 'maria.martinez@email.com', '+595 983 345678', 'InnoSoft'),
        ('Juan Pérez', 'juan.perez@email.com', '+595 984 456789', 'CloudNet'),
        ('Laura Rodríguez', 'laura.rodriguez@email.com', '+595 985 567890', 'DataLab')
      `);
    }
    console.log('Base de datos inicializada correctamente');
  } catch (err) {
    console.error('Error inicializando BD:', err.message);
    setTimeout(initDB, 3000);
  }
}

// GET /health
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'contactos-backend' });
});

// GET /contactos?search=...
app.get('/contactos', async (req, res) => {
  const { search } = req.query;
  try {
    let result;
    if (search) {
      result = await pool.query(
        `SELECT * FROM contactos
         WHERE nombre ILIKE $1 OR email ILIKE $1 OR empresa ILIKE $1
         ORDER BY nombre`,
        [`%${search}%`]
      );
    } else {
      result = await pool.query('SELECT * FROM contactos ORDER BY nombre');
    }
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /contactos/:id
app.get('/contactos/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM contactos WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Contacto no encontrado' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /contactos
app.post('/contactos', async (req, res) => {
  const { nombre, email, telefono, empresa } = req.body;
  if (!nombre || !email) return res.status(400).json({ error: 'Nombre y email son requeridos' });
  try {
    const result = await pool.query(
      'INSERT INTO contactos (nombre, email, telefono, empresa) VALUES ($1, $2, $3, $4) RETURNING *',
      [nombre, email, telefono, empresa]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ error: 'El email ya existe' });
    res.status(500).json({ error: err.message });
  }
});

// DELETE /contactos/:id
app.delete('/contactos/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM contactos WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Contacto no encontrado' });
    res.json({ message: 'Contacto eliminado', contacto: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Backend corriendo en puerto ${PORT}`);
  initDB();
});
