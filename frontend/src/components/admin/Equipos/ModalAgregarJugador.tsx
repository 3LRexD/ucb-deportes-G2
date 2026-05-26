import { useState } from 'react';
import { Search, XCircle, CheckCircle, X } from 'lucide-react';
import { mockJugadores } from '@/data/mockData';
import type { Equipo, Jugador } from '@/types';

export function ModalAgregarJugador({ equipo, onClose, onAgregar }: {
  equipo: Equipo;
  onClose: () => void;
  onAgregar: (ci: string) => void;
}) {
  const [ci, setCi] = useState('');
  const [resultado, setResultado] = useState<Jugador | null | 'no_encontrado'>(null);

  const buscarJugador = () => {
    if (!ci.trim()) return;
    const encontrado = mockJugadores.find(j => j.ci === ci.trim());
    setResultado(encontrado || 'no_encontrado');
  };

  const yaInscrito = resultado && resultado !== 'no_encontrado'
    ? equipo.jugadores.some(j => j.ci === (resultado as Jugador).ci)
    : false;

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <div>
            <h2 className="font-bold text-gray-800">Agregar Jugador</h2>
            <p className="text-xs text-gray-500">{equipo.nombre} — {equipo.carrera}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
        </div>

        <div className="px-6 py-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Buscar por CI del estudiante</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={ci}
                onChange={e => { setCi(e.target.value); setResultado(null); }}
                onKeyDown={e => e.key === 'Enter' && buscarJugador()}
                placeholder="Ej: 1234567"
                className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={buscarJugador}
                className="px-4 py-2 bg-[#1a3a6b] text-white rounded-lg text-sm hover:bg-blue-800 transition-colors"
              >
                <Search size={14} />
              </button>
            </div>
          </div>

          {resultado === 'no_encontrado' && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-100 rounded-lg px-4 py-3">
              <XCircle size={16} className="text-red-500 shrink-0" />
              <p className="text-sm text-red-700">No se encontró ningún estudiante con CI <strong>{ci}</strong>.</p>
            </div>
          )}

          {resultado && resultado !== 'no_encontrado' && (
            <div className={`rounded-lg border px-4 py-3 space-y-2 ${
              resultado.matricula_activa ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
            }`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-gray-800 text-sm">{resultado.nombre_completo}</p>
                  <p className="text-xs text-gray-500">CI: {resultado.ci} • {resultado.carrera}</p>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                  resultado.tipo === 'UCB' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'
                }`}>
                  {resultado.tipo}
                </span>
              </div>

              <div className={`flex items-center gap-1.5 text-xs font-medium ${
                resultado.matricula_activa ? 'text-green-700' : 'text-red-700'
              }`}>
                {resultado.matricula_activa
                  ? <><CheckCircle size={13} /> Matrícula activa — habilitado para inscribirse</>
                  : <><XCircle size={13} /> Sin matrícula activa — no puede inscribirse</>
                }
              </div>

              {yaInscrito && (
                <p className="text-xs text-orange-700 font-medium">⚠️ Este jugador ya está en la lista del equipo.</p>
              )}
            </div>
          )}

          <div className="flex gap-3 pt-1">
            <button onClick={onClose} className="flex-1 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50">
              Cancelar
            </button>
            <button
              onClick={() => {
                if (resultado && resultado !== 'no_encontrado' && resultado.matricula_activa && !yaInscrito) {
                  onAgregar(resultado.ci);
                  onClose();
                }
              }}
              disabled={!resultado || resultado === 'no_encontrado' || !(resultado as Jugador).matricula_activa || yaInscrito}
              className="flex-1 py-2 bg-[#1a3a6b] text-white rounded-lg text-sm font-medium hover:bg-blue-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Agregar al equipo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
