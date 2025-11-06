import { Router } from 'express';
import { pool } from './db.js';

export const metaRouter = Router();

metaRouter.get('/:table', async (req, res) => {
  const table = req.params.table;
  const [cols] = await pool.query(`DESCRIBE \`${table}\``);
  const pk = cols.find(c => c.Key === 'PRI')?.Field;
  res.json({ columns: cols, pk });
});
