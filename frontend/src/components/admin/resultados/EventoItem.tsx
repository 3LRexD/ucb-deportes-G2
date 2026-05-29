import type { EventoTipo } from '@/types/partidos.types';
import React from 'react';


interface Evento {
  id: string; // temporal para UI
  deportista_id: number;
  deportista_ci: string;
  deportista_nombre: string;
  equipo_id: number;
  equipo_nombre: string;
  tipo: EventoTipo;
  minuto?: number;
}

interface Props {
  evento: Evento;
  onEliminar: (id: string) => void;
}

const TIPO_CONFIG: Record<EventoTipo, { icon: string; label: string; cls: string }> = {
  gol:             { icon: '', label: 'Gol',           cls: 'bg-green-50 border-green-200 text-green-700' },
  autogol:         { icon: '', label: 'Autogol',       cls: 'bg-orange-50 border-orange-200 text-orange-700' },
  tarjeta_amarilla:{ icon: '', label: 'T. Amarilla',   cls: 'bg-yellow-50 border-yellow-200 text-yellow-700' },
  tarjeta_roja:    { icon: '', label: 'T. Roja',       cls: 'bg-red-50 border-red-200 text-red-700' },
};

export const EventoItem: React.FC<Props> = ({ evento, onEliminar }) => {
  const cfg = TIPO_CONFIG[evento.tipo];

  return (
    <div className={`flex items-center gap-3 p-2.5 rounded-xl border ${cfg.cls}`}>
      <span className="text-base">{cfg.icon}</span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-bold">{cfg.label}</span>
          {evento.minuto && (
            <span className="text-xs opacity-70">· {evento.minuto}'</span>
          )}
        </div>
        <p className="text-xs opacity-80 truncate">{evento.deportista_nombre}</p>
        <p className="text-xs opacity-60 truncate">{evento.equipo_nombre}</p>
      </div>
      <button
        onClick={() => onEliminar(evento.id)}
        className="p-1.5 rounded-lg hover:bg-black/10 transition-colors shrink-0"
        title="Quitar evento"
      >
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
};

export type { Evento };