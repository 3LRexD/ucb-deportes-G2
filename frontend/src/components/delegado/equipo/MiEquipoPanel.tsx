import JugadoresSection from "@/components/admin/Equipos/JugadoresSection";
import type { Delegado, Equipo } from "@/types/equipos.types";

interface Props {
  equipo: Equipo;
  delegado: Delegado;
  onActualizado: () => Promise<void>;
}

export default function MiEquipoPanel({ equipo, delegado, onActualizado }: Props) {
  const totalJugadores = equipo.jugadores.length;
  const validados = equipo.jugadores.filter((j) => j.matricula_validada).length;
  const pendientes = totalJugadores - validados;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header del equipo */}
      <div className="bg-[#0a1628] text-white rounded-2xl p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-blue-300 text-sm font-medium">Mi equipo</p>
            <h1 className="text-2xl font-bold mt-1">{equipo.nombre}</h1>
            {equipo.carrera_nombre && (
              <p className="text-blue-200 text-sm mt-1">{equipo.carrera_nombre}</p>
            )}
          </div>

          {/* Delegado badge */}
          <div className="bg-white/10 rounded-xl px-4 py-2 text-right">
            <p className="text-xs text-blue-300">Delegado</p>
            <p className="text-sm font-semibold mt-0.5">{delegado.nombre_completo}</p>
          </div>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-3 gap-3 mt-5">
          <div className="bg-white/10 rounded-xl px-4 py-3 text-center">
            <p className="text-2xl font-bold">{totalJugadores}</p>
            <p className="text-xs text-blue-200 mt-0.5">Total jugadores</p>
          </div>
          <div className="bg-white/10 rounded-xl px-4 py-3 text-center">
            <p className="text-2xl font-bold text-green-300">{validados}</p>
            <p className="text-xs text-blue-200 mt-0.5">Validados</p>
          </div>
          <div className="bg-white/10 rounded-xl px-4 py-3 text-center">
            <p className="text-2xl font-bold text-yellow-300">{pendientes}</p>
            <p className="text-xs text-blue-200 mt-0.5">Pendientes</p>
          </div>
        </div>
      </div>

      {/* Aviso si hay pendientes */}
      {pendientes > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl px-4 py-3 flex gap-3 items-start">
          <svg className="w-5 h-5 text-yellow-600 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <div>
            <p className="text-sm font-medium text-yellow-800">
              {pendientes} jugador{pendientes !== 1 ? "es" : ""} sin matrícula validada
            </p>
            <p className="text-xs text-yellow-600 mt-0.5">
              Los jugadores sin matrícula activa podrían no ser habilitados para competir.
            </p>
          </div>
        </div>
      )}

      {/* Lista de jugadores con la misma sección reutilizada */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <JugadoresSection equipo={equipo} onActualizado={onActualizado} />
      </div>
    </div>
  );
}
