import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout    from '@/components/layout/AdminLayout';
import DelegadoLayout from '@/components/layout/DelegadoLayout';
import EquiposPage    from '@/pages/admin/EquiposPage';
import MiEquipoPage   from '@/pages/delegado/MiEquipoPage';
import TorneosPage    from '@/pages/admin/TorneosPage';
import ResultadosPage from '@/pages/admin/ResultadosPage';
import FixturePage    from '@/pages/admin/FixturePage';
import AsistenciaPage from './pages/admin/AsistenciaPage';


// ── Placeholder para rutas futuras ────────────────────────────────────────────
const Placeholder = ({ titulo }: { titulo: string }) => (
  <div className="flex flex-col items-center justify-center h-64 text-gray-400">
    <p className="text-lg font-semibold">{titulo}</p>
    <p className="text-sm mt-1">Próximamente en un sprint futuro</p>
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/admin/torneos" replace />} />

        {/* ── Zona Admin ─────────────────────────────────────────────────── */}
        <Route
          path="/admin/*"
          element={
            <AdminLayout>
              <Routes>
                <Route path="equipos"    element={<EquiposPage />} />
                <Route path="torneos"    element={<TorneosPage />} />
                <Route path="resultados" element={<ResultadosPage />} />
                <Route path="fixtures"   element={<FixturePage />} />
                <Route path="asistencia" element={<AsistenciaPage />} />
                <Route path="tabla"      element={<Placeholder titulo="Tabla de Posiciones" />} />
                <Route path="calendario" element={<Placeholder titulo="Calendario" />} />
                <Route path="config"     element={<Placeholder titulo="Configuración" />} />
                <Route path="*"          element={<Navigate to="torneos" replace />} />
              </Routes>
            </AdminLayout>
          }
        />

        {/* ── Zona Delegado ───────────────────────────────────────────────── */}
        <Route
          path="/delegado/*"
          element={
            <DelegadoLayout>
              <Routes>
                <Route path="mi-equipo"  element={<MiEquipoPage />} />
                <Route path="fixtures"   element={<Placeholder titulo="Fixtures del Torneo" />} />
                <Route path="calendario" element={<Placeholder titulo="Calendario de Partidos" />} />
                <Route path="*"          element={<Navigate to="mi-equipo" replace />} />
              </Routes>
            </DelegadoLayout>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
