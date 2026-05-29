import React from 'react';
import type { Torneo } from '../../../types/torneos.types';

const ESTADO_CONFIG = {
  planificado:   { label: 'Planificado',  cls: 'bg-blue-50 text-blue-700 border-blue-100' },
  en_curso:      { label: 'En curso',     cls: 'bg-emerald-50 text-emerald-700 border-emerald-100' },
  finalizado:    { label: 'Finalizado',   cls: 'bg-gray-100 text-gray-600 border-gray-200' },
  cancelado:     { label: 'Cancelado',    cls: 'bg-red-50 text-red-700 border-red-100' },
};

const TIPO_ICON: Record<string, string> = {
  intercarreras: '',
  externo:       '',
  amistoso:      '',
  copa:          '',
};

const FORMATO_LABEL: Record<string, string> = {
  liga:                  'Liga',
  eliminacion_directa:   'Eliminación directa',
  grupos_eliminacion:    'Grupos + Eliminación',
};

interface Props {
  torneo: Torneo;
  onVer?:    (t: Torneo) => void;
  onEditar?: (t: Torneo) => void;
  onEliminar?: (t: Torneo) => void;
  onCambiarEstado?: (t: Torneo) => void;
}

export const TorneoCard: React.FC<Props> = ({ torneo, onVer, onEditar, onEliminar }) => {
  const est = ESTADO_CONFIG[torneo.estado] ?? ESTADO_CONFIG.planificado;
  const icon = TIPO_ICON[torneo.tipo] ?? '⚽'; // Un ícono por defecto

  // Función segura para formatear fechas
  const fmtFecha = (s?: string) => {
    if (!s) return null;
    const date = new Date(s + 'T12:00:00');
    if (isNaN(date.getTime())) return null;
    return date.toLocaleDateString('es-BO', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const fechaInicio = fmtFecha(torneo.fecha_inicio);
  const fechaFin = fmtFecha(torneo.fecha_fin);
  const fechasValidas = fechaInicio && fechaFin;

  return (
    <div
      className="group relative bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer border border-gray-100/50"
      onClick={() => onVer?.(torneo)}
    >
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3 min-w-0">
            <span className="text-3xl drop-shadow-sm">{icon}</span>
            <div className="min-w-0">
              <h3 className="font-semibold text-gray-800 text-lg leading-tight truncate group-hover:text-[#003DA5] transition-colors">
                {torneo.nombre}
              </h3>
              <p className="text-sm text-gray-400 mt-1 font-medium">
                {torneo.temporada} <span className="mx-1">•</span> {torneo.disciplina_nombre}
              </p>
            </div>
          </div>
          <span className={`shrink-0 text-xs font-medium px-3 py-1 rounded-full border ${est.cls}`}>
            {est.label}
          </span>
        </div>

        {/* Info chips */}
        <div className="flex flex-wrap gap-2 mb-5">
          <span className="text-xs font-medium bg-slate-50 text-slate-600 px-3 py-1.5 rounded-full border border-slate-100">
            {FORMATO_LABEL[torneo.formato] ?? torneo.formato}
          </span>
          {torneo.categoria_nombre && (
            <span className="text-xs font-medium bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-full border border-indigo-100">
              {torneo.categoria_nombre}
            </span>
          )}
          {torneo.total_equipos !== undefined && (
            <span className="text-xs font-medium bg-slate-50 text-slate-600 px-3 py-1.5 rounded-full border border-slate-100">
              {torneo.total_equipos} equipos
            </span>
          )}
        </div>

        {/* Fechas */}
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-5 bg-gray-50/50 p-2 rounded-lg w-fit">
          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          {fechasValidas ? (
            <>
              <span className="font-medium">{fechaInicio}</span>
              <span className="text-gray-300">→</span>
              <span className="font-medium">{fechaFin}</span>
            </>
          ) : (
            <span className="italic text-gray-400">Fechas por definir</span>
          )}
        </div>

        {/* Acciones */}
        <div
          className="flex items-center gap-2 pt-2"
          onClick={e => e.stopPropagation()}
        >
          <button
            onClick={() => onVer?.(torneo)}
            className="flex-1 text-sm font-semibold py-2.5 rounded-xl text-[#003DA5] bg-[#003DA5]/5 hover:bg-[#003DA5]/10 border border-transparent hover:border-[#003DA5]/20 transition-all"
          >
            Ver detalle
          </button>
          {onEditar && torneo.estado !== 'finalizado' && torneo.estado !== 'cancelado' && (
            <button
              onClick={() => onEditar(torneo)}
              className="p-2.5 rounded-xl text-gray-400 hover:text-[#003DA5] hover:bg-[#003DA5]/10 transition-colors"
              title="Editar"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
          )}
          {onEliminar && torneo.estado === 'planificado' && (
            <button
              onClick={() => onEliminar(torneo)}
              className="p-2.5 rounded-xl text-gray-400 hover:text-[#E31837] hover:bg-red-50 transition-colors"
              title="Eliminar"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};