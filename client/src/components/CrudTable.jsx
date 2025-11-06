import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { api } from '../api';

/**
 * Configura aquí tus llaves foráneas:
 * clave = NOMBRE DE COLUMNA en la tabla actual
 * - refTable: tabla de la que vienen las opciones
 * - refPk:    pk de esa tabla de referencia
 * - labelFields: campos para armar la etiqueta visible
 *
 * EJEMPLOS:
 *  - En "libros", id_editorial toma opciones de "editorial", muestra "nombre"
 *  - En "prestamo", id_usuario de "usuarios", muestra "nombres apellidos"
 */
// 👇 PÉGALO TAL CUAL
const fkConfigGlobal = {
  // LIBROS → EDITORIAL
  libros: {
    id_editorial: { refTable: 'editorial', refPk: 'id_editorial', labelFields: ['nom_editorial'] },
  },

  // PRESTAMO → USUARIOS + BIBLIOTECARIO
  prestamo: {
    id_usuarios: { refTable: 'usuarios', refPk: 'id_usuarios', labelFields: ['nom_usuarios', 'apell_usuarios'] },
    id_biblio:   { refTable: 'bibliotecario', refPk: 'id_biblio', labelFields: ['nombre_biblio', 'apellido_biblio'] },
  },

  // TABLAS LIGADAS A USUARIOS (sus FKs se llaman id_usuario)
  correo_usuario: {
    id_usuario: { refTable: 'usuarios', refPk: 'id_usuarios', labelFields: ['nom_usuarios', 'apell_usuarios'] },
  },
  direccion_usuario: {
    id_usuario: { refTable: 'usuarios', refPk: 'id_usuarios', labelFields: ['nom_usuarios', 'apell_usuarios'] },
  },
  documento_usuario: {
    id_usuario: { refTable: 'usuarios', refPk: 'id_usuarios', labelFields: ['nom_usuarios', 'apell_usuarios'] },
  },
  telefono_usuario: {
    id_usuario: { refTable: 'usuarios', refPk: 'id_usuarios', labelFields: ['nom_usuarios', 'apell_usuarios'] },
  },

  // TABLAS LIGADAS A BIBLIOTECARIO
  correo_bibliotecario: {
    id_biblio: { refTable: 'bibliotecario', refPk: 'id_biblio', labelFields: ['nombre_biblio', 'apellido_biblio'] },
  },
  telefono_bibliotecario: {
    id_biblio: { refTable: 'bibliotecario', refPk: 'id_biblio', labelFields: ['nombre_biblio', 'apellido_biblio'] },
  },
  horario_bibliotecario: {
    id_biblio: { refTable: 'bibliotecario', refPk: 'id_biblio', labelFields: ['nombre_biblio', 'apellido_biblio'] },
  },

  // MUCHOS-A-MUCHOS (úsalo solo si dejaste esas tablas visibles)
  libro_autor: {
    id_libro: { refTable: 'libros', refPk: 'id_libro', labelFields: ['nombre_libro'] }, // si tu columna se llama distinto (ej. 'nom_libro'), cámbialo aquí
    id_autor: { refTable: 'autores', refPk: 'id_autor', labelFields: ['nombre_autor'] }, // idem: ajusta si es 'nom_autor'
  },
  detalles_prestamo: {
    id_libro:    { refTable: 'libros',    refPk: 'id_libro',    labelFields: ['nombre_libro'] },
    id_prestamo: { refTable: 'prestamo',  refPk: 'id_prestamo', labelFields: ['id_prestamo'] }, // puedes poner otra etiqueta si tienes
  },
};


export default function CrudTable({ table }) {
  const [meta, setMeta] = useState(null);
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [editing, setEditing] = useState(null);
  const { register, handleSubmit, reset, setValue } = useForm({ shouldUnregister: true });
  const pk = meta?.pk;

  // Config FK para la tabla actual
  const fkConfig = fkConfigGlobal[table] ?? {};

  // Cache de opciones por columna FK: { colName: [{value,label,raw}] }
  const [fkOptions, setFkOptions] = useState({});

  const load = async () => {
    const m = await api.get(`/meta/${table}`).then(r => r.data);
    setMeta(m);
    const list = await api.get(`/${table}?limit=200&offset=0`).then(r => r.data);
    setRows(list.data);
    setTotal(list.total);
  };

  // Cargar metadatos + datos
useEffect(() => {
  reset({});  // limpia valores previos (evita campos fantasma como nombre_biblio en editorial)
  load();     // vuelve a traer meta + datos de la tabla actual
}, [table, reset]);

  // Cargar opciones para cada FK definida
  useEffect(() => {
    const loadFkOptions = async () => {
      const entries = Object.entries(fkConfig);
      if (!entries.length) { setFkOptions({}); return; }

      const newMap = {};
      for (const [col, def] of entries) {
        // Traemos catálogo (puedes ajustar limit si tienes miles)
        const resp = await api.get(`/${def.refTable}?limit=1000&offset=0`).then(r => r.data);
        const options = (resp?.data ?? []).map(item => ({
          value: item[def.refPk],
          label: buildLabel(item, def.labelFields),
          raw: item,
        }));
        newMap[col] = options;
      }
      setFkOptions(newMap);
    };
    loadFkOptions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [table, JSON.stringify(fkConfig)]);

  // Columnas para formulario (no editamos PK)
  const formCols = useMemo(() => {
    if (!meta) return [];
    return meta.columns
      .filter(c => c.Field !== pk)
      .map(c => ({
        name: c.Field,
        type: inferType(c.Type),
        required: c.Null === 'NO' && c.Default == null
      }));
  }, [meta, pk]);

  function inferType(mysqlType) {
    const t = (mysqlType || '').toLowerCase();
    if (t.includes('int') || t.includes('decimal') || t.includes('float') || t.includes('double')) return 'number';
    if (t.includes('datetime') || t.includes('timestamp')) return 'datetime-local';
    if (t.includes('date')) return 'date';
    if (t.includes('text')) return 'textarea';
    return 'text';
    }

  function buildLabel(row, fields) {
    if (!fields?.length) return String(row?.id ?? '');
    return fields.map(f => row?.[f]).filter(Boolean).join(' ');
  }

  // Mapea valor FK → etiqueta para mostrar en la grilla
  function displayCell(col, value) {
    // Si la columna es FK y tenemos opciones, muestra la etiqueta
    if (fkConfig[col] && fkOptions[col]) {
      const opt = fkOptions[col].find(o => String(o.value) === String(value));
      if (opt) return opt.label;
    }
    return String(value ?? '');
  }

  function sanitizeForSubmit(raw, meta, fkConfig) {
  const out = { ...raw };
  const colMap = Object.fromEntries((meta?.columns ?? []).map(c => [c.Field, c]));

  // 1) Convertir FKs a número si aplica
  for (const col of Object.keys(fkConfig ?? {})) {
    if (out[col] !== undefined && out[col] !== '') {
      const n = Number(out[col]);
      if (!Number.isNaN(n)) out[col] = n;
    }
  }

  // 2) Vacíos -> null; tipos correctos
  for (const [field, val] of Object.entries(out)) {
    const col = colMap[field];
    const t = (col?.Type || '').toLowerCase();

    // vacío -> null
    if (val === '' || val === undefined) {
      out[field] = null;
      continue;
    }

    // numéricos -> Number
    if (t.includes('int') || t.includes('decimal') || t.includes('float') || t.includes('double')) {
      const n = Number(val);
      out[field] = Number.isNaN(n) ? null : n;
    }

    // date -> YYYY-MM-DD
    if (!t.includes('time') && t.includes('date')) {
      // si vino "2025-11-05" ya está bien
      out[field] = String(val).slice(0, 10);
    }

    // datetime/timestamp -> "YYYY-MM-DDTHH:MM" (input) a "YYYY-MM-DD HH:MM:SS" (MySQL)
    if (t.includes('datetime') || t.includes('timestamp')) {
      const s = String(val);
      // del input "2025-11-05T13:40" a "2025-11-05 13:40:00"
      if (s.includes('T')) {
        const [d, hm] = s.split('T');
        out[field] = hm ? `${d} ${hm}:00` : `${d} 00:00:00`;
      }
    }
  }

  // 3) No enviar la PK (la manejan MySQL o el backend)
  if (meta?.pk) delete out[meta.pk];

  return out;
}



  const onCreate = async (data) => {
  try {
    const payload = sanitizeForSubmit(data, meta, fkConfig);
    await api.post(`/${table}`, payload);
    reset(); setEditing(null); await load();
  } catch (e) {
    alert(e?.response?.data?.error || e.message);
  }
};

const onUpdate = async (data) => {
  try {
    const payload = sanitizeForSubmit(data, meta, fkConfig);
    await api.put(`/${table}/${editing[pk]}`, payload);
    reset(); setEditing(null); await load();
  } catch (e) {
    alert(e?.response?.data?.error || e.message);
  }
};


  const onDelete = async (id) => {
    if (!confirm('¿Eliminar registro?')) return;
    await api.delete(`/${table}/${id}`);
    await load();
  };

  // Cuando editas, si hay columnas FK, precargamos el select con ese valor
  useEffect(() => {
    if (!editing) return;
    Object.keys(fkConfig).forEach(col => {
      if (editing[col] != null) setValue(col, String(editing[col]));
    });
  }, [editing, fkConfig, setValue]);

  return (
    <div style={{ display:'grid', gap:16 }}>
      <h2>Tabla: {table} ({total})</h2>

      {/* FORM */}
      <div style={{ border:'1px solid #ddd', padding:12, borderRadius:8 }}>
        <h3>{editing ? 'Editar' : 'Crear nuevo'}</h3>
        <form onSubmit={handleSubmit(editing ? onUpdate : onCreate)} style={{ display:'grid', gap:8 }}>
          {formCols.map(col => {
            const fkDef = fkConfig[col.name];
            // Si es FK, mostramos un SELECT con opciones
            if (fkDef) {
              const options = fkOptions[col.name] ?? [];
              return (
                <label key={col.name} style={{ display:'grid', gap:4 }}>
                  {col.name}
                  <select {...register(col.name, { required: col.required })} defaultValue="">
                    <option value="" disabled>Selecciona…</option>
                    {options.map(o => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                </label>
              );
            }
            // Si no es FK, input normal
            return (
              <label key={col.name} style={{ display:'grid', gap:4 }}>
                {col.name}
                {col.type === 'textarea' ? (
                  <textarea {...register(col.name, { required: col.required })} />
                ) : (
                  <input type={col.type} step="any" {...register(col.name, { required: col.required })} />
                )}
              </label>
            );
          })}
          <div style={{ display:'flex', gap:8 }}>
            <button type='submit'>{editing ? 'Actualizar' : 'Crear'}</button>
            {editing && <button type='button' onClick={()=>{ setEditing(null); reset(); }}>Cancelar</button>}
          </div>
        </form>
      </div>

      {/* LISTA */}
      <div style={{ overflowX:'auto' }}>
        <table border='1' cellPadding='6'>
          <thead>
            <tr>
              {meta?.columns.map(c => <th key={c.Field}>{c.Field}</th>)}
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, idx) => (
              <tr key={idx}>
                {meta?.columns.map(c => (
                  <td key={c.Field}>
                    {displayCell(c.Field, r[c.Field])}
                  </td>
                ))}
                <td>
                  <button onClick={()=>{ setEditing(r); reset(r); }}>
                    Editar
                  </button>
                  <button onClick={()=> onDelete(r[pk])}>
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

