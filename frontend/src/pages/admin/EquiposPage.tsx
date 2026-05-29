import { useState } from "react";
import { useEquipos } from "../../hooks/useEquipos";
import EquipoResumenPanel from "@/components/admin/Equipos/EquipoResumenPanel";
import CrearEquipoModal from "@/components/admin/Equipos/CrearEquipoModal";
import EquipoCard from "@/components/admin/Equipos/EquipoCard";


export default function EquiposPage() {
  const {
    equipos,
    torneos,
    torneoSeleccionado,
    equipoActivo,
    loading,
    error,
    setTorneoSeleccionado,
    setEquipoActivo,
    crearEquipo,
    refrescarEquipos,
  } = useEquipos();

  const [mostrarModal, setMostrarModal] = useState(false);

  const handleSeleccionarEquipo = (equipo: typeof equipoActivo) => {
    setEquipoActivo(equipo?.id_equipo === equipoActivo?.id_equipo ? null : equipo);
  };

  return (
    <div className="h-full flex flex-col">
      {/* ── Barra superior: título + selector de torneo + botón crear ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Equipos</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {equipos.length} equipo{equipos.length !== 1 ? "s" : ""} registrado{equipos.length !== 1 ? "s" : ""}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Selector de torneo */}
          <select
            value={torneoSeleccionado?.id_torneo ?? ""}
            onChange={(e) => {
              const t = torneos.find((t) => t.id_torneo === Number(e.target.value));
              if (t) setTorneoSeleccionado(t);
            }}
            className="text-sm border border-gray-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1e3a5f] bg-white"
          >
            {torneos.map((t) => (
              <option key={t.id_torneo} value={t.id_torneo}>
                {t.nombre}
              </option>
            ))}
          </select>

          {/* Botón crear */}
          {torneoSeleccionado && (
            <button
              onClick={() => setMostrarModal(true)}
              className="flex items-center gap-2 bg-[#0a1628] text-white text-sm font-medium px-4 py-2 rounded-xl hover:bg-[#1e3a5f] transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Registrar equipo
            </button>
          )}
        </div>
      </div>

      {/* ── Chip de info del torneo seleccionado ── */}
      {torneoSeleccionado && (
        <div className="flex flex-wrap gap-2 mb-5">
          <span className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-medium">
            {torneoSeleccionado.disciplina_nombre}
          </span>
          <span className="text-xs bg-gray-100 text-gray-600 px-3 py-1 rounded-full">
            {torneoSeleccionado.tipo === "intercarreras" ? "Intercarreras" : torneoSeleccionado.tipo}
          </span>
          <span className={`text-xs px-3 py-1 rounded-full font-medium ${
            torneoSeleccionado.estado === "en_curso"
              ? "bg-green-100 text-green-700"
              : torneoSeleccionado.estado === "planificado"
              ? "bg-yellow-100 text-yellow-700"
              : "bg-gray-100 text-gray-600"
          }`}>
            {torneoSeleccionado.estado.replace("_", " ")}
          </span>
        </div>
      )}

      {/* ── Layout principal: lista + panel ── */}
      {error && (
        <div className="bg-red-50 text-red-700 text-sm px-4 py-3 rounded-xl mb-4">{error}</div>
      )}

      <div className="flex-1 flex gap-5 min-h-0">
        {/* Lista de equipos */}
        <div className={`flex flex-col gap-3 overflow-y-auto transition-all duration-300 ${equipoActivo ? "w-72 shrink-0" : "flex-1"}`}>
          {loading ? (
            // Skeletons
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-24 bg-gray-100 rounded-xl animate-pulse" />
            ))
          ) : equipos.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-400 py-16">
              <svg className="w-16 h-16 mb-4 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0" />
              </svg>
              <p className="text-base font-medium">Sin equipos registrados</p>
              <p className="text-sm mt-1">Haz clic en "Registrar equipo" para comenzar</p>
            </div>
          ) : (
            equipos.map((equipo) => (
              <EquipoCard
                key={equipo.id_equipo}
                equipo={equipo}
                activo={equipoActivo?.id_equipo === equipo.id_equipo}
                onClick={() => handleSeleccionarEquipo(equipo)}
              />
            ))
          )}
        </div>

        {/* Panel de detalle */}
        {equipoActivo && (
          <div className="flex-1 min-h-0 rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <EquipoResumenPanel
              equipo={equipoActivo}
              onActualizado={refrescarEquipos}
              onCerrar={() => setEquipoActivo(null)}
            />
          </div>
        )}
      </div>

      {/* ── Modal crear equipo ── */}
      {mostrarModal && torneoSeleccionado && (
        <CrearEquipoModal
          torneo={torneoSeleccionado}
          equiposExistentes={equipos}
          onCrear={crearEquipo}
          onCerrar={() => setMostrarModal(false)}
        />
      )}
    </div>
  );
}
