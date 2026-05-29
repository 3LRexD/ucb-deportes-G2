
import type { Equipo } from "@/types/equipos.types";
import DelegadoSection from "./DelegadoSection";
import JugadoresSection from "./JugadoresSection";

interface Props {
  equipo: Equipo;
  onActualizado: () => Promise<void>;
  onCerrar: () => void;
}

export default function EquipoResumenPanel({ equipo, onActualizado, onCerrar }: Props) {
  const totalJugadores = equipo.jugadores.length;
  const validados = equipo.jugadores.filter((j) => j.matricula_validada).length;

  return (
    <div className="flex flex-col h-full">
      {/* Header del panel */}
      <div className="bg-[#0a1628] text-white p-5 rounded-t-2xl">
        <div className="flex items-start justify-between">
          <div className="min-w-0">
            <h2 className="font-bold text-lg truncate">{equipo.nombre}</h2>
            {equipo.carrera_nombre && (
              <p className="text-blue-300 text-sm mt-0.5">{equipo.carrera_nombre}</p>
            )}
          </div>
          <button
            onClick={onCerrar}
            className="shrink-0 text-blue-300 hover:text-white transition-colors ml-3"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Stats rápidos */}
        <div className="grid grid-cols-2 gap-3 mt-4">
          <div className="bg-white/10 rounded-xl px-3 py-2.5 text-center">
            <p className="text-2xl font-bold">{totalJugadores}</p>
            <p className="text-xs text-blue-200 mt-0.5">Jugadores</p>
          </div>
          <div className="bg-white/10 rounded-xl px-3 py-2.5 text-center">
            <p className="text-2xl font-bold">{validados}</p>
            <p className="text-xs text-blue-200 mt-0.5">Validados</p>
          </div>
        </div>
      </div>

      {/* Contenido scrollable */}
      <div className="flex-1 overflow-y-auto p-5 space-y-5 bg-white rounded-b-2xl">
        {/* Sección delegado */}
        <DelegadoSection equipo={equipo} onActualizado={onActualizado} />

        {/* Línea divisoria */}
        <hr className="border-gray-200" />

        {/* Sección jugadores */}
        <JugadoresSection equipo={equipo} onActualizado={onActualizado} />
      </div>
    </div>
  );
}
