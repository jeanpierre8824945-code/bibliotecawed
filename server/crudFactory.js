import { Router } from 'express';
import { pool } from './db.js';

export function makeCrudRouter({ table, pk }) {
  const router = Router();

  // LISTAR
  router.get('/', async (req, res) => {
    try {
      const limit = Number(req.query.limit ?? 50);
      const offset = Number(req.query.offset ?? 0);
      const [rows] = await pool.query(`SELECT * FROM \`${table}\` LIMIT ? OFFSET ?`, [limit, offset]);
      const [[{ total }]] = await pool.query(`SELECT COUNT(*) AS total FROM \`${table}\``);
      res.json({ data: rows, total });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: e.message, code: e.code });
    }
  });

  // OBTENER 1
  router.get('/:id', async (req, res) => {
    try {
      const [rows] = await pool.query(`SELECT * FROM \`${table}\` WHERE \`${pk}\` = ?`, [req.params.id]);
      if (!rows.length) return res.status(404).json({ error: 'No encontrado' });
      res.json(rows[0]);
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: e.message, code: e.code });
    }
  });

  // CREAR
  router.post('/', async (req, res) => {
  try {
    const body = req.body ?? {};
    if (!body || Object.keys(body).length === 0) {
      return res.status(400).json({ error: 'Body vacío' });
    }

    // 1) Lee metadatos reales de la tabla
    const [cols] = await pool.query(`DESCRIBE \`${table}\``);
    const colMap = Object.fromEntries(cols.map(c => [c.Field, c]));
    const allowed = new Set(cols.map(c => c.Field));

    // 2) Sanitiza: solo columnas válidas, "" -> null
    const invalid = [];
    const clean = {};
    for (const [k, v] of Object.entries(body)) {
      if (!allowed.has(k)) {
        invalid.push(k);
        continue;
      }
      clean[k] = (v === '' || v === undefined) ? null : v;
    }

    // 3) No permitir columnas inválidas (ayuda a depurar)
    if (invalid.length) {
      return res.status(422).json({
        error: `Campos no válidos para ${table}: ${invalid.join(', ')}`,
        hint: `Usa solo: ${[...allowed].join(', ')}`
      });
    }

    // 4) Si la PK es autoincrement, no la insertes aunque venga en el body
    if (colMap[pk]?.Extra?.toLowerCase().includes('auto_increment')) {
      delete clean[pk];
    }

    const fields = Object.keys(clean);
    if (!fields.length) {
      return res.status(400).json({ error: 'No hay campos válidos para insertar' });
    }

    const placeholders = fields.map(() => '?').join(',');
    const values = fields.map(k => clean[k]);

    const sql = `INSERT INTO \`${table}\` (${fields.map(f => `\`${f}\``).join(',')}) VALUES (${placeholders})`;
    const [result] = await pool.query(sql, values);

    const newId = result.insertId ?? clean[pk];
    if (newId !== undefined) {
      const [rows] = await pool.query(`SELECT * FROM \`${table}\` WHERE \`${pk}\` = ?`, [newId]);
      return res.status(201).json(rows[0] ?? { ok: true, id: newId });
    }

    res.status(201).json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message, code: e.code });
  }
});

  // ACTUALIZAR
  router.put('/:id', async (req, res) => {
    try {
      const body = req.body ?? {};
      const fields = Object.keys(body);
      if (!fields.length) return res.status(400).json({ error: 'Nada para actualizar' });
      const setSql = fields.map(f => `\`${f}\` = ?`).join(', ');
      const values = [...fields.map(k => body[k]), req.params.id];
      await pool.query(`UPDATE \`${table}\` SET ${setSql} WHERE \`${pk}\` = ?`, values);
      const [rows] = await pool.query(`SELECT * FROM \`${table}\` WHERE \`${pk}\` = ?`, [req.params.id]);
      res.json(rows[0] ?? { ok: true });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: e.message, code: e.code });
    }
  });

  // ELIMINAR
  router.delete('/:id', async (req, res) => {
    try {
      await pool.query(`DELETE FROM \`${table}\` WHERE \`${pk}\` = ?`, [req.params.id]);
      res.json({ ok: true });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: e.message, code: e.code });
    }
  });

  return router;
}
