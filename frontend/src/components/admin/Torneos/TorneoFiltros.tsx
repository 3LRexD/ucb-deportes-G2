import React from 'react';
import type { Disciplina } from '../../../types/torneos.types';

interface Filtros {
  estado?: string;
  disciplina_id?: number;
  tipo?: string;
}

interface Props {
  disciplinas: Disciplina[];
  filtros: Filtros;
  onChange: (f: Filtros) => void;
}

const ESTADOS = [
  { value: '',           label: 'Todos los estados' },
  { value: 'planificado', label: 'Planificado' },
  { value: 'en_curso',    label: 'En curso' },
  { value: 'finalizado',  label: 'Finalizado' },
  { value: 'cancelado',   label: 'Cancelado' },
];

const TIPOS = [
  { value: '',              label: 'Todos los tipos' },
  { value: 'intercarreras', label: ' Intercarreras' },
  { value: 'externo',       label: ' Externo' },
  { value: 'amistoso',      label: ' Amistoso' },
  { value: 'copa',          label: ' Copa' },
];

export const TorneoFiltros: React.FC<Props> = ({ disciplinas, filtros, onChange }) => {
  const set = (key: keyof Filtros, value: string | number | undefined) =>
    onChange({ ...filtros, [key]: value || undefined });

  const hayFiltros = !!(filtros.estado || filtros.disciplina_id || filtros.tipo);

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {/* Estado */}
      <select
        value={filtros.estado ?? ''}
        onChange={e => set('estado', e.target.value)}
        className="h-8 pl-3 pr-7 rounded-lg border border-gray-200 bg-white text-xs font-medium
                   text-gray-600 outline-none focus:border-[#003DA5] transition-colors appearance-none
                   bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2016%2016%22%3E%3Cpath%20fill%3D%22none%22%20stroke%3D%22%23a0aec0%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%222%22%20d%3D%22M2%205l6%206%206-6%22%2F%3E%3C%2Fsvg%3E')]
                   bg-no-repeat bg-[right_0.5rem_center] bg-[length:1em]"
      >
        {ESTADOS.map(e => (
          <option key={e.value} value={e.value}>{e.label}</option>
        ))}
      </select>

      {/* Tipo */}
      <select
        value={filtros.tipo ?? ''}
        onChange={e => set('tipo', e.target.value)}
        className="h-8 pl-3 pr-7 rounded-lg border border-gray-200 bg-white text-xs font-medium
                   text-gray-600 outline-none focus:border-[#003DA5] transition-colors appearance-none
                   bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2016%2016%22%3E%3Cpath%20fill%3D%22none%22%20stroke%3D%22%23a0aec0%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%222%22%20d%3D%22M2%205l6%206%206-6%22%2F%3E%3C%2Fsvg%3E')]
                   bg-no-repeat bg-[right_0.5rem_center] bg-[length:1em]"
      >
        {TIPOS.map(t => (
          <option key={t.value} value={t.value}>{t.label}</option>
        ))}
      </select>

      {/* Disciplina */}
      {disciplinas.length > 0 && (
        <select
          value={filtros.disciplina_id ?? ''}
          onChange={e => set('disciplina_id', e.target.value ? Number(e.target.value) : undefined)}
          className="h-8 pl-3 pr-7 rounded-lg border border-gray-200 bg-white text-xs font-medium
                     text-gray-600 outline-none focus:border-[#003DA5] transition-colors appearance-none
                     bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2016%2016%22%3E%3Cpath%20fill%3D%22none%22%20stroke%3D%22%23a0aec0%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%222%22%20d%3D%22M2%205l6%206%206-6%22%2F%3E%3C%2Fsvg%3E')]
                     bg-no-repeat bg-[right_0.5rem_center] bg-[length:1em]"
        >
          <option value="">Todas las disciplinas</option>
          {disciplinas.map(d => (
            <option key={d.id_disciplina} value={d.id_disciplina}>{d.nombre}</option>
          ))}
        </select>
      )}

      {/* Limpiar filtros */}
      {hayFiltros && (
        <button
          onClick={() => onChange({})}
          className="h-8 px-3 rounded-lg text-xs font-semibold text-[#E31837] hover:bg-red-50
                     border border-red-100 transition-colors flex items-center gap-1"
        >
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
          Limpiar
        </button>
      )}
    </div>
  );
};