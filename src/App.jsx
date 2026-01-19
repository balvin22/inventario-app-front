import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './layouts/Layout';
import Productos from './pages/Productos';
import Movimientos from './pages/Movimientos';
import Configuracion from './pages/Configuracion';
import Dashboard from './pages/Dashboard';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} /> {/* <--- 2. Usar el componente real */}
          <Route path="productos" element={<Productos />} />
          <Route path="movimientos" element={<Movimientos />} />
          <Route path="configuracion" element={<Configuracion />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
