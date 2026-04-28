import { useState } from 'react';
import { Search, UserPlus, CheckCircle, XCircle, X, Users, Trophy, AlertTriangle } from 'lucide-react';
import { mockUsuarioDelegado, mockEquipos, mockJugadores } from '@/data/mockData';
import type { Jugador, Equipo } from '@/types';

// ─── Modal agregar jugador (desde perspectiva del delegado) ───
function ModalAgregarJugador({ onClose, onAgregar }: {
  onClose: () => void;
  onAgregar: (jugador: Jugador) => void;
}) {
  const [ci, setCi] = useState('');
  const [resultado, setResultado] = useState<Jugador | null | 'no_encontrado'>(null);
  const [buscando, setBuscando] = useState(false);

  const buscar = async () => {
    if (!ci.trim()) return;
    setBuscando(true);
    // TODO: reemplazar con llamada real:
    //   const res = await fetch(`/api/deportistas?ci=${ci}`);
    //   const data = await res.json();
    await new Promise(r => setTimeout(r, 400)); // simula latencia de red
    const encontrado = mockJugadores.find(j => j.ci === ci.trim());
    setResultado(encontrado || 'no_encontrado');
    setBuscando(false);
  };

  const jugador = resultado !== 'no_encontrado' ? resultado : null;

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="font-bold text-gray-800">Inscribir Jugador por CI</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
        </div>

        <div className="px-6 py-5 space-y-4">
          <p className="text-sm text-gray-500">
            Ingresá el carnet de identidad del estudiante UCB para buscarlo y agregarlo a tu equipo.
          </p>

          {/* Búsqueda */}
          <div className="flex gap-2">
            <input
              type="text"
              value={ci}
              onChange={e => { setCi(e.target.value); setResultado(null); }}
              onKeyDown={e => e.key === 'Enter' && buscar()}
              placeholder="Número de CI..."
              className="flex-1 border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <button
              onClick={buscar}
              disabled={buscando}
              className="px-4 py-2 bg-[#0f4c35] text-white rounded-xl text-sm hover:bg-emerald-900 transition-colors disabled:opacity-50"
            >
              {buscando ? '...' : <Search size={14} />}
            </button>
          </div>

          {/* Resultado */}
          {resultado === 'no_encontrado' && (
            <div className="flex items-start gap-3 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
              <XCircle size={16} className="text-red-500 mt-0.5 shrink-0" />
              <p className="text-sm text-red-700">No se encontró ningún estudiante con CI <strong>{ci}</strong>. Verificá el número.</p>
            </div>
          )}

          {jugador && (
            <div className={`rounded-xl border px-4 py-3 space-y-3 ${
              jugador.matricula_activa ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200'
            }`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-gray-800">{jugador.nombre_completo}</p>
                  <p className="text-xs text-gray-500">CI: {jugador.ci}</p>
                  {jugador.carrera && <p className="text-xs text-gray-500">{jugador.carrera}</p>}
                </div>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                  jugador.tipo === 'UCB' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'
                }`}>
                  {jugador.tipo}
                </span>
              </div>

              <div className={`flex items-center gap-2 text-xs font-semibold rounded-lg px-3 py-2 ${
                jugador.matricula_activa
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-red-100 text-red-800'
              }`}>
                {jugador.matricula_activa
                  ? <><CheckCircle size={13} /> Matrícula activa — puede participar en Intercarreras</>
                  : <><AlertTriangle size={13} /> Sin matrícula activa — no puede inscribirse según el reglamento</>
                }
              </div>
              {/* TODO Sprint 4: validación real con API académica UCB */}
            </div>
          )}

          <div className="flex gap-3 pt-1">
            <button onClick={onClose} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50">
              Cancelar
            </button>
            <button
              onClick={() => { if (jugador?.matricula_activa) { onAgregar(jugador); onClose(); } }}
              disabled={!jugador || !jugador.matricula_activa}
              className="flex-1 py-2.5 bg-[#0f4c35] text-white rounded-xl text-sm font-medium hover:bg-emerald-900 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Agregar al equipo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Página principal del delegado ─
export default function MiEquipoPage() {
  // TODO: cuando el auth esté listo, obtener el equipo del delegado autenticado:
  //   const { usuario } = useAuth();
  //   const equipo = await fetch(`/api/equipos?delegado_id=${usuario.id}`);
  const delegado = mockUsuarioDelegado;
  const equipoInicial = mockEquipos.find(e => e.delegado_id === delegado.id) || null;

  const [equipo, setEquipo] = useState<Equipo | null>(equipoInicial);
  const [modalAgregar, setModalAgregar] = useState(false);

  const agregarJugador = (jugador: Jugador) => {
    // TODO: reemplazar con POST /api/equipos/{id}/jugadores
    if (!equipo) return;
    if (equipo.jugadores.some(j => j.ci === jugador.ci)) return;
    setEquipo({ ...equipo, jugadores: [...equipo.jugadores, jugador] });
  };

  const quitarJugador = (ci: string) => {
    // TODO: reemplazar con DELETE /api/equipos/{id}/jugadores/{ci}
    if (!equipo) return;
    setEquipo({ ...equipo, jugadores: equipo.jugadores.filter(j => j.ci !== ci) });
  };

  // Sin equipo asignado aún
  if (!equipo) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center text-gray-400">
        <Trophy size={48} className="mb-4 opacity-20" />
        <p className="text-lg font-semibold text-gray-600">No tenés equipo asignado aún</p>
        <p className="text-sm mt-1">El administrador debe crearlo primero y asignarte como delegado.</p>
      </div>
    );
  }

  const habilitados = equipo.jugadores.filter(j => j.matricula_activa);
  const noHabilitados = equipo.jugadores.filter(j => !j.matricula_activa);

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Header del equipo */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-6 py-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-[#0f4c35]/10 rounded-2xl flex items-center justify-center">
              <Trophy size={24} className="text-[#0f4c35]" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">{equipo.nombre}</h1>
              <p className="text-sm text-gray-500">{equipo.carrera} · Intercarreras 2026</p>
            </div>
          </div>
        </div>

        {/* Resumen */}
        <div className="grid grid-cols-3 gap-4 mt-5 pt-5 border-t border-gray-100">
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">{equipo.jugadores.length}</p>
            <p className="text-xs text-gray-400">Total inscritos</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-emerald-600">{habilitados.length}</p>
            <p className="text-xs text-gray-400">Habilitados</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-red-500">{noHabilitados.length}</p>
            <p className="text-xs text-gray-400">Sin matrícula</p>
          </div>
        </div>
      </div>

      {/* Lista de jugadores */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Users size={16} className="text-gray-400" />
            <h2 className="font-semibold text-gray-800">Lista de Jugadores</h2>
          </div>
          <button
            onClick={() => setModalAgregar(true)}
            className="flex items-center gap-2 bg-[#0f4c35] text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-emerald-900 transition-colors"
          >
            <UserPlus size={14} /> Agregar por CI
          </button>
        </div>

        {equipo.jugadores.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <Users size={32} className="mx-auto mb-2 opacity-20" />
            <p className="text-sm">Aún no hay jugadores en tu equipo.</p>
            <p className="text-xs mt-1">Usá el botón "Agregar por CI" para inscribirlos.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {equipo.jugadores.map((j, i) => (
              <div key={j.ci} className="flex items-center justify-between px-6 py-3 hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3">
                  <span className="text-xs text-gray-300 font-mono w-4">{i + 1}</span>
                  <div>
                    <p className="font-medium text-gray-800 text-sm">{j.nombre_completo}</p>
                    <p className="text-xs text-gray-400">CI: {j.ci}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {j.matricula_activa
                    ? <span className="flex items-center gap-1 text-xs text-emerald-700 font-medium"><CheckCircle size={12} /> Habilitado</span>
                    : <span className="flex items-center gap-1 text-xs text-red-500 font-medium"><XCircle size={12} /> Sin matrícula</span>
                  }
                  <button
                    onClick={() => quitarJugador(j.ci)}
                    className="text-gray-300 hover:text-red-400 transition-colors"
                    title="Quitar del equipo"
                  >
                    <X size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Aviso reglamento */}
      {noHabilitados.length > 0 && (
        <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
          <AlertTriangle size={16} className="text-amber-500 mt-0.5 shrink-0" />
          <p className="text-sm text-amber-800">
            Tenés <strong>{noHabilitados.length} jugador(es)</strong> sin matrícula activa.
            Solo los jugadores habilitados podrán competir en el Intercarreras.
          </p>
        </div>
      )}

      {modalAgregar && (
        <ModalAgregarJugador
          onClose={() => setModalAgregar(false)}
          onAgregar={agregarJugador}
        />
      )}
    </div>
  );
}