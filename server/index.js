import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { makeCrudRouter } from './crudFactory.js';
import { metaRouter } from './meta.js';
import { pool } from './db.js';

dotenv.config();
const app = express();
app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());

// Ruta de salud para probar conexión a MySQL
app.get('/health', async (_req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

// --- Rutas CRUD (PKs correctas según tus capturas) ---
app.use('/api/autores',               makeCrudRouter({ table: 'autores',               pk: 'id_autor' }));
app.use('/api/libros',                makeCrudRouter({ table: 'libros',                pk: 'id_libro' }));
app.use('/api/usuarios',              makeCrudRouter({ table: 'usuarios',              pk: 'id_usuarios' })); // ← plural
app.use('/api/editorial',             makeCrudRouter({ table: 'editorial',             pk: 'id_editorial' }));
app.use('/api/prestamo',              makeCrudRouter({ table: 'prestamo',              pk: 'id_prestamo' }));

app.use('/api/correo_usuario',        makeCrudRouter({ table: 'correo_usuario',        pk: 'id_correo_usuario' }));
app.use('/api/direccion_usuario',     makeCrudRouter({ table: 'direccion_usuario',     pk: 'id_direccion_usuario' })); // ← así es tu PK
app.use('/api/documento_usuario',     makeCrudRouter({ table: 'documento_usuario',     pk: 'id_documento_usuario' }));
app.use('/api/telefono_usuario',      makeCrudRouter({ table: 'telefono_usuario',      pk: 'id_telefono_usuario' }));

app.use('/api/bibliotecario',         makeCrudRouter({ table: 'bibliotecario',         pk: 'id_biblio' }));
app.use('/api/correo_bibliotecario',  makeCrudRouter({ table: 'correo_bibliotecario',  pk: 'id_correo_biblio' }));     // ← no es “...rio”
app.use('/api/telefono_bibliotecario',makeCrudRouter({ table: 'telefono_bibliotecario',pk: 'id_telefono_biblio' }));
app.use('/api/horario_bibliotecario', makeCrudRouter({ table: 'horario_bibliotecario', pk: 'id_horario_bibliotecario' })); // ← así se llama


// Metadatos
app.use('/api/meta', metaRouter);

const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`API escuchando en http://localhost:${port}`));
