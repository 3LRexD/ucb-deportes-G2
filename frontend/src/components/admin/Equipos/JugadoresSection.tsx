import { useState, useRef } from "react";

import JugadorRow from "./JugadorRow";
import type { Equipo } from "@/types/equipos.types";
import { useJugadores } from "@/hooks/useJugadores";

interface Props {
  equipo: Equipo;
  onActualizado: () => Promise<void>;
}

export default function JugadoresSection({ equipo, onActualizado }: Props) {
  const [ciInput, setCiInput] = useState("");
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const {
    buscando,
    busquedaResult,
    errorJugador,
    agregando,
    buscarPorCI,
    limpiarBusqueda,
    agregarJugador,
    quitarJugador,
  } = useJugadores(onActualizado);

  const handleBuscar = () => {
    buscarPorCI(ciInput);
  };

  const handleAgregar = async () => {
    if (!busquedaResult) return;
    await agregarJugador(equipo.id_equipo, busquedaResult.ci);
    setCiInput("");
    limpiarBusqueda();
    inputRef.current?.focus();
  };

  const handleQuitar = (jugadorId: number) => {
    quitarJugador(equipo.id_equipo, jugadorId);
  };

  const handleCancelarBusqueda = () => {
    setCiInput("");
    limpiarBusqueda();
    setMostrarFormulario(false);
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
          <svg className="w-4 h-4 text-[#1e3a5f]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0" />
          </svg>
          Jugadores
          <span className="text-xs font-normal text-gray-400">
            ({equipo.jugadores.length})
          </span>
        </h3>

        {!mostrarFormulario && (
          <button
            onClick={() => { setMostrarFormulario(true); setTimeout(() => inputRef.current?.focus(), 50); }}
            className="flex items-center gap-1 text-xs text-[#1e3a5f] hover:underline font-medium"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Añadir jugador
          </button>
        )}
      </div>

      {/* Formulario de búsqueda por CI */}
      {mostrarFormulario && (
        <div className="mb-4 bg-blue-50 border border-blue-200 rounded-xl p-4 space-y-3">
          <p className="text-xs text-blue-700 font-medium">Buscar deportista por Carnet de Identidad</p>

          <div className="flex gap-2">
            <input
              ref={inputRef}
              type="text"
              value={ciInput}
              onChange={(e) => { setCiInput(e.target.value); limpiarBusqueda(); }}
              onKeyDown={(e) => e.key === "Enter" && handleBuscar()}
              placeholder="Ej: 11111111"
              className="flex-1 text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1e3a5f] bg-white"
            />
            <button
              onClick={handleBuscar}
              disabled={buscando || !ciInput.trim()}
              className="px-4 py-2 bg-[#0a1628] text-white text-sm rounded-lg hover:bg-[#1e3a5f] disabled:opacity-50 transition-colors"
            >
              {buscando ? (
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : "Buscar"}
            </button>
          </div>

          {errorJugador && (
            <p className="text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2">{errorJugador}</p>
          )}

          {busquedaResult && (
            <div className={`bg-white rounded-lg border p-3 flex items-center justify-between gap-3 ${busquedaResult.matricula_activa ? "border-green-200" : "border-yellow-200"}`}>
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-800">{busquedaResult.nombre}</p>
                <p className="text-xs text-gray-500">{busquedaResult.carrera}</p>
                <span className={`inline-block mt-1 text-xs px-2 py-0.5 rounded-full font-medium ${busquedaResult.matricula_activa ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                  {busquedaResult.matricula_activa ? "Matrícula activa ✓" : "Sin matrícula activa ⚠"}
                </span>
              </div>
              <button
                onClick={handleAgregar}
                disabled={agregando}
                className="shrink-0 text-sm bg-[#0a1628] text-white px-3 py-1.5 rounded-lg hover:bg-[#1e3a5f] disabled:opacity-50 transition-colors"
              >
                {agregando ? "Agregando..." : "Agregar"}
              </button>
            </div>
          )}

          <button onClick={handleCancelarBusqueda} className="text-xs text-gray-400 hover:text-gray-600">
            Cancelar
          </button>
        </div>
      )}

      {/* Tabla de jugadores */}
      {equipo.jugadores.length > 0 ? (
        <div className="overflow-hidden rounded-xl border border-gray-200">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="py-2.5 px-4 text-left text-xs font-semibold text-gray-500 w-8">#</th>
                <th className="py-2.5 px-4 text-left text-xs font-semibold text-gray-500">Jugador</th>
                <th className="py-2.5 px-4 text-left text-xs font-semibold text-gray-500">Camiseta</th>
                <th className="py-2.5 px-4 text-left text-xs font-semibold text-gray-500">Posición</th>
                <th className="py-2.5 px-4 text-left text-xs font-semibold text-gray-500">Matrícula</th>
                <th className="py-2.5 px-4" />
              </tr>
            </thead>
            <tbody>
              {equipo.jugadores.map((jugador, i) => (
                <JugadorRow
                  key={jugador.id_equipo_jugador}
                  jugador={jugador}
                  index={i}
                  onQuitar={handleQuitar}
                />
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-8 text-gray-400">
          <svg className="w-10 h-10 mx-auto mb-2 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0" />
          </svg>
          <p className="text-sm">No hay jugadores inscritos aún</p>
        </div>
      )}
    </div>
  );
}
