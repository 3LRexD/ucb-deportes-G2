
import { useState } from "react";
import * as service from "@/services/equiposService";
import type { Delegado, Equipo } from "@/types/equipos.types";

interface Props {
  equipo: Equipo;
  onActualizado: () => Promise<void>;
}

export default function DelegadoSection({ equipo, onActualizado }: Props) {
  const [modo, setModo] = useState<"ver" | "asignar">("ver");
  const [ci, setCi] = useState("");
  const [buscando, setBuscando] = useState(false);
  const [preview, setPreview] = useState<Delegado | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);

  const handleBuscar = async () => {
    if (!ci.trim()) return;
    setBuscando(true);
    setError(null);
    setPreview(null);
    try {
      const resultado = await service.buscarUsuarioPorCI(ci.trim());
      if (!resultado) {
        setError("No se encontró un usuario con ese CI. Solo usuarios registrados pueden ser delegados.");
      } else {
        setPreview(resultado);
      }
    } catch {
      setError("Error al buscar el usuario");
    } finally {
      setBuscando(false);
    }
  };

  const handleConfirmar = async () => {
    if (!preview) return;
    setGuardando(true);
    try {
      await service.asignarDelegado(equipo.id_equipo, { ci: preview.ci });
      await onActualizado();
      setModo("ver");
      setCi("");
      setPreview(null);
    } catch (e: any) {
      setError(e?.message ?? "No se pudo asignar el delegado");
    } finally {
      setGuardando(false);
    }
  };

  const handleCancelar = () => {
    setModo("ver");
    setCi("");
    setPreview(null);
    setError(null);
  };

  return (
    <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
          <svg className="w-4 h-4 text-[#1e3a5f]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          Delegado
        </h3>

        {modo === "ver" && (
          <button
            onClick={() => setModo("asignar")}
            className="text-xs text-[#1e3a5f] hover:underline font-medium"
          >
            {equipo.delegado ? "Cambiar delegado" : "+ Asignar delegado"}
          </button>
        )}
      </div>

      {/* Vista actual del delegado */}
      {modo === "ver" && (
        <>
          {equipo.delegado ? (
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-[#0a1628] flex items-center justify-center text-white text-sm font-bold shrink-0">
                {equipo.delegado.nombre_completo.charAt(0)}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">
                  {equipo.delegado.nombre_completo}
                </p>
                <p className="text-xs text-gray-500">CI: {equipo.delegado.ci}</p>
                <p className="text-xs text-gray-400 truncate">{equipo.delegado.email}</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-400 italic">Sin delegado asignado</p>
          )}
        </>
      )}

      {/* Formulario asignación */}
      {modo === "asignar" && (
        <div className="space-y-3">
          <div className="flex gap-2">
            <input
              type="text"
              value={ci}
              onChange={(e) => { setCi(e.target.value); setError(null); setPreview(null); }}
              onKeyDown={(e) => e.key === "Enter" && handleBuscar()}
              placeholder="Ingrese CI del delegado"
              className="flex-1 text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1e3a5f] focus:border-transparent"
            />
            <button
              onClick={handleBuscar}
              disabled={buscando || !ci.trim()}
              className="px-3 py-2 bg-[#0a1628] text-white text-sm rounded-lg hover:bg-[#1e3a5f] disabled:opacity-50 transition-colors"
            >
              {buscando ? (
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : (
                "Buscar"
              )}
            </button>
          </div>

          {error && (
            <p className="text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>
          )}

          {preview && (
            <div className="bg-white border border-green-200 rounded-lg p-3 flex items-center justify-between gap-2">
              <div>
                <p className="text-sm font-medium text-gray-800">{preview.nombre_completo}</p>
                <p className="text-xs text-gray-500">{preview.email}</p>
              </div>
              <button
                onClick={handleConfirmar}
                disabled={guardando}
                className="shrink-0 text-xs bg-green-600 text-white px-3 py-1.5 rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
              >
                {guardando ? "Guardando..." : "Confirmar"}
              </button>
            </div>
          )}

          <button
            onClick={handleCancelar}
            className="text-xs text-gray-400 hover:text-gray-600"
          >
            Cancelar
          </button>
        </div>
      )}
    </div>
  );
}
