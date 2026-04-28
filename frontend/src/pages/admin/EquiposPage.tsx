import { useState } from 'react';
import { Plus, Search, Users, ChevronDown, ChevronUp, CheckCircle, XCircle, UserPlus, X, Trophy } from 'lucide-react';
import { mockEquipos, mockCarreras, mockJugadores } from '@/data/mockData';
import type { Equipo, Jugador } from '@/types';

// ─── Modal: Crear nuevo equipo 
function ModalCrearEquipo({ onClose, onCrear }: {
  onClose: () => void;
  onCrear: (equipo: Partial<Equipo>) => void;
}) {
  const [form, setForm] = useState({ nombre: '', carrera: '', delegado_nombre: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.carrera) return;
    onCrear({
      nombre: form.nombre || `Equipo ${form.carrera}`,
      carrera: form.carrera,
      delegado_nombre: form.delegado_nombre,
      jugadores: [],
      torneo_id: 1,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="font-bold text-gray-800 text-lg">Registrar Equipo — Intercarreras 2026</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Carrera *</label>
            <select
              required
              value={form.carrera}
              onChange={e => setForm({ ...form, carrera: e.target.value, nombre: `Equipo ${e.target.value.split(' ')[0]}` })}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Seleccionar carrera...</option>
              {mockCarreras.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del equipo</label>
            <input
              type="text"
              value={form.nombre}
              onChange={e => setForm({ ...form, nombre: e.target.value })}
              placeholder="Se auto-completa con la carrera"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Delegado responsable</label>
            <input
              type="text"
              value={form.delegado_nombre}
              onChange={e => setForm({ ...form, delegado_nombre: e.target.value })}
              placeholder="Nombre del delegado"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {/* TODO: cuando el auth esté listo, mostrar lista de usuarios con rol=delegado */}
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50">
              Cancelar
            </button>
            <button type="submit" className="flex-1 py-2 bg-[#1a3a6b] text-white rounded-lg text-sm font-medium hover:bg-blue-800 transition-colors">
              Crear Equipo
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Modal: Agregar jugador a un equipo ──
function ModalAgregarJugador({ equipo, onClose, onAgregar }: {
  equipo: Equipo;
  onClose: () => void;
  onAgregar: (ci: string) => void;
}) {
  const [ci, setCi] = useState('');
  const [resultado, setResultado] = useState<Jugador | null | 'no_encontrado'>(null);

  // TODO: Reemplazar con llamada real: GET /api/deportistas?ci={ci}
  // + GET /api/academico/validar/{ci} para verificar matrícula
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
          {/* Búsqueda por CI */}
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

          {/* Resultado de búsqueda */}
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

              {/* Validación de matrícula (simulada) */}
              <div className={`flex items-center gap-1.5 text-xs font-medium ${
                resultado.matricula_activa ? 'text-green-700' : 'text-red-700'
              }`}>
                {resultado.matricula_activa
                  ? <><CheckCircle size={13} /> Matrícula activa — habilitado para inscribirse</>
                  : <><XCircle size={13} /> Sin matrícula activa — no puede inscribirse</>
                }
              </div>
              {/* TODO: cuando el sistema académico UCB esté disponible (Sprint 4),
                   reemplazar este estado con la respuesta real de:
                   GET /api/academica/estudiante/{ci} → { matricula_activa: boolean } */}

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

// ─── Card de equipo expandible ────────────────────────────────────────────────
function EquipoCard({ equipo, onAgregarJugador }: {
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

// ─── Página principal ─
export default function EquiposPage() {
  const [equipos, setEquipos] = useState<Equipo[]>(mockEquipos);
  const [busqueda, setBusqueda] = useState('');
  const [modalCrear, setModalCrear] = useState(false);
  const [equipoParaAgregar, setEquipoParaAgregar] = useState<Equipo | null>(null);

  const equiposFiltrados = equipos.filter(e =>
    e.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    e.carrera.toLowerCase().includes(busqueda.toLowerCase())
  );

  const crearEquipo = (datos: Partial<Equipo>) => {
    // TODO: reemplazar con POST /api/equipos
    const nuevo: Equipo = {
      id: equipos.length + 1,
      nombre: datos.nombre!,
      carrera: datos.carrera!,
      delegado_id: 0,
      delegado_nombre: datos.delegado_nombre || '',
      jugadores: [],
      torneo_id: 1,
    };
    setEquipos([...equipos, nuevo]);
  };

  const agregarJugador = (equipoId: number, ci: string) => {
    // TODO: reemplazar con POST /api/equipos/{id}/jugadores
    const jugador = mockJugadores.find(j => j.ci === ci);
    if (!jugador) return;
    setEquipos(equipos.map(e =>
      e.id === equipoId ? { ...e, jugadores: [...e.jugadores, jugador] } : e
    ));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Equipos — Intercarreras 2026</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {equipos.length} equipos registrados · {equipos.reduce((acc, e) => acc + e.jugadores.length, 0)} jugadores inscritos
          </p>
        </div>
        <button
          onClick={() => setModalCrear(true)}
          className="flex items-center gap-2 bg-[#1a3a6b] text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-blue-800 transition-colors shadow-sm"
        >
          <Plus size={16} /> Registrar Equipo
        </button>
      </div>

      {/* Buscador */}
      <div className="relative max-w-sm">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Buscar por equipo o carrera..."
          value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
          className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
        />
      </div>

      {/* Lista de equipos */}
      <div className="space-y-3">
        {equiposFiltrados.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <Users size={32} className="mx-auto mb-2 opacity-30" />
            <p className="text-sm">No hay equipos registrados aún.</p>
          </div>
        ) : (
          equiposFiltrados.map(equipo => (
            <EquipoCard
              key={equipo.id}
              equipo={equipo}
              onAgregarJugador={e => setEquipoParaAgregar(e)}
            />
          ))
        )}
      </div>

      {/* Modales */}
      {modalCrear && (
        <ModalCrearEquipo onClose={() => setModalCrear(false)} onCrear={crearEquipo} />
      )}
      {equipoParaAgregar && (
        <ModalAgregarJugador
          equipo={equipoParaAgregar}
          onClose={() => setEquipoParaAgregar(null)}
          onAgregar={(ci) => { agregarJugador(equipoParaAgregar.id, ci); setEquipoParaAgregar(null); }}
        />
      )}
    </div>
  );
}