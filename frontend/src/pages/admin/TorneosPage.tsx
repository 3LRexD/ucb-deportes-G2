import React, { useState } from 'react';
import { Tag } from 'lucide-react';
import { useTorneos, useDisciplinas, useCategorias, useTorneoDetalle } from '../../hooks/useTorneos';
import { TorneoCard } from '../../components/admin/torneos/TorneoCard';
import { TorneoFiltros } from '../../components/admin/torneos/TorneoFiltros';
import { CrearTorneoModal } from '../../components/admin/torneos/CrearTorneoModal';
import { CategoriasModal } from '@/components/admin/torneos/CategoriasModal';
import type { Torneo, CreateTorneoDto, TorneoEstado, TablaPosicion } from '../../types/torneos.types';

// ─── Panel lateral de detalle ─────────────────────────────────────────────────
interface DetallePanelProps {
  torneo: Torneo; 
  tabla: TablaPosicion[];
  loading: boolean;
  onClose: () => void;
  onEditar: (t: Torneo) => void;
  onCambiarEstado: (t: Torneo, e: TorneoEstado) => void;
}

const ESTADO_SIGUIENTE: Record<string, { label: string; next: TorneoEstado; cls: string }> = {
  planificado: { label: 'Iniciar torneo',    next: 'en_curso',   cls: 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm' },
  en_curso:    { label: 'Finalizar torneo',  next: 'finalizado', cls: 'bg-slate-800 hover:bg-slate-900 text-white shadow-sm'   },
};

const DetallePanel: React.FC<DetallePanelProps> = ({
  torneo, tabla, loading, onClose, onEditar, onCambiarEstado,
}) => {
  const [tab, setTab] = useState<'info' | 'tabla' | 'equipos'>('info');

  // Lógica segura para formatear fechas
  const fmtFecha = (s?: string) => {
    if (!s) return null;
    const date = new Date(s + 'T12:00:00');
    if (isNaN(date.getTime())) return null;
    return date.toLocaleDateString('es-BO', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const fechaInicio = fmtFecha(torneo.fecha_inicio);
  const fechaFin = fmtFecha(torneo.fecha_fin);
  const fechasValidas = fechaInicio && fechaFin;

  const transicion = ESTADO_SIGUIENTE[torneo.estado];

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header del panel limpio */}
      <div className="px-8 py-6 border-b border-gray-100/80 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <span className="inline-block px-2.5 py-1 bg-slate-50 border border-slate-100 rounded-md text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-3">
            {torneo.temporada} • {torneo.disciplina_nombre}
          </span>
          <h2 className="font-bold text-gray-900 text-2xl leading-tight tracking-tight">{torneo.nombre}</h2>
        </div>
        <button
          onClick={onClose}
          className="shrink-0 p-2 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-50 transition-all"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Tabs Modernizados */}
      <div className="flex px-8 border-b border-gray-100">
        {(['info', 'tabla', 'equipos'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`py-4 px-2 mr-6 text-sm font-semibold transition-all relative capitalize
              ${tab === t ? 'text-[#003DA5]' : 'text-gray-400 hover:text-gray-700'}`}
          >
            {t === 'info' ? 'Información' : t === 'tabla' ? 'Posiciones' : 'Equipos'}
            {tab === t && (
              <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#003DA5] rounded-t-full" />
            )}
          </button>
        ))}
      </div>

      {/* Contenido scrollable */}
      <div className="flex-1 overflow-y-auto px-8 py-6">
        {loading ? (
          <div className="flex items-center justify-center h-40">
            <div className="w-8 h-8 border-3 border-[#003DA5]/20 border-t-[#003DA5] rounded-full animate-spin" />
          </div>
        ) : tab === 'info' ? (
          <div className="space-y-6">
            
            {/* Grid de Detalles Estilo Lista */}
            <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
              <div className="grid grid-cols-2 gap-y-6 gap-x-4">
                {[
                  { label: 'Tipo',       value: torneo.tipo },
                  { label: 'Formato',    value: torneo.formato.replace(/_/g, ' ') },
                  { label: 'Categoría',  value: torneo.categoria_nombre ?? 'Sin categoría' },
                  { label: 'Equipos',    value: String(torneo.total_equipos ?? 0) },
                ].map(({ label, value }) => (
                  <div key={label} className="flex flex-col">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">{label}</span>
                    <span className="text-sm font-semibold text-gray-900 capitalize">{value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Período */}
            <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm flex flex-col">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Período de competición</span>
              {fechasValidas ? (
                <div className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                  <span>{fechaInicio}</span>
                  <span className="text-gray-300 font-normal">→</span>
                  <span>{fechaFin}</span>
                </div>
              ) : (
                <span className="text-sm italic text-gray-400">Fechas por definir</span>
              )}
            </div>

            {/* Reglas */}
            {torneo.reglas && (
              <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 block">Reglas y Observaciones</span>
                <p className="text-sm text-slate-700 leading-relaxed">{torneo.reglas}</p>
              </div>
            )}
          </div>

        ) : tab === 'tabla' ? (
          tabla.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-gray-400 gap-3">
              <svg className="w-12 h-12 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
              <p className="text-sm font-medium">No hay posiciones registradas</p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-gray-100">
              <table className="w-full text-xs">
                <thead className="bg-gray-50/50">
                  <tr className="border-b border-gray-100">
                    {['#', 'Equipo', 'PJ', 'G', 'E', 'P', 'GF', 'GC', 'DG', 'Pts'].map(h => (
                      <th key={h} className={`py-3 px-2 font-bold text-gray-500 uppercase tracking-wider ${h === 'Equipo' ? 'text-left' : 'text-center'}`}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {tabla.map((row, i) => (
                    <tr key={row.id_tabla_posicion} className="hover:bg-gray-50/50 transition-colors">
                      <td className="py-3 px-2 text-center font-bold text-gray-400">{i + 1}</td>
                      <td className="py-3 px-2 font-semibold text-gray-900">
                        <div className="truncate max-w-[120px]">{row.equipo_nombre}</div>
                        {row.carrera_nombre && (
                          <div className="text-[10px] text-gray-500 font-normal truncate mt-0.5">{row.carrera_nombre}</div>
                        )}
                      </td>
                      <td className="py-3 px-2 text-center text-gray-600 font-medium">{row.partidos_jugados}</td>
                      <td className="py-3 px-2 text-center text-emerald-600 font-semibold">{row.partidos_ganados}</td>
                      <td className="py-3 px-2 text-center text-gray-500 font-medium">{row.partidos_empatados}</td>
                      <td className="py-3 px-2 text-center text-red-500 font-medium">{row.partidos_perdidos}</td>
                      <td className="py-3 px-2 text-center text-gray-600 font-medium">{row.goles_favor}</td>
                      <td className="py-3 px-2 text-center text-gray-600 font-medium">{row.goles_contra}</td>
                      <td className={`py-3 px-2 text-center font-bold ${row.diferencia_goles >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                        {row.diferencia_goles >= 0 ? '+' : ''}{row.diferencia_goles}
                      </td>
                      <td className="py-3 px-2 text-center font-bold text-[#003DA5] text-sm">{row.puntos}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )

        ) : (
          /* Tab equipos */
          torneo.equipos && torneo.equipos.length > 0 ? (
            <div className="space-y-3">
              {torneo.equipos.map(eq => (
                <div key={eq.id_equipo} className="flex items-center gap-4 p-4 bg-white border border-gray-100 rounded-2xl hover:border-[#003DA5]/30 transition-colors shadow-sm">
                  <div className="w-10 h-10 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0">
                    <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-gray-900 truncate">{eq.nombre}</p>
                    {eq.carrera_nombre && (
                      <p className="text-xs text-gray-500 truncate mt-0.5">{eq.carrera_nombre}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-48 text-gray-400 gap-3">
               <svg className="w-12 h-12 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
              <p className="text-sm font-medium">Sin equipos inscritos</p>
            </div>
          )
        )}
      </div>

      {/* Acciones del panel */}
      <div className="border-t border-gray-100 bg-gray-50/50 px-8 py-5 space-y-3">
        {transicion && (
          <button
            onClick={() => onCambiarEstado(torneo, transicion.next)}
            className={`w-full py-3 rounded-xl text-sm font-bold transition-all ${transicion.cls}`}
          >
            {transicion.label}
          </button>
        )}
        {torneo.estado !== 'finalizado' && torneo.estado !== 'cancelado' && (
          <button
            onClick={() => onEditar(torneo)}
            className="w-full py-3 rounded-xl border border-gray-200 bg-white text-gray-700 text-sm font-bold hover:border-gray-300 hover:bg-gray-50 transition-all shadow-sm"
          >
            Editar configuración
          </button>
        )}
        {torneo.estado === 'en_curso' && (
          <button
            onClick={() => onCambiarEstado(torneo, 'cancelado')}
            className="w-full py-3 rounded-xl text-[#E31837] bg-red-50 text-sm font-bold hover:bg-red-100 transition-all"
          >
            Cancelar torneo
          </button>
        )}
      </div>
    </div>
  );
};

// ─── Modal de confirmación de eliminación ─────────────────────────────────────
const ConfirmarEliminarModal: React.FC<{
  torneo: Torneo | null;
  onConfirm: () => void;
  onCancel: () => void;
  loading: boolean;
}> = ({ torneo, onConfirm, onCancel, loading }) => {
  if (!torneo) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative z-10 bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm animate-in zoom-in-95 duration-200">
        <div className="w-12 h-12 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <svg className="w-6 h-6 text-[#E31837]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </div>
        <h3 className="text-center font-bold text-gray-900 mb-1">Eliminar torneo</h3>
        <p className="text-center text-sm text-gray-500 mb-6">
          ¿Seguro que quieres eliminar <strong>"{torneo.nombre}"</strong>? Esta acción no se puede deshacer.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={loading}
            className="flex-1 py-2.5 rounded-xl border-2 border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 py-2.5 rounded-xl bg-[#E31837] text-white text-sm font-semibold hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading && (
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3V4a10 10 0 100 20v-4l-3 3 3 3v-4a8 8 0 01-8-8z" />
              </svg>
            )}
            Eliminar
          </button>
        </div>
      </div>
    </div>
  );
};
// ─── TorneosPage ──────────────────────────────────────────────────────────────
export const TorneosPage: React.FC = () => {
  const [filtros, setFiltros] = useState<{ estado?: string; disciplina_id?: number; tipo?: string }>({});
  const { torneos, loading, error, crearTorneo, actualizarTorneo, eliminarTorneo, cambiarEstado } = useTorneos(filtros);
  const disciplinas = useDisciplinas();
  const categorias  = useCategorias();

  // UI state
  const [torneoSeleccionado, setTorneoSeleccionado] = useState<Torneo | null>(null);
  const [torneoEditar, setTorneoEditar]             = useState<Torneo | null>(null);
  const [torneoEliminar, setTorneoEliminar]         = useState<Torneo | null>(null);
  const [modalOpen, setModalOpen]                   = useState(false);
  const [eliminandoId, setEliminandoId]             = useState<number | null>(null);
  const [toastMsg, setToastMsg]                     = useState<string | null>(null);
  
  // NUEVO: Estado para mostrar el modal de Categorías
  const [mostrarCategorias, setMostrarCategorias]   = useState(false);

  // Detalle del torneo seleccionado
  const { torneo: torneoDetalle, tabla, loading: loadingDetalle } =
    useTorneoDetalle(torneoSeleccionado?.id_torneo ?? null);

  const toast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleCrear = async (dto: CreateTorneoDto) => {
    await crearTorneo(dto);
    toast('Torneo creado exitosamente ✓');
  };

  const handleEditar = async (dto: CreateTorneoDto) => {
    if (!torneoEditar) return;
    await actualizarTorneo(torneoEditar.id_torneo, dto);
    if (torneoSeleccionado?.id_torneo === torneoEditar.id_torneo) {
      setTorneoSeleccionado(prev => prev ? { ...prev, ...dto } : null);
    }
    setTorneoEditar(null);
    toast('Torneo actualizado ✓');
  };

  const handleEliminar = async () => {
    if (!torneoEliminar) return;
    try {
      setEliminandoId(torneoEliminar.id_torneo);
      await eliminarTorneo(torneoEliminar.id_torneo);
      if (torneoSeleccionado?.id_torneo === torneoEliminar.id_torneo) {
        setTorneoSeleccionado(null);
      }
      setTorneoEliminar(null);
      toast('Torneo eliminado ✓');
    } finally {
      setEliminandoId(null);
    }
  };

  const handleCambiarEstado = async (t: Torneo, estado: TorneoEstado) => {
    await cambiarEstado(t.id_torneo, estado);
    if (torneoSeleccionado?.id_torneo === t.id_torneo) {
      setTorneoSeleccionado(prev => prev ? { ...prev, estado } : null);
    }
    toast(`Estado actualizado a "${estado.replace('_', ' ')}" ✓`);
  };

  // Abrir modal edición
  const abrirEditar = (t: Torneo) => {
    setTorneoEditar(t);
    setModalOpen(false);
  };

  const estadisticas = {
    total:       torneos.length,
    planificados: torneos.filter(t => t.estado === 'planificado').length,
    en_curso:    torneos.filter(t => t.estado === 'en_curso').length,
    finalizados: torneos.filter(t => t.estado === 'finalizado').length,
  };

  return (
    <div className="flex h-full bg-slate-50">
      {/* ─── Columna principal ─────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* Header - Ahora con el contenedor Max-Width */}
        <div className="bg-white border-b border-gray-100 px-6 py-6">
          <div className="max-w-7xl mx-auto w-full"> {/* <--- EL CONTENEDOR */}
            <div className="flex items-center justify-between gap-4 mb-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Torneos y competencias</h1>
                <p className="text-sm text-gray-500 mt-1">
                  {estadisticas.total} torneos <span className="mx-1">•</span> {estadisticas.en_curso} en curso
                </p>
              </div>
              
              <div className="flex items-center gap-3">
                {/* Botón Categorías */}
                <button
                  onClick={() => setMostrarCategorias(true)}
                  className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200
                             text-gray-700 rounded-xl text-sm font-semibold hover:border-gray-300
                             hover:bg-gray-50 transition-all shadow-sm"
                >
                  <Tag size={16} />
                  <span className="hidden sm:inline">Categorías</span>
                </button>

                {/* Botón Nuevo torneo */}
                <button
                  onClick={() => { setTorneoEditar(null); setModalOpen(true); }}
                  className="flex items-center gap-2 px-5 py-2.5 bg-[#003DA5] text-white rounded-xl
                             text-sm font-semibold hover:bg-[#002d7a] transition-all shadow-sm hover:shadow-md"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  <span className="hidden sm:inline">Nuevo torneo</span>
                  <span className="sm:hidden">Nuevo</span>
                </button>
              </div>
            </div>

            {/* Stats rápidas */}
            <div className="grid grid-cols-4 gap-4">
              {[
                { label: 'Total',       value: estadisticas.total,        cls: 'text-gray-900' },
                { label: 'Planificados', value: estadisticas.planificados, cls: 'text-[#003DA5]' },
                { label: 'En curso',    value: estadisticas.en_curso,     cls: 'text-emerald-600' },
                { label: 'Finalizados', value: estadisticas.finalizados,  cls: 'text-gray-400' },
              ].map(s => (
                <div key={s.label} className="bg-slate-50 border border-slate-100 rounded-2xl p-4 text-center">
                  <p className={`text-2xl font-bold ${s.cls}`}>{s.value}</p>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mt-1">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Filtros - También centrado */}
        <div className="px-6 py-4 border-b border-gray-100 bg-white/50 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto w-full"> {/* <--- EL CONTENEDOR */}
            <TorneoFiltros
              disciplinas={disciplinas}
              filtros={filtros}
              onChange={setFiltros}
            />
          </div>
        </div>

        {/* Grid de torneos - Centrado con espacio en los costados */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto w-full"> {/* <--- EL CONTENEDOR */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3">
                <svg className="w-5 h-5 text-[#E31837] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm font-medium text-red-800">{error}</p>
              </div>
            )}

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="bg-white rounded-2xl border border-gray-100 h-56 animate-pulse shadow-sm" />
                ))}
              </div>
            ) : torneos.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-gray-400 gap-3">
                <div className="w-16 h-16 bg-white border border-gray-100 shadow-sm rounded-2xl flex items-center justify-center text-gray-300">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                </div>
                <div className="text-center">
                  <p className="font-semibold text-gray-700">Sin torneos</p>
                  <p className="text-sm mt-1 text-gray-500">
                    {Object.keys(filtros).length > 0
                      ? 'No hay torneos que coincidan con estos filtros'
                      : 'Crea el primer torneo usando el botón superior'}
                  </p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {torneos.map(t => (
                  <div
                    key={t.id_torneo}
                    className={`transition-all duration-300 ${torneoSeleccionado?.id_torneo === t.id_torneo ? 'ring-2 ring-[#003DA5] ring-offset-4 ring-offset-slate-50 rounded-2xl' : ''}`}
                  >
                    <TorneoCard
                      torneo={t}
                      onVer={setTorneoSeleccionado}
                      onEditar={abrirEditar}
                      onEliminar={setTorneoEliminar}
                      onCambiarEstado={t => handleCambiarEstado(t, ESTADO_SIGUIENTE[t.estado]?.next ?? 'planificado')}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ─── Panel lateral de detalle ───────────────────────────────── */}
      {torneoSeleccionado && (
        <>
          {/* Overlay móvil */}
          <div
            className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-30 lg:hidden"
            onClick={() => setTorneoSeleccionado(null)}
          />
          <div className="fixed right-0 top-0 bottom-0 z-40 w-full sm:w-[420px] bg-white shadow-2xl
                         flex flex-col lg:relative lg:z-auto lg:shadow-none lg:border-l lg:border-gray-100
                         animate-in slide-in-from-right duration-300">
            <DetallePanel
              torneo={torneoDetalle ?? torneoSeleccionado}
              tabla={tabla}
              loading={loadingDetalle}
              onClose={() => setTorneoSeleccionado(null)}
              onEditar={abrirEditar}
              onCambiarEstado={handleCambiarEstado}
            />
          </div>
        </>
      )}

      {/* ─── Modal crear / editar ───────────────────────────────────── */}
      <CrearTorneoModal
        open={modalOpen || !!torneoEditar}
        onClose={() => { setModalOpen(false); setTorneoEditar(null); }}
        onSubmit={torneoEditar ? handleEditar : handleCrear}
        disciplinas={disciplinas}
        categorias={categorias}
        torneoInicial={torneoEditar ? {
          id_torneo:    torneoEditar.id_torneo,
          nombre:       torneoEditar.nombre,
          disciplina_id: torneoEditar.disciplina_id,
          categoria_id: torneoEditar.categoria_id,
          tipo:         torneoEditar.tipo,
          formato:      torneoEditar.formato,
          temporada:    torneoEditar.temporada,
          fecha_inicio: torneoEditar.fecha_inicio,
          fecha_fin:    torneoEditar.fecha_fin,
          reglas:       torneoEditar.reglas ?? '',
        } : undefined}
      />

      {/* ─── Modal confirmar eliminación ────────────────────────────── */}
      <ConfirmarEliminarModal
        torneo={torneoEliminar}
        onConfirm={handleEliminar}
        onCancel={() => setTorneoEliminar(null)}
        loading={eliminandoId !== null}
      />

      {/* NUEVO: Renderizar Modal Categorías */}
      {mostrarCategorias && (
        <CategoriasModal onClose={() => setMostrarCategorias(false)} />
      )}

      {/* ─── Toast ──────────────────────────────────────────────────── */}
      {toastMsg && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50
                        bg-slate-900 text-white text-sm font-semibold px-6 py-3.5
                        rounded-full shadow-2xl animate-in slide-in-from-bottom-5 duration-300">
          {toastMsg}
        </div>
      )}
    </div>
  );
};

export default TorneosPage;