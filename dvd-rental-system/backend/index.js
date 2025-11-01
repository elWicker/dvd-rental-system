const express = require('express');
const { Pool } = require('pg');

const app = express();
app.use(express.json());

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'dvdrental',
  port: process.env.DB_PORT || 5432,
});

app.get('/', (req, res) => res.send('🎬 API Renta de DVD funcionando'));

app.post('/rentas', async (req, res) => {
  const { customer_id, inventory_id, staff_id } = req.body;
  const query = `
    INSERT INTO rental (rental_date, inventory_id, customer_id, staff_id)
    VALUES (NOW(), $1, $2, $3) RETURNING *;
  `;
  const { rows } = await pool.query(query, [inventory_id, customer_id, staff_id]);
  res.json(rows[0]);
});

app.patch('/rentas/:id/devolucion', async (req, res) => {
  const { id } = req.params;
  await pool.query('UPDATE rental SET return_date = NOW() WHERE rental_id = $1;', [id]);
  res.json({ mensaje: 'DVD devuelto correctamente' });
});

app.patch('/rentas/:id/cancelar', async (req, res) => {
  const { id } = req.params;
  await pool.query('DELETE FROM rental WHERE rental_id = $1;', [id]);
  res.json({ mensaje: 'Renta cancelada' });
});

app.get('/clientes/:id/rentas', async (req, res) => {
  const { id } = req.params;
  const { rows } = await pool.query('SELECT * FROM rental WHERE customer_id = $1;', [id]);
  res.json(rows);
});

app.get('/rentas/no-devueltos', async (req, res) => {
  const { rows } = await pool.query('SELECT * FROM rental WHERE return_date IS NULL;');
  res.json(rows);
});

app.get('/reportes/dvds-mas-rentados', async (_, res) => {
  const { rows } = await pool.query(`
    SELECT f.title, COUNT(r.rental_id) AS veces_rentado
    FROM rental r
    JOIN inventory i ON r.inventory_id = i.inventory_id
    JOIN film f ON i.film_id = f.film_id
    GROUP BY f.title
    ORDER BY veces_rentado DESC
    LIMIT 10;
  `);
  res.json(rows);
});

app.get('/reportes/ganancia-staff', async (_, res) => {
  const { rows } = await pool.query(`
    SELECT s.first_name || ' ' || s.last_name AS staff, SUM(p.amount) AS total_ganancia
    FROM payment p
    JOIN staff s ON p.staff_id = s.staff_id
    GROUP BY s.staff_id;
  `);
  res.json(rows);
});

const PORT = 3000;
app.listen(PORT, () => console.log(`🚀 API en http://localhost:${PORT}`));
