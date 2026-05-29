import React, { useState } from 'react';
import { usePartidosPendientes } from '../../hooks/usePartidos';
import { PartidoCard } from '../../components/admin/resultados/PartidoCard';
import { RegistrarResultadoModal } from '../../components/admin/resultados/RegistrarResultadoModal';
import type { Partido, RegistrarResultadoDto } from '@/types/partidos.types';


// ─── Filtro de jornadas ───────────────────────────────────────────────────────
const FiltroJornada: React.FC<{
  jornadas: number[];
  activa: number | null;
  onChange: (j: number | null) => void;
}> = ({ jornadas, activa, onChange }) => (
  <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
    <button
      onClick={() => onChange(null)}
      className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors
        ${activa === null
          ? 'bg-[#003DA5] text-white'
          : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
    >
      Todos
    </button>
    {jornadas.map(j => (
      <button
        key={j}
        onClick={() => onChange(j)}
        className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors
          ${activa === j
            ? 'bg-[#003DA5] text-white'
            : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
      >
        J{j}
      </button>
    ))}
  </div>
);

// ─── Estado vacío ─────────────────────────────────────────────────────────────
const EstadoVacio: React.FC<{ buscando?: boolean }> = ({ buscando }) => (
  <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
    <div className="w-20 h-20 bg-gradient-to-br from-blue-50 to-blue-100 rounded-3xl flex items-center justify-center text-4xl mb-4 shadow-inner">
      {buscando ? '' : ''}
    </div>
    <h3 className="font-bold text-gray-800 text-lg mb-1">
      {buscando ? 'Sin resultados' : '¡Al día!'}
    </h3>
    <p className="text-sm text-gray-400 max-w-xs">
      {buscando
        ? 'No hay partidos que coincidan con tu búsqueda'
        : 'No hay partidos pendientes de registrar en este momento'}
    </p>
  </div>
);

// ─── ResultadosPage ───────────────────────────────────────────────────────────
export const ResultadosPage: React.FC = () => {
  // En prod, el anotador_id vendría del contexto de auth
  const { partidos, loading, error, refetch, registrarResultado } = usePartidosPendientes();

  const [busqueda, setBusqueda]         = useState('');
  const [jornadaFiltro, setJornada]     = useState<number | null>(null);
  const [partidoActivo, setPartidoActivo] = useState<Partido | null>(null);
  const [guardando, setGuardando]       = useState(false);
  const [toastMsg, setToastMsg]         = useState<{ texto: string; tipo: 'ok' | 'error' } | null>(null);

  const toast = (texto: string, tipo: 'ok' | 'error' = 'ok') => {
    setToastMsg({ texto, tipo });
    setTimeout(() => setToastMsg(null), 3500);
  };

  // Jornadas únicas
  const jornadas = [...new Set(partidos.map(p => p.jornada))].sort((a, b) => a - b);

  // Filtrado
  const partidosFiltrados = partidos.filter(p => {
    const matchBusq = busqueda.trim() === '' || [
      p.equipo_local_nombre,
      p.equipo_visitante_nombre,
      p.carrera_local ?? '',
      p.carrera_visitante ?? '',
      p.torneo_nombre ?? '',
    ].some(s => s.toLowerCase().includes(busqueda.toLowerCase()));

    const matchJornada = jornadaFiltro === null || p.jornada === jornadaFiltro;
    return matchBusq && matchJornada;
  });

  // Agrupar por torneo
  const porTorneo = partidosFiltrados.reduce<Record<string, Partido[]>>((acc, p) => {
    const key = p.torneo_nombre ?? `Torneo #${p.torneo_id}`;
    if (!acc[key]) acc[key] = [];
    acc[key].push(p);
    return acc;
  }, {});

  const handleGuardar = async (id: number, dto: RegistrarResultadoDto) => {
    try {
      setGuardando(true);
      await registrarResultado(id, dto);
      setPartidoActivo(null);
      toast('Resultado registrado correctamente ✓');
    } catch (e: any) {
      toast(e.message ?? 'Error al guardar', 'error');
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="min-h-full bg-gray-50">
      {/* ─── Header UCB ─────────────────────────────────────────────── */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-20">
      
        <div className="px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between gap-3 mb-3">
            <div>
              <h1 className="text-lg font-bold text-gray-900">Registro de resultados</h1>
              <p className="text-xs text-gray-400 mt-0.5">
                {loading ? '…' : `${partidos.length} partido${partidos.length !== 1 ? 's' : ''} pendiente${partidos.length !== 1 ? 's' : ''}`}
              </p>
            </div>
            <button
              onClick={refetch}
              disabled={loading}
              className="p-2.5 rounded-xl bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors disabled:opacity-50"
              title="Actualizar"
            >
              <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>

          {/* Buscador */}
          <div className="relative mb-3">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
              fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
              placeholder="Buscar equipo, carrera o torneo…"
              className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm
                         outline-none focus:border-[#003DA5] focus:bg-white transition-colors"
            />
            {busqueda && (
              <button
                onClick={() => setBusqueda('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          {/* Filtro jornadas */}
          {jornadas.length > 1 && (
            <FiltroJornada
              jornadas={jornadas}
              activa={jornadaFiltro}
              onChange={setJornada}
            />
          )}
        </div>
      </div>

      {/* ─── Contenido ──────────────────────────────────────────────── */}
      <div className="px-4 sm:px-6 py-4 space-y-6 max-w-2xl mx-auto">
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
            <svg className="w-5 h-5 text-[#E31837] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="text-sm font-semibold text-red-700">Error al cargar partidos</p>
              <p className="text-xs text-red-500 mt-0.5">{error}</p>
            </div>
          </div>
        )}

        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 h-36 animate-pulse" />
            ))}
          </div>
        ) : partidosFiltrados.length === 0 ? (
          <EstadoVacio buscando={busqueda.trim() !== '' || jornadaFiltro !== null} />
        ) : (
          Object.entries(porTorneo).map(([nombreTorneo, ps]) => (
            <div key={nombreTorneo}>
              {/* Separador de torneo */}
              <div className="flex items-center gap-3 mb-3">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-base"></span>
                  <h2 className="text-sm font-bold text-gray-700 truncate">{nombreTorneo}</h2>
                </div>
                <div className="flex-1 h-px bg-gray-200" />
                <span className="shrink-0 text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                  {ps.length} partido{ps.length !== 1 ? 's' : ''}
                </span>
              </div>

              <div className="space-y-3">
                {ps.map(partido => (
                  <PartidoCard
                    key={partido.id_partido}
                    partido={partido}
                    onRegistrar={() => setPartidoActivo(partido)}
                  />
                ))}
              </div>
            </div>
          ))
        )}

        {/* Aviso fixture */}
        {!loading && partidos.length === 0 && !error && (
          <div className="mt-4 p-4 bg-[#003DA5]/5 border border-[#003DA5]/10 rounded-xl">
            <p className="text-xs text-[#003DA5] text-center leading-relaxed">
              Los partidos aparecerán aquí una vez que se genere el fixture en cada torneo
            </p>
          </div>
        )}
      </div>

      {/* ─── Modal registrar resultado ───────────────────────────────── */}
      {partidoActivo && (
        <RegistrarResultadoModal
          partido={partidoActivo}
          open={!!partidoActivo}
          onClose={() => setPartidoActivo(null)}
          onSubmit={(dto) => handleGuardar(partidoActivo.id_partido, dto)}
          loading={guardando}
        />
      )}

      {/* ─── Toast ──────────────────────────────────────────────────── */}
      {toastMsg && (
        <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-2xl
                         shadow-xl text-sm font-medium text-white animate-in slide-in-from-bottom duration-300
                         ${toastMsg.tipo === 'ok' ? 'bg-gray-900' : 'bg-[#E31837]'}`}>
          {toastMsg.texto}
        </div>
      )}
    </div>
  );
};

export default ResultadosPage;