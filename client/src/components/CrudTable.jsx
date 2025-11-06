import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import {
  Box,
  Typography,
  Paper,
  TextField,
  MenuItem,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Stack,
  IconButton,
  Tooltip,
  Divider,
  Chip,
  Grid,  
} from "@mui/material";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import CancelIcon from "@mui/icons-material/Cancel";
import SaveIcon from "@mui/icons-material/Save";
import { api } from "../api";

// === Configuración de llaves foráneas (idéntico al tuyo)
const fkConfigGlobal = {
  libros: {
    id_editorial: { refTable: "editorial", refPk: "id_editorial", labelFields: ["nom_editorial"] },
  },
  prestamo: {
    id_usuarios: { refTable: "usuarios", refPk: "id_usuarios", labelFields: ["nom_usuarios", "apell_usuarios"] },
    id_biblio: { refTable: "bibliotecario", refPk: "id_biblio", labelFields: ["nombre_biblio", "apellido_biblio"] },
  },
  correo_usuario: {
    id_usuario: { refTable: "usuarios", refPk: "id_usuarios", labelFields: ["nom_usuarios", "apell_usuarios"] },
  },
  direccion_usuario: {
    id_usuario: { refTable: "usuarios", refPk: "id_usuarios", labelFields: ["nom_usuarios", "apell_usuarios"] },
  },
  documento_usuario: {
    id_usuario: { refTable: "usuarios", refPk: "id_usuarios", labelFields: ["nom_usuarios", "apell_usuarios"] },
  },
  telefono_usuario: {
    id_usuario: { refTable: "usuarios", refPk: "id_usuarios", labelFields: ["nom_usuarios", "apell_usuarios"] },
  },
  correo_bibliotecario: {
    id_biblio: { refTable: "bibliotecario", refPk: "id_biblio", labelFields: ["nombre_biblio", "apellido_biblio"] },
  },
  telefono_bibliotecario: {
    id_biblio: { refTable: "bibliotecario", refPk: "id_biblio", labelFields: ["nombre_biblio", "apellido_biblio"] },
  },
  horario_bibliotecario: {
    id_biblio: { refTable: "bibliotecario", refPk: "id_biblio", labelFields: ["nombre_biblio", "apellido_biblio"] },
  },
  libro_autor: {
    id_libro: { refTable: "libros", refPk: "id_libro", labelFields: ["nombre_libro"] },
    id_autor: { refTable: "autores", refPk: "id_autor", labelFields: ["nombre_autor"] },
  },
  detalles_prestamo: {
    id_libro: { refTable: "libros", refPk: "id_libro", labelFields: ["nombre_libro"] },
    id_prestamo: { refTable: "prestamo", refPk: "id_prestamo", labelFields: ["id_prestamo"] },
  },
};

export default function CrudTable({ table }) {
  const [meta, setMeta] = useState(null);
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [editing, setEditing] = useState(null);
  const [fkOptions, setFkOptions] = useState({});
  const { register, handleSubmit, reset, setValue } = useForm({ shouldUnregister: true });

  const fkConfig = fkConfigGlobal[table] ?? {};
  const pk = meta?.pk;

  // === Funciones auxiliares (idénticas)
  function inferType(mysqlType) {
    const t = (mysqlType || "").toLowerCase();
    if (t.includes("int") || t.includes("decimal") || t.includes("float") || t.includes("double")) return "number";
    if (t.includes("datetime") || t.includes("timestamp")) return "datetime-local";
    if (t.includes("date")) return "date";
    if (t.includes("text")) return "textarea";
    return "text";
  }

  function buildLabel(row, fields) {
    if (!fields?.length) return String(row?.id ?? "");
    return fields.map((f) => row?.[f]).filter(Boolean).join(" ");
  }

  function displayCell(col, value) {
    if (fkConfig[col] && fkOptions[col]) {
      const opt = fkOptions[col].find((o) => String(o.value) === String(value));
      if (opt) return opt.label;
    }
    return String(value ?? "");
  }

  // === Carga de datos
  const load = async () => {
    const m = await api.get(`/meta/${table}`).then((r) => r.data);
    setMeta(m);
    const list = await api.get(`/${table}?limit=200&offset=0`).then((r) => r.data);
    setRows(list.data);
    setTotal(list.total);
  };

  useEffect(() => {
    reset({});
    load();
  }, [table]);

  useEffect(() => {
    const loadFkOptions = async () => {
      const entries = Object.entries(fkConfig);
      if (!entries.length) return;
      const newMap = {};
      for (const [col, def] of entries) {
        const resp = await api.get(`/${def.refTable}?limit=1000&offset=0`).then((r) => r.data);
        const options = (resp?.data ?? []).map((item) => ({
          value: item[def.refPk],
          label: buildLabel(item, def.labelFields),
          raw: item,
        }));
        newMap[col] = options;
      }
      setFkOptions(newMap);
    };
    loadFkOptions();
  }, [table]);

  // === Columnas de formulario
  const formCols = useMemo(() => {
    if (!meta) return [];
    return meta.columns
      .filter((c) => c.Field !== pk)
      .map((c) => ({
        name: c.Field,
        type: inferType(c.Type),
        required: c.Null === "NO" && c.Default == null,
      }));
  }, [meta, pk]);

  // === CRUD
  async function sanitizeAndSubmit(data, method, id) {
    const payload = { ...data };
    for (const [key, val] of Object.entries(payload)) {
      if (val === "") payload[key] = null;
    }
    if (method === "POST") await api.post(`/${table}`, payload);
    else await api.put(`/${table}/${id}`, payload);
    reset();
    setEditing(null);
    await load();
  }

  const onDelete = async (id) => {
    if (!confirm("¿Eliminar registro?")) return;
    await api.delete(`/${table}/${id}`);
    await load();
  };

  // === Precarga valores al editar
  useEffect(() => {
    if (!editing) return;
    Object.keys(fkConfig).forEach((col) => {
      if (editing[col] != null) setValue(col, String(editing[col]));
    });
  }, [editing]);

  return (
    <Box>
      {/* HEADER */}
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
        <Typography variant="h5" fontWeight={700}>
          Tabla: {table}
        </Typography>
        <Chip label={`${total} registros`} color="primary" variant="outlined" />
      </Stack>

      {/* FORM */}
      <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
        <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
          {editing ? "Editar registro" : "Crear nuevo registro"}
        </Typography>

        <Box
          component="form"
          onSubmit={handleSubmit((data) =>
            editing ? sanitizeAndSubmit(data, "PUT", editing[pk]) : sanitizeAndSubmit(data, "POST")
          )}
        >
          <Grid container spacing={2}>
            {formCols.map((col) => {
              const fkDef = fkConfig[col.name];
              if (fkDef) {
  const options = fkOptions[col.name] ?? [];
  return (
    <Grid item xs={12} sm={6} key={col.name}>
      <TextField
        select
        fullWidth
        size="small"
        label={col.name.replace(/^id_/, "").replaceAll("_", " ").toUpperCase()} // etiqueta más limpia
        defaultValue=""
        InputLabelProps={{ shrink: true }}
        SelectProps={{
          MenuProps: {
            PaperProps: {
              sx: { maxHeight: 260 }, // límite de altura del menú
            },
          },
        }}
        sx={{
          minWidth: 250, // 👈 más ancho al campo
          backgroundColor: "#fff",
          borderRadius: 1,
        }}
        {...register(col.name, { required: col.required })}
      >
        <MenuItem disabled value="">
          Selecciona…
        </MenuItem>
        {options.map((o) => (
          <MenuItem
            key={o.value}
            value={o.value}
            sx={{
              whiteSpace: "normal",
              lineHeight: 1.4,
              fontSize: "0.9rem",
            }}
          >
            {o.label}
          </MenuItem>
        ))}
      </TextField>
    </Grid>
  );
}


              if (col.type === "textarea") {
                return (
                  <Grid item xs={12} key={col.name}>
                    <TextField
                      label={col.name}
                      fullWidth
                      multiline
                      rows={3}
                      {...register(col.name, { required: col.required })}
                    />
                  </Grid>
                );
              }

              return (
  <Grid item xs={12} sm={6} key={col.name}>
    <TextField
      label={col.name}
      type={col.type}
      fullWidth
      size="small"
      // 👇 Esto mejora la visual de los campos de fecha
      InputLabelProps={col.type.includes("date") ? { shrink: true } : {}}
      sx={{ backgroundColor: "#fff", borderRadius: 1 }}
      {...register(col.name, { required: col.required })}
    />
  </Grid>
);
            })}
          </Grid>

          <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
            <Button type="submit" variant="contained" startIcon={editing ? <SaveIcon /> : <AddCircleOutlineIcon />}>
              {editing ? "Actualizar" : "Crear"}
            </Button>
            {editing && (
              <Button
                variant="outlined"
                color="secondary"
                startIcon={<CancelIcon />}
                onClick={() => {
                  setEditing(null);
                  reset();
                }}
              >
                Cancelar
              </Button>
            )}
          </Stack>
        </Box>
      </Paper>

      {/* LISTA */}
      <Paper elevation={1}>
        <TableContainer>
          <Table size="small">
            <TableHead sx={{ bgcolor: "#f9fafb" }}>
              <TableRow>
                {meta?.columns.map((c) => (
                  <TableCell key={c.Field} sx={{ fontWeight: 600 }}>
                    {c.Field}
                  </TableCell>
                ))}
                <TableCell align="center">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((r, idx) => (
                <TableRow key={idx} hover>
                  {meta?.columns.map((c) => (
                    <TableCell key={c.Field}>{displayCell(c.Field, r[c.Field])}</TableCell>
                  ))}
                  <TableCell align="center">
                    <Tooltip title="Editar">
                      <IconButton color="primary" onClick={() => { setEditing(r); reset(r); }}>
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Eliminar">
                      <IconButton color="error" onClick={() => onDelete(r[pk])}>
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
}
