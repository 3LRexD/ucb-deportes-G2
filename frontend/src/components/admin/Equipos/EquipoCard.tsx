import type { Equipo } from "@/types/equipos.types";


interface Props {
  equipo: Equipo;
  activo: boolean;
  onClick: () => void;
}

export default function EquipoCard({ equipo, activo, onClick }: Props) {
  const tieneDelegado = equipo.delegado !== null;
  const totalJugadores = equipo.jugadores.length;
  const validados = equipo.jugadores.filter((j) => j.matricula_validada).length;

  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-4 rounded-xl border transition-all duration-200 group ${
        activo
          ? "bg-[#0a1628] border-[#1e3a5f] shadow-lg"
          : "bg-white border-gray-200 hover:border-[#1e3a5f] hover:shadow-md"
      }`}
    >
      {/* Nombre y carrera */}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p
            className={`font-semibold text-sm truncate ${
              activo ? "text-white" : "text-gray-800"
            }`}
          >
            {equipo.nombre}
          </p>
          {equipo.carrera_nombre && (
            <p
              className={`text-xs mt-0.5 truncate ${
                activo ? "text-blue-300" : "text-gray-500"
              }`}
            >
              {equipo.carrera_nombre}
            </p>
          )}
        </div>

        {/* Indicador de estado */}
        <span
          className={`shrink-0 text-xs px-2 py-0.5 rounded-full font-medium ${
            tieneDelegado
              ? activo
                ? "bg-green-900 text-green-300"
                : "bg-green-100 text-green-700"
              : activo
              ? "bg-yellow-900 text-yellow-300"
              : "bg-yellow-100 text-yellow-700"
          }`}
        >
          {tieneDelegado ? "Completo" : "Sin delegado"}
        </span>
      </div>

      {/* Stats */}
      <div className={`mt-3 flex items-center gap-4 text-xs ${activo ? "text-blue-200" : "text-gray-500"}`}>
        <span className="flex items-center gap-1">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0" />
          </svg>
          {totalJugadores} jugador{totalJugadores !== 1 ? "es" : ""}
        </span>
        {totalJugadores > 0 && (
          <span className="flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {validados}/{totalJugadores} validados
          </span>
        )}
      </div>
    </button>
  );
}
