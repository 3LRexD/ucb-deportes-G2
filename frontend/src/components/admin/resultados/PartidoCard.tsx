import type { Partido } from '@/types/partidos.types';
import React from 'react';

interface Props {
  partido: Partido;
  onRegistrar: (p: Partido) => void;
}

const ESTADO_CONFIG = {
  programado: { label: 'Pendiente',  cls: 'bg-amber-50 text-amber-700 border-amber-100' },
  en_curso:   { label: 'En curso',   cls: 'bg-emerald-50 text-emerald-700 border-emerald-100' },
  finalizado: { label: 'Finalizado', cls: 'bg-slate-100 text-slate-500 border-slate-200' },
  suspendido: { label: 'Suspendido', cls: 'bg-red-50 text-red-700 border-red-100' },
};

export const PartidoCard: React.FC<Props> = ({ partido, onRegistrar }) => {
  const est = ESTADO_CONFIG[partido.estado as keyof typeof ESTADO_CONFIG] ?? ESTADO_CONFIG.programado;

  // Manejo seguro de fechas para evitar "Invalid Date"
  const fmtFecha = (s?: string) => {
    if (!s) return null;
    const date = new Date(s + 'T12:00:00');
    if (isNaN(date.getTime())) return null;
    return date.toLocaleDateString('es-BO', { weekday: 'short', day: '2-digit', month: 'short' });
  };

  const fmtHora = (h?: string) => {
    if (!h) return null;
    const parts = h.split(':');
    if (parts.length < 2) return null;
    const date = new Date();
    date.setHours(Number(parts[0]), Number(parts[1]));
    if (isNaN(date.getTime())) return null;
    return date.toLocaleTimeString('es-BO', { hour: '2-digit', minute: '2-digit' });
  };

  const fechaValida = fmtFecha(partido.fecha);
  const horaValida = fmtHora(partido.hora);
  const puedeRegistrar = partido.estado === 'programado' || partido.estado === 'en_curso';

  return (
    <div className="bg-white rounded-2xl border border-slate-100/80 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden p-6">
      
      {/* Meta info superior */}
      <div className="flex items-start justify-between mb-5 gap-4">
        <div className="flex flex-wrap items-center gap-2">
          {partido.disciplina_nombre && (
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider bg-slate-50 px-3 py-1 rounded-full border border-slate-100">
              {partido.disciplina_nombre}
            </span>
          )}
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider bg-slate-50 px-3 py-1 rounded-full border border-slate-100">
            J{partido.jornada} {partido.fase && partido.fase !== 'regular' ? `• ${partido.fase}` : ''}
          </span>
        </div>
        <span className={`shrink-0 text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full border ${est.cls}`}>
          {est.label}
        </span>
      </div>

      {/* Marcador central estructurado */}
      <div className="flex items-center justify-between gap-4 mb-6">
        {/* Local */}
        <div className="flex-1 text-right min-w-0">
          <p className="font-bold text-slate-900 text-base leading-tight truncate">
            {partido.equipo_local_nombre}
          </p>
          {partido.carrera_local && (
            <p className="text-xs text-slate-400 truncate mt-0.5">{partido.carrera_local}</p>
          )}
        </div>

        {/* Score Area */}
        <div className="flex items-center gap-3 shrink-0 bg-slate-50 px-4 py-2.5 rounded-2xl border border-slate-100/50">
          <span className="text-2xl font-black text-slate-800 w-6 text-center">
            {partido.estado === 'programado' ? '-' : partido.goles_local}
          </span>
          <span className="text-slate-300 font-bold text-lg">:</span>
          <span className="text-2xl font-black text-slate-800 w-6 text-center">
            {partido.estado === 'programado' ? '-' : partido.goles_visitante}
          </span>
        </div>

        {/* Visitante */}
        <div className="flex-1 text-left min-w-0">
          <p className="font-bold text-slate-900 text-base leading-tight truncate">
            {partido.equipo_visitante_nombre}
          </p>
          {partido.carrera_visitante && (
            <p className="text-xs text-slate-400 truncate mt-0.5">{partido.carrera_visitante}</p>
          )}
        </div>
      </div>

      {/* Fecha / hora / espacio */}
      <div className="flex flex-wrap items-center justify-center gap-2 text-xs font-medium text-slate-500 mb-6 bg-slate-50/50 py-2 px-3 rounded-xl border border-slate-100/50 w-fit mx-auto">
        {fechaValida || horaValida ? (
          <>
            {fechaValida && (
              <div className="flex items-center gap-1.5">
                <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="capitalize">{fechaValida}</span>
              </div>
            )}
            {(fechaValida && horaValida) && <span className="text-slate-300 px-1">•</span>}
            {horaValida && (
              <div className="flex items-center gap-1.5">
                <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{horaValida}</span>
              </div>
            )}
          </>
        ) : (
          <span className="italic text-slate-400">Horario por definir</span>
        )}
        
        {partido.espacio_nombre && (
          <>
            <span className="text-slate-300 px-1">•</span>
            <div className="flex items-center gap-1.5">
              <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              </svg>
              <span className="truncate max-w-[120px]">{partido.espacio_nombre}</span>
            </div>
          </>
        )}
      </div>

      {/* Botón acción */}
      {puedeRegistrar ? (
        <button
          onClick={() => onRegistrar(partido)}
          className="w-full py-3 rounded-xl text-sm font-bold text-[#003DA5] bg-[#003DA5]/5 hover:bg-[#003DA5]/10 border border-transparent hover:border-[#003DA5]/20 transition-all flex items-center justify-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          Registrar resultado
        </button>
      ) : (
        <div className="w-full py-3 bg-slate-50 rounded-xl text-center text-sm font-bold text-slate-400 border border-slate-100">
          Resultado registrado
        </div>
      )}
    </div>
  );
};