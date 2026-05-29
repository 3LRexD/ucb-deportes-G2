import { useState, useCallback } from "react";
import type { Equipo, Delegado } from "../../types/equipos.types";
import { loginDelegado, getEquiposByTorneo } from "../../services/equiposService";

import MiEquipoPanel from "../../components/delegado/equipo/MiEquipoPanel";
import LoginDelegadoForm from "@/components/delegado/equipo/InscribirJugadorForm";

type Sesion = { delegado: Delegado; equipo: Equipo } | null;

export default function MiEquipoPage() {
  const [sesion, setSesion] = useState<Sesion>(null);
  const [errorLogin, setErrorLogin] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);

  const handleLogin = async (ci: string, password: string) => {
    setCargando(true);
    setErrorLogin(null);
    try {
      const resultado = await loginDelegado(ci, password);
      if (!resultado) {
        setErrorLogin("CI o contraseña incorrectos, o no tienes un equipo asignado.");
        return;
      }
      setSesion(resultado);
    } catch {
      setErrorLogin("Error al iniciar sesión. Intenta de nuevo.");
    } finally {
      setCargando(false);
    }
  };

  // Refresca el equipo desde la fuente de datos
  const handleActualizado = useCallback(async () => {
    if (!sesion) return;
    const equipos = await getEquiposByTorneo(sesion.equipo.torneo_id);
    const actualizado = equipos.find((e) => e.id_equipo === sesion.equipo.id_equipo);
    if (actualizado) {
      setSesion((prev) => prev ? { ...prev, equipo: actualizado } : prev);
    }
  }, [sesion]);

  const handleLogout = () => setSesion(null);

  // Sin sesión → pantalla de login
  if (!sesion) {
    return (
      <LoginDelegadoForm
        onLogin={handleLogin}
        error={errorLogin}
        cargando={cargando}
      />
    );
  }

  // Con sesión → panel del equipo
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar mínima del delegado */}
      <header className="bg-[#0a1628] text-white px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0" />
            </svg>
          </div>
          <div>
            <p className="text-xs text-blue-300">Sistema Deportivo UCB</p>
            <p className="text-sm font-semibold">Portal Delegado</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-sm text-blue-200 hidden sm:block">
            {sesion.delegado.nombre_completo}
          </span>
          <button
            onClick={handleLogout}
            className="text-xs bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg transition-colors"
          >
            Cerrar sesión
          </button>
        </div>
      </header>

      <main className="p-6">
        <MiEquipoPanel
          equipo={sesion.equipo}
          delegado={sesion.delegado}
          onActualizado={handleActualizado}
        />
      </main>
    </div>
  );
}
