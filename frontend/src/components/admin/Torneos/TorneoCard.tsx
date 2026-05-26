import { useState } from 'react';
import { Trophy, Users, Calendar, ChevronDown, ChevronUp } from 'lucide-react';
import type { Torneo } from '@/types';
import { ESTADO_CONFIG, TIPO_LABELS, FORMATO_LABELS } from './constants';
import { mockEquipos } from '@/data/mockData';

export function TorneoCard({ torneo, onEditar }: { torneo: Torneo; onEditar: (t: Torneo) => void }) {
  const [expandido, setExpandido] = useState(false);
  const equiposDelTorneo = mockEquipos.filter(e => e.torneo_id === torneo.id);

  const formatFecha = (f: string) =>
    new Date(f + 'T12:00:00').toLocaleDateString('es-BO', { day: '2-digit', month: 'short', year: 'numeric' });

  const cfg = ESTADO_CONFIG[torneo.estado] || ESTADO_CONFIG.planificado;
  const IconEstado = cfg.icon;

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      <button onClick={() => setExpandido(!expandido)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors text-left">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-[#1a3a6b]/10 rounded-xl flex items-center justify-center shrink-0">
            <Trophy size={18} className="text-[#1a3a6b]" />
          </div>
          <div>
            <p className="font-semibold text-gray-800">{torneo.nombre}</p>
            <p className="text-xs text-gray-400 mt-0.5">
              {TIPO_LABELS[torneo.tipo]} · {FORMATO_LABELS[torneo.formato]} · {torneo.categoria}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex flex-col items-end gap-1">
            <span className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full ${cfg.color}`}>
              <IconEstado size={11} />
              {cfg.label}
            </span>
            <p className="text-xs text-gray-400">
              {formatFecha(torneo.fecha_inicio)} → {formatFecha(torneo.fecha_fin)}
            </p>
          </div>
          {expandido ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
        </div>
      </button>

      {expandido && (
        <div className="border-t border-gray-100 px-5 py-4 space-y-4">
          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Equipos', value: equiposDelTorneo.length, icon: Users },
              { label: 'Disciplina', value: torneo.disciplina_nombre, icon: Trophy },
              { label: 'Temporada', value: torneo.temporada, icon: Calendar },
            ].map(({ label, value, icon: Icon }) => (
              <div key={label} className="bg-gray-50 rounded-lg p-3 text-center">
                <Icon size={14} className="mx-auto text-gray-400 mb-1" />
                <p className="text-sm font-semibold text-gray-800">{value}</p>
                <p className="text-xs text-gray-400">{label}</p>
              </div>
            ))}
          </div>

          {/* Equipos inscritos */}
          {equiposDelTorneo.length > 0 && (
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Equipos inscritos</p>
              <div className="space-y-1">
                {equiposDelTorneo.map(eq => (
                  <div key={eq.id} className="flex items-center justify-between text-sm px-3 py-1.5 rounded-lg hover:bg-gray-50">
                    <span className="text-gray-700">{eq.nombre}</span>
                    <span className="text-xs text-gray-400">{eq.jugadores.length} jugadores</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Reglas */}
          {torneo.reglas && (
            <div className="bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
              <p className="text-xs font-medium text-amber-700 mb-0.5">Reglas</p>
              <p className="text-xs text-amber-800">{torneo.reglas}</p>
            </div>
          )}

          {/* Acciones */}
          <div className="flex gap-2 pt-1">
            <button onClick={() => onEditar(torneo)}
              className="text-sm text-[#1a3a6b] hover:underline font-medium">
              Editar torneo
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
