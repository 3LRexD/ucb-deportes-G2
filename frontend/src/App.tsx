import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from '@/components/layout/AdminLayout';
import DelegadoLayout from '@/components/layout/DelegadoLayout';

// Páginas Admin
import EquiposPage from '@/pages/admin/EquiposPage';

// Páginas Delegado
import MiEquipoPage from '@/pages/delegado/MiEquipoPage';

// Placeholders para páginas aún no desarrolladas
const Placeholder = ({ titulo }: { titulo: string }) => (
  <div className="flex items-center justify-center h-64">
    <div className="text-center text-gray-400">
      <p className="text-lg font-semibold">{titulo}</p>
      <p className="text-sm">Próximamente en el Sprint 2 ó 3</p>
    </div>
  </div>
);

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Redirect raíz */}
        <Route path="/" element={<Navigate to="/admin/equipos" replace />} />

        {/* ── RUTAS ADMIN ─── */}
        <Route
          path="/admin/*"
          element={
            <AdminLayout>
              <Routes>
                <Route path="equipos"       element={<EquiposPage />} />
                <Route path="torneos"       element={<Placeholder titulo="Torneos" />} />
                <Route path="inscripciones" element={<Placeholder titulo="Inscripciones" />} />
                <Route path="fixtures"      element={<Placeholder titulo="Fixtures" />} />
                <Route path="resultados"    element={<Placeholder titulo="Resultados" />} />
                <Route path="tabla"         element={<Placeholder titulo="Tabla de Posiciones" />} />
                <Route path="calendario"    element={<Placeholder titulo="Calendario" />} />
                <Route path="config"        element={<Placeholder titulo="Configuración" />} />
                <Route path="*"             element={<Navigate to="equipos" replace />} />
              </Routes>
            </AdminLayout>
          }
        />

        {/* ── RUTAS DELEGADO ──── */}
        <Route
          path="/delegado/*"
          element={
            <DelegadoLayout>
              <Routes>
                <Route path="mi-equipo"  element={<MiEquipoPage />} />
                <Route path="calendario" element={<Placeholder titulo="Calendario de Partidos" />} />
                <Route path="fixtures"   element={<Placeholder titulo="Fixtures del Torneo" />} />
                <Route path="*"          element={<Navigate to="mi-equipo" replace />} />
              </Routes>
            </DelegadoLayout>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}