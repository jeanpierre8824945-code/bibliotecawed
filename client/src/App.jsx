import { BrowserRouter, Link, Route, Routes, useParams } from 'react-router-dom';
import CrudTable from './components/CrudTable';

const tablas = [
  'autores',
  'libros',
  'usuarios',
  'editorial',
  'prestamo',

  'correo_usuario',
  'direccion_usuario',
  'documento_usuario',
  'telefono_usuario',

  'bibliotecario',
  'correo_bibliotecario',
  'telefono_bibliotecario',
  'horario_bibliotecario',
];
// quitamos: 'libro_autor', 'detalles_prestamo'


function TablaPage() {
  const { name } = useParams();
  return <CrudTable key={name} table={name} />; // ← clave importante
}


export default function App() {
  return (
    <BrowserRouter>
      <div style={{ display:'grid', gridTemplateColumns:'220px 1fr', minHeight:'100vh' }}>
        <aside style={{ borderRight:'1px solid #eee', padding:12 }}>
          <h3>Tablas</h3>
          <nav style={{ display:'grid', gap:6 }}>
            {tablas.map(t => <Link key={t} to={'/tabla/' + t}>{t}</Link>)}
          </nav>
        </aside>
        <main style={{ padding:16 }}>
          <Routes>
            <Route path='/' element={<p>Elige una tabla a la izquierda.</p>} />
            <Route path='/tabla/:name' element={<TablaPage />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

