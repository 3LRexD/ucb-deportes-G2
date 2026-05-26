import { useState } from 'react';
import { ChevronDown, ChevronUp, CheckCircle, XCircle, UserPlus, Trophy } from 'lucide-react';
import type { Equipo } from '@/types';

export function EquipoCard({ equipo, onAgregarJugador }: {
  equipo: Equipo;
  onAgregarJugador: (equipo: Equipo) => void;
}) {
  const [expandido, setExpandido] = useState(false);

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      <button
        onClick={() => setExpandido(!expandido)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors text-left"
      >
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-[#1a3a6b]/10 rounded-xl flex items-center justify-center">
            <Trophy size={18} className="text-[#1a3a6b]" />
          </div>
          <div>
            <p className="font-semibold text-gray-800">{equipo.nombre}</p>
            <p className="text-xs text-gray-500">{equipo.carrera}</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium text-gray-700">{equipo.jugadores.length} jugadores</p>
            <p className="text-xs text-gray-400">Delegado: {equipo.delegado_nombre || 'Sin asignar'}</p>
          </div>
          {expandido ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
        </div>
      </button>

      {expandido && (
        <div className="border-t border-gray-100 px-5 py-4">
          {equipo.jugadores.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">Sin jugadores inscritos aún.</p>
          ) : (
            <table className="w-full text-sm mb-4">
              <thead>
                <tr className="text-xs text-gray-400 uppercase tracking-wide">
                  <th className="text-left pb-2">CI</th>
                  <th className="text-left pb-2">Nombre</th>
                  <th className="text-left pb-2">Tipo</th>
                  <th className="text-left pb-2">Matrícula</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {equipo.jugadores.map(j => (
                  <tr key={j.ci} className="hover:bg-gray-50">
                    <td className="py-2 font-mono text-xs text-gray-500">{j.ci}</td>
                    <td className="py-2 font-medium text-gray-800">{j.nombre_completo}</td>
                    <td className="py-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        j.tipo === 'UCB' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'
                      }`}>{j.tipo}</span>
                    </td>
                    <td className="py-2">
                      {j.matricula_activa
                        ? <CheckCircle size={14} className="text-green-500" />
                        : <XCircle size={14} className="text-red-400" />}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          <button
            onClick={() => onAgregarJugador(equipo)}
            className="flex items-center gap-2 text-sm text-[#1a3a6b] hover:text-blue-800 font-medium"
          >
            <UserPlus size={14} /> Agregar jugador por CI
          </button>
        </div>
      )}
    </div>
  );
}
