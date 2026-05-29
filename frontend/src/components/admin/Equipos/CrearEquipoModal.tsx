import { getCarreras } from "@/services/equiposService";
import type { Carrera, CrearEquipoPayload, Torneo } from "@/types/equipos.types";
import { useState, useEffect } from "react";


interface Props {
  torneo: Torneo;
  equiposExistentes: { carrera_id: number | null }[];
  onCrear: (payload: CrearEquipoPayload) => Promise<void>;
  onCerrar: () => void;
}

export default function CrearEquipoModal({ torneo, equiposExistentes, onCrear, onCerrar }: Props) {
  const [carreras, setCarreras] = useState<Carrera[]>([]);
  const [nombre, setNombre] = useState("");
  const [carreraId, setCarreraId] = useState<number | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const esIntercarreras = torneo.tipo === "intercarreras";

  // IDs de carreras que ya tienen equipo en este torneo
  const carrerasOcupadas = new Set(
    equiposExistentes.map((e) => e.carrera_id).filter(Boolean)
  );

  useEffect(() => {
    if (esIntercarreras) {
      getCarreras().then(setCarreras);
    }
  }, [esIntercarreras]);

  // Auto-completar nombre cuando se selecciona carrera
  const handleCarreraChange = (id: number) => {
    setCarreraId(id);
    const carrera = carreras.find((c) => c.id_carrera === id);
    if (carrera && !nombre) {
      setNombre(`${carrera.nombre}`);
    }
  };

  const handleSubmit = async () => {
    setError(null);
    if (!nombre.trim()) {
      setError("El nombre del equipo es requerido");
      return;
    }
    if (esIntercarreras && !carreraId) {
      setError("Debes seleccionar una carrera para torneos intercarreras");
      return;
    }

    setGuardando(true);
    try {
      await onCrear({ nombre: nombre.trim(), torneo_id: torneo.id_torneo, carrera_id: carreraId });
      onCerrar();
    } catch {
      setError("No se pudo crear el equipo. Intenta de nuevo.");
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onCerrar}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 animate-fade-in">
        {/* Header */}
        <div className="flex items-start justify-between mb-5">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Registrar equipo</h2>
            <p className="text-sm text-gray-500 mt-0.5">
              Torneo: <span className="font-medium text-[#1e3a5f]">{torneo.nombre}</span>
            </p>
          </div>
          <button
            onClick={onCerrar}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-4">
          {/* Selector de carrera (solo intercarreras) */}
          {esIntercarreras && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Carrera <span className="text-red-500">*</span>
              </label>
              <select
                value={carreraId ?? ""}
                onChange={(e) => handleCarreraChange(Number(e.target.value))}
                className="w-full text-sm border border-gray-300 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#1e3a5f] bg-white"
              >
                <option value="">Selecciona una carrera</option>
                {carreras.map((c) => (
                  <option
                    key={c.id_carrera}
                    value={c.id_carrera}
                    disabled={carrerasOcupadas.has(c.id_carrera)}
                  >
                    {c.nombre} {carrerasOcupadas.has(c.id_carrera) ? "(ya tiene equipo)" : ""}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-xs text-gray-400">
                Las carreras ya ocupadas no están disponibles. Solo se permite un equipo por carrera.
              </p>
            </div>
          )}

          {/* Nombre del equipo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Nombre del equipo <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={nombre}
              onChange={(e) => { setNombre(e.target.value); setError(null); }}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              placeholder={esIntercarreras ? "Ej: Sistemas FC" : "Nombre del equipo"}
              className="w-full text-sm border border-gray-300 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]"
            />
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 rounded-xl px-4 py-2.5">{error}</p>
          )}
        </div>

        {/* Acciones */}
        <div className="flex gap-3 mt-6">
          <button
            onClick={onCerrar}
            className="flex-1 py-2.5 text-sm font-medium text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={guardando}
            className="flex-1 py-2.5 text-sm font-medium text-white bg-[#0a1628] rounded-xl hover:bg-[#1e3a5f] disabled:opacity-50 transition-colors"
          >
            {guardando ? "Creando..." : "Crear equipo"}
          </button>
        </div>
      </div>
    </div>
  );
}
