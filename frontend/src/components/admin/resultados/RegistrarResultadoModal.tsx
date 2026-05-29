import React, { useState, useEffect, useCallback } from 'react';
import { useJugadoresPartido } from '../../../hooks/usePartidos';
import { EventoItem } from './EventoItem';
import type { Evento } from './EventoItem';
import type { EventoTipo, JugadorPartido, Partido, RegistrarResultadoDto } from '@/types/partidos.types';

interface Props {
  partido: Partido;
  open: boolean;
  onClose: () => void;
  onSubmit: (dto: RegistrarResultadoDto) => Promise<void>;
  loading: boolean;
}

type Paso = 'marcador' | 'eventos' | 'confirmar';

// ─── Selector de jugador ──────────────────────────────────────────────────────
const SelectorJugador: React.FC<{
  jugadores: JugadorPartido[];
  equipoLocalId: number;
  equipoVisitanteId: number;
  onSelect: (j: JugadorPartido) => void;
  busqueda: string;
  setBusqueda: (s: string) => void;
}> = ({ jugadores, equipoLocalId, equipoVisitanteId, onSelect, busqueda, setBusqueda }) => {
  const filtrados = jugadores.filter(j =>
    busqueda.trim() === '' ||
    j.deportista_nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    j.deportista_ci.includes(busqueda)
  );

  const locales    = filtrados.filter(j => j.equipo_id === equipoLocalId);
  const visitantes = filtrados.filter(j => j.equipo_id === equipoVisitanteId);

  const Grupo: React.FC<{ titulo: string; jugadores: JugadorPartido[] }> = ({ titulo, jugadores }) => (
    jugadores.length > 0 ? (
      <div className="mb-4">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-1 mb-2">{titulo}</p>
        <div className="space-y-1.5">
          {jugadores.map(j => (
            <button
              key={j.deportista_id}
              onClick={() => onSelect(j)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white border border-slate-100 hover:border-[#003DA5]/30 hover:bg-[#003DA5]/5
                         text-left transition-all shadow-sm group"
            >
              <div className="w-9 h-9 bg-slate-50 border border-slate-100 rounded-lg flex items-center justify-center shrink-0
                              group-hover:bg-white transition-colors">
                <span className="text-xs font-bold text-slate-500">
                  {j.numero_camiseta ?? j.deportista_nombre[0]}
                </span>
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-slate-900 truncate">{j.deportista_nombre}</p>
                <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider mt-0.5">CI: {j.deportista_ci}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    ) : null
  );

  return (
    <div className="space-y-4">
      <div className="relative">
        <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"
          fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
          placeholder="Buscar jugador por nombre o CI..."
          className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-medium
                     outline-none focus:border-[#003DA5] focus:ring-4 focus:ring-[#003DA5]/10 transition-all shadow-sm"
          autoFocus
        />
      </div>
      <div className="max-h-64 overflow-y-auto pr-1 custom-scrollbar">
        <Grupo titulo={`Local • ${jugadores.find(j => j.equipo_id === equipoLocalId)?.equipo_nombre ?? ''}`} jugadores={locales} />
        <Grupo titulo={`Visitante • ${jugadores.find(j => j.equipo_id === equipoVisitanteId)?.equipo_nombre ?? ''}`} jugadores={visitantes} />
        {filtrados.length === 0 && (
          <div className="text-center py-6">
            <p className="text-sm font-medium text-slate-400">No se encontraron jugadores</p>
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Componente de marcador ───────────────────────────────────────────────────
const InputGoles: React.FC<{
  valor: number;
  onChange: (v: number) => void;
  label: string;
  sublabel?: string;
  align?: 'left' | 'right';
}> = ({ valor, onChange, label, sublabel, align = 'left' }) => (
  <div className="flex flex-col items-center gap-3">
    <div className="text-center h-10 flex flex-col justify-end">
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider truncate max-w-[120px]">{label}</p>
      {sublabel && <p className="text-xs font-medium text-slate-900 truncate max-w-[120px]">{sublabel}</p>}
    </div>
    <div className="flex items-center gap-2.5 bg-slate-50 p-2 rounded-2xl border border-slate-100">
      <button
        onClick={() => onChange(Math.max(0, valor - 1))}
        className="w-10 h-10 rounded-xl bg-white border border-slate-200 text-slate-600 font-bold text-lg
                   hover:bg-slate-100 hover:text-slate-900 hover:border-slate-300 active:scale-95 transition-all flex items-center justify-center shadow-sm"
      >
        −
      </button>
      <div className="w-14 h-16 bg-white border border-slate-200 rounded-xl flex items-center justify-center shadow-sm">
        <span className="text-3xl font-black text-slate-800">{valor}</span>
      </div>
      <button
        onClick={() => onChange(valor + 1)}
        className="w-10 h-10 rounded-xl bg-white border border-slate-200 text-slate-600 font-bold text-lg
                   hover:bg-slate-100 hover:text-slate-900 hover:border-slate-300 active:scale-95 transition-all flex items-center justify-center shadow-sm"
      >
        +
      </button>
    </div>
  </div>
);

// ─── RegistrarResultadoModal ──────────────────────────────────────────────────
export const RegistrarResultadoModal: React.FC<Props> = ({
  partido, open, onClose, onSubmit, loading,
}) => {
  const [paso, setPaso]               = useState<Paso>('marcador');
  const [golesLocal, setGolesLocal]   = useState(0);
  const [golesVisit, setGolesVisit]   = useState(0);
  const [eventos, setEventos]         = useState<Evento[]>([]);
  const [tipoEvento, setTipoEvento]   = useState<EventoTipo>('gol');
  const [minuto, setMinuto]           = useState('');
  const [busqJugador, setBusqJugador] = useState('');
  const [mostrarSelector, setMostrarSelector] = useState(false);

  const { jugadores, loading: loadJug } = useJugadoresPartido(partido.id_partido);

  useEffect(() => {
    if (open) {
      setPaso('marcador');
      setGolesLocal(0);
      setGolesVisit(0);
      setEventos([]);
      setBusqJugador('');
      setMostrarSelector(false);
    }
  }, [open]);

  const agregarEvento = useCallback((jugador: JugadorPartido) => {
    const ev: Evento = {
      id: `${Date.now()}-${Math.random()}`,
      deportista_id:     jugador.deportista_id,
      deportista_ci:     jugador.deportista_ci,
      deportista_nombre: jugador.deportista_nombre,
      equipo_id:         jugador.equipo_id,
      equipo_nombre:     jugador.equipo_nombre,
      tipo:              tipoEvento,
      minuto:            minuto ? Number(minuto) : undefined,
    };
    setEventos(prev => [...prev, ev]);
    setBusqJugador('');
    setMostrarSelector(false);
    setMinuto('');
  }, [tipoEvento, minuto]);

  const quitarEvento = (id: string) => setEventos(prev => prev.filter(e => e.id !== id));

  const handleConfirmar = async () => {
    const dto: RegistrarResultadoDto = {
      goles_local:     golesLocal,
      goles_visitante: golesVisit,
      eventos: eventos.map(({ id: _id, equipo_nombre: _en, ...rest }) => rest),
    };
    await onSubmit(dto);
  };

  if (!open) return null;

  const TIPOS_EVENTO: { value: EventoTipo; icon: React.ReactNode; label: string }[] = [
    { 
      value: 'gol', 
      label: 'Gol',
      icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
    },
    { 
      value: 'autogol', 
      label: 'Autogol',
      icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
    },
    { 
      value: 'tarjeta_amarilla', 
      label: 'Amarilla',
      icon: <div className="w-4 h-6 bg-amber-400 rounded-sm border border-amber-500 shadow-sm transform -rotate-12"></div>
    },
    { 
      value: 'tarjeta_roja', 
      label: 'Roja',
      icon: <div className="w-4 h-6 bg-red-500 rounded-sm border border-red-600 shadow-sm transform -rotate-12"></div>
    },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 sm:p-0"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300" />

      <div className="relative z-10 w-full sm:max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100
                      animate-in slide-in-from-bottom-8 sm:zoom-in-95 duration-300 max-h-[90vh] flex flex-col overflow-hidden">
        
        {/* Header Limpio */}
        <div className="px-8 py-6 border-b border-slate-100 flex items-start justify-between bg-white">
          <div>
            <h2 className="font-black text-slate-900 text-xl tracking-tight">Registrar resultado</h2>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mt-1 truncate max-w-[260px]">
              {partido.equipo_local_nombre} <span className="text-slate-300 mx-1">VS</span> {partido.equipo_visitante_nombre}
            </p>
          </div>
          <button onClick={onClose} className="p-2 -mr-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-50 transition-all">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Steps indicator sutil */}
        <div className="flex px-8 py-4 gap-2 bg-slate-50/50">
          {(['marcador', 'eventos', 'confirmar'] as Paso[]).map((p, i) => (
            <div
              key={p}
              className={`flex-1 h-1.5 rounded-full transition-all duration-500
                ${paso === p ? 'bg-[#003DA5]'
                  : i < ['marcador', 'eventos', 'confirmar'].indexOf(paso)
                    ? 'bg-[#003DA5]/20'
                    : 'bg-slate-200'}`}
            />
          ))}
        </div>

        {/* Contenido por paso */}
        <div className="flex-1 overflow-y-auto px-8 py-6">

          {/* ── PASO 1: Marcador ── */}
          {paso === 'marcador' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
              <div>
                <h3 className="text-base font-bold text-slate-900 text-center mb-6 tracking-tight">¿Cuál fue el marcador final?</h3>
                <div className="flex items-center justify-center gap-6">
                  <InputGoles
                    valor={golesLocal}
                    onChange={setGolesLocal}
                    label="Local"
                    sublabel={partido.equipo_local_nombre}
                  />
                  <div className="shrink-0 pt-6">
                    <span className="text-2xl font-black text-slate-200">:</span>
                  </div>
                  <InputGoles
                    valor={golesVisit}
                    onChange={setGolesVisit}
                    label="Visitante"
                    sublabel={partido.equipo_visitante_nombre}
                    align="right"
                  />
                </div>
              </div>

              {/* Preview marcador */}
              <div className="bg-slate-50 rounded-2xl p-5 text-center border border-slate-100 shadow-sm">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Resultado Final</p>
                <p className="text-4xl font-black text-slate-900 tracking-tight">
                  {golesLocal} <span className="text-slate-300 font-normal mx-1">-</span> {golesVisit}
                </p>
                <div className="mt-3 inline-block px-3 py-1 bg-white border border-slate-200 rounded-full">
                  <p className="text-xs font-bold text-slate-600">
                    {golesLocal > golesVisit
                      ? `Gana ${partido.equipo_local_nombre}`
                      : golesVisit > golesLocal
                        ? ` Gana ${partido.equipo_visitante_nombre}`
                        : ' Empate'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ── PASO 2: Eventos ── */}
          {paso === 'eventos' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <div>
                <h3 className="text-base font-bold text-slate-900 tracking-tight mb-1">Registro de eventos</h3>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Opcional: goles, tarjetas y autogoles</p>
              </div>

              {/* Tipo de evento */}
              <div className="grid grid-cols-4 gap-3">
                {TIPOS_EVENTO.map(t => (
                  <button
                    key={t.value}
                    onClick={() => setTipoEvento(t.value)}
                    className={`flex flex-col items-center justify-center gap-2 py-3 px-1 rounded-2xl border-2 text-[11px] font-bold uppercase tracking-wider transition-all
                      ${tipoEvento === t.value
                        ? 'border-[#003DA5] bg-[#003DA5]/5 text-[#003DA5] shadow-sm'
                        : 'border-slate-100 bg-white text-slate-500 hover:border-slate-200 hover:bg-slate-50'}`}
                  >
                    <div className="h-6 flex items-center justify-center">{t.icon}</div>
                    <span className="text-center">{t.label}</span>
                  </button>
                ))}
              </div>

              {/* Minuto */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Minuto del evento (opcional)</label>
                <div className="relative">
                  <input
                    type="number"
                    min="1"
                    max="120"
                    value={minuto}
                    onChange={e => setMinuto(e.target.value)}
                    placeholder="Ej: 23"
                    className="w-full pl-4 pr-10 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-900
                               outline-none focus:border-[#003DA5] focus:ring-4 focus:ring-[#003DA5]/10 transition-all shadow-sm"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">min</span>
                </div>
              </div>

              {/* Botón seleccionar jugador */}
              <button
                onClick={() => setMostrarSelector(s => !s)}
                disabled={loadJug}
                className="w-full py-3.5 border-2 border-dashed border-[#003DA5]/30 rounded-2xl bg-white
                           text-sm font-bold text-[#003DA5] hover:border-[#003DA5] hover:bg-[#003DA5]/5
                           transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loadJug ? (
                  <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3V4a10 10 0 100 20v-4l-3 3 3 3v-4a8 8 0 01-8-8z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                )}
                {mostrarSelector ? 'Cancelar selección' : 'Seleccionar jugador implicado'}
              </button>

              {/* Selector */}
              {mostrarSelector && (
                <div className="border border-slate-100 rounded-2xl p-4 bg-slate-50/80 shadow-inner">
                  <SelectorJugador
                    jugadores={jugadores}
                    equipoLocalId={partido.equipo_local_id}
                    equipoVisitanteId={partido.equipo_visitante_id}
                    onSelect={agregarEvento}
                    busqueda={busqJugador}
                    setBusqueda={setBusqJugador}
                  />
                </div>
              )}

              {/* Lista de eventos */}
              {eventos.length > 0 && (
                <div className="pt-4 border-t border-slate-100">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">
                    Eventos registrados ({eventos.length})
                  </p>
                  <div className="space-y-2">
                    {eventos.map(ev => (
                      <EventoItem key={ev.id} evento={ev} onEliminar={quitarEvento} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── PASO 3: Confirmar ── */}
          {paso === 'confirmar' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <h3 className="text-base font-bold text-slate-900 tracking-tight text-center">Confirmación Final</h3>

              {/* Resumen marcador Premium */}
              <div className="bg-slate-900 rounded-3xl p-6 text-white shadow-xl">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider text-center mb-4">Resultado definitivo</p>
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1 text-right">
                    <p className="font-bold text-base truncate">{partido.equipo_local_nombre}</p>
                    {partido.carrera_local && <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider truncate mt-1">{partido.carrera_local}</p>}
                  </div>
                  <div className="shrink-0 bg-white/10 border border-white/20 rounded-2xl px-5 py-3 backdrop-blur-sm">
                    <span className="text-3xl font-black">{golesLocal} - {golesVisit}</span>
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-bold text-base truncate">{partido.equipo_visitante_nombre}</p>
                    {partido.carrera_visitante && <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider truncate mt-1">{partido.carrera_visitante}</p>}
                  </div>
                </div>
              </div>

              {/* Resumen eventos */}
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">
                  Resumen de eventos ({eventos.length})
                </p>
                {eventos.length > 0 ? (
                  <div className="space-y-2 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                    {eventos.map(ev => (
                      <EventoItem key={ev.id} evento={ev} onEliminar={quitarEvento} />
                    ))}
                  </div>
                ) : (
                  <div className="bg-slate-50 rounded-2xl p-4 text-center border border-slate-100">
                    <p className="text-sm font-medium text-slate-500">No se registraron eventos adicionales</p>
                  </div>
                )}
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex gap-3 items-start">
                <svg className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                <p className="text-xs font-bold text-amber-800 leading-relaxed">
                  Al confirmar, el partido pasará a estado "Finalizado" y la tabla de posiciones se actualizará automáticamente.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer de navegación Limpio */}
        <div className="border-t border-slate-100 bg-white px-8 py-5 flex gap-3 sm:rounded-b-3xl">
          {paso === 'marcador' ? (
            <>
              <button
                onClick={onClose}
                className="flex-1 py-3 rounded-xl border border-slate-200 bg-white text-slate-600 text-sm font-bold hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm"
              >
                Cancelar
              </button>
              <button
                onClick={() => setPaso('eventos')}
                className="flex-1 py-3 rounded-xl bg-[#003DA5] text-white text-sm font-bold hover:bg-[#002d7a] hover:shadow-md transition-all"
              >
                Continuar →
              </button>
            </>
          ) : paso === 'eventos' ? (
            <>
              <button
                onClick={() => setPaso('marcador')}
                className="flex-1 py-3 rounded-xl border border-slate-200 bg-white text-slate-600 text-sm font-bold hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm"
              >
                ← Atrás
              </button>
              <button
                onClick={() => setPaso('confirmar')}
                className="flex-1 py-3 rounded-xl bg-[#003DA5] text-white text-sm font-bold hover:bg-[#002d7a] hover:shadow-md transition-all"
              >
                Revisar →
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setPaso('eventos')}
                disabled={loading}
                className="flex-1 py-3 rounded-xl border border-slate-200 bg-white text-slate-600 text-sm font-bold hover:bg-slate-50 transition-all shadow-sm disabled:opacity-50"
              >
                ← Atrás
              </button>
              <button
                onClick={handleConfirmar}
                disabled={loading}
                className="flex-1 py-3 rounded-xl bg-emerald-600 text-white text-sm font-bold
                           hover:bg-emerald-700 hover:shadow-md transition-all disabled:opacity-50
                           flex items-center justify-center gap-2"
              >
                {loading && (
                  <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3V4a10 10 0 100 20v-4l-3 3 3 3v-4a8 8 0 01-8-8z" />
                  </svg>
                )}
                Confirmar final
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};