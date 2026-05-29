import { useState, useEffect } from 'react';
import { Users, CheckCircle, Clock, XCircle, FileCheck, Save, Plus, ChevronRight, AlertTriangle } from 'lucide-react';
import type { EquipoConDisciplina, EstadoAsistencia, JugadorEquipo, RegistroAsistencia, Sesion } from '@/types/asistencia.types';
import { asistenciaService } from '@/services/asistenciaServices';


const UCB_AZUL = '#003DA5';
const UCB_AMARILLO = '#FFD100';

const ESTADOS: { key: EstadoAsistencia; label: string; icon: React.ReactNode; color: string; bg: string }[] = [
  { key: 'asistio', label: 'Asistió', icon: <CheckCircle size={16} />, color: '#16a34a', bg: '#dcfce7' },
  { key: 'tarde', label: 'Llegó tarde', icon: <Clock size={16} />, color: '#d97706', bg: '#fef3c7' },
  { key: 'ausente', label: 'No asistió', icon: <XCircle size={16} />, color: '#dc2626', bg: '#fee2e2' },
  { key: 'justificado', label: 'Justificado', icon: <FileCheck size={16} />, color: '#7c3aed', bg: '#ede9fe' },
];

export default function AsistenciaPage() {
  const [equiposConDisc, setEquiposConDisc] = useState<EquipoConDisciplina[]>([]);
  const [equipoSeleccionado, setEquipoSeleccionado] = useState<EquipoConDisciplina | null>(null);
  const [sesiones, setSesiones] = useState<Sesion[]>([]);
  const [sesionActiva, setSesionActiva] = useState<Sesion | null>(null);
  const [jugadores, setJugadores] = useState<JugadorEquipo[]>([]);
  const [registros, setRegistros] = useState<Map<number, RegistroAsistencia>>(new Map());
  const [asistenciaPrevia, setAsistenciaPrevia] = useState<any[]>([]);

  const [loading, setLoading] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState('');
  const [exito, setExito] = useState('');
  const [mostrarNuevaSesion, setMostrarNuevaSesion] = useState(false);
  const [nuevaSesion, setNuevaSesion] = useState({
    fecha: new Date().toISOString().split('T')[0],
    hora_inicio: '07:00', hora_fin: '09:00', observaciones: ''
  });

  useEffect(() => {
    asistenciaService.getEquiposConDisciplinas()
      .then(setEquiposConDisc)
      .catch(() => setError('Error cargando equipos'));
  }, []);

  const seleccionarEquipo = async (equipo: EquipoConDisciplina) => {
    setEquipoSeleccionado(equipo);
    setSesionActiva(null);
    setRegistros(new Map());
    setLoading(true);
    try {
      const [sesionesList, jugadoresList] = await Promise.all([
        asistenciaService.getSesiones({ equipo_id: equipo.id_equipo }),
        asistenciaService.getJugadoresByEquipo(equipo.id_equipo),
      ]);
      setSesiones(sesionesList);
      setJugadores(jugadoresList);
    } catch { setError('Error cargando datos del equipo'); }
    finally { setLoading(false); }
  };

  const seleccionarSesion = async (sesion: Sesion) => {
    setSesionActiva(sesion);
    setError(''); setExito('');
    try {
      const previos = await asistenciaService.getAsistenciaBySesion(sesion.id_sesion);
      setAsistenciaPrevia(previos);
      // Inicializar registros
      const mapa = new Map<number, RegistroAsistencia>();
      jugadores.forEach(j => {
        const previo = previos.find((p: any) => p.deportista_id === j.deportista_id);
        let estado: EstadoAsistencia = 'asistio';
        if (previo) {
          const obs: string = previo.observacion || '';
          if (obs.startsWith('[tarde]')) estado = 'tarde';
          else if (obs.startsWith('[ausente]')) estado = 'ausente';
          else if (obs.startsWith('[justificado]')) estado = 'justificado';
          else if (obs.startsWith('[asistio]')) estado = 'asistio';
        }
        mapa.set(j.deportista_id, {
          deportista_id: j.deportista_id,
          deportista_ci: j.deportista_ci,
          deportista_nombre: j.deportista_nombre,
          estado,
          observacion: previo ? previo.observacion?.replace(/^\[.*?\]\s*/, '') : '',
        });
      });
      setRegistros(mapa);
    } catch { setError('Error cargando asistencia previa'); }
  };

  const setEstado = (deportistaId: number, estado: EstadoAsistencia) => {
    setRegistros(prev => {
      const mapa = new Map(prev);
      const actual = mapa.get(deportistaId);
      if (actual) mapa.set(deportistaId, { ...actual, estado });
      return mapa;
    });
  };

  const setObservacion = (deportistaId: number, observacion: string) => {
    setRegistros(prev => {
      const mapa = new Map(prev);
      const actual = mapa.get(deportistaId);
      if (actual) mapa.set(deportistaId, { ...actual, observacion });
      return mapa;
    });
  };

  const marcarTodos = (estado: EstadoAsistencia) => {
    setRegistros(prev => {
      const mapa = new Map(prev);
      mapa.forEach((v, k) => mapa.set(k, { ...v, estado }));
      return mapa;
    });
  };

  const guardarAsistencia = async () => {
    if (!sesionActiva) return;
    setGuardando(true); setError(''); setExito('');
    try {
      await asistenciaService.guardarAsistencia(
        sesionActiva.id_sesion,
        Array.from(registros.values())
      );
      setExito('Asistencia guardada correctamente');
    } catch (e: any) { setError(e.message); }
    finally { setGuardando(false); }
  };

  const crearSesion = async () => {
    if (!equipoSeleccionado) return;
    setLoading(true); setError('');
    try {
      const sesion = await asistenciaService.crearSesion({
        equipo_id: equipoSeleccionado.id_equipo,
        disciplina_id: equipoSeleccionado.id_disciplina,
        fecha: nuevaSesion.fecha,
        hora_inicio: nuevaSesion.hora_inicio,
        hora_fin: nuevaSesion.hora_fin,
        observaciones: nuevaSesion.observaciones,
      } as any);
      setSesiones(prev => [sesion, ...prev]);
      setMostrarNuevaSesion(false);
      setExito('Sesión creada. Selecciónala para registrar asistencia.');
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  };

  // Stats
  const stats = Array.from(registros.values()).reduce((acc, r) => {
    acc[r.estado] = (acc[r.estado] || 0) + 1;
    return acc;
  }, {} as Record<EstadoAsistencia, number>);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="text-white px-6 py-4 shadow-md" style={{ backgroundColor: UCB_AZUL }}>
        <div className="max-w-screen-xl mx-auto flex items-center gap-3">
          <Users size={24} />
          <div>
            <h1 className="text-2xl font-bold">Registro de Asistencia</h1>
            <p className="text-blue-200 text-sm">Entrenamientos · UCB Deportes</p>
          </div>
        </div>
      </div>

      <div className="flex flex-1 max-w-screen-xl mx-auto w-full px-4 py-6 gap-6">

        {/* ── Columna izquierda: selección ─────────────────────────────────── */}
        <div className="w-72 shrink-0 space-y-4">

          {/* Equipos */}
          <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
            <div className="px-4 py-3 border-b" style={{ backgroundColor: UCB_AZUL }}>
              <p className="text-white text-sm font-semibold">Equipo / Disciplina</p>
            </div>
            <div className="max-h-72 overflow-y-auto divide-y">
              {equiposConDisc.map(eq => (
                <button key={eq.id_equipo} onClick={() => seleccionarEquipo(eq)}
                  className={`w-full flex items-center justify-between px-4 py-3 hover:bg-blue-50 transition-colors text-left ${equipoSeleccionado?.id_equipo === eq.id_equipo ? 'bg-blue-50 border-l-4' : ''}`}
                  style={equipoSeleccionado?.id_equipo === eq.id_equipo ? { borderLeftColor: UCB_AZUL } : {}}>
                  <div>
                    <p className="text-sm font-semibold text-gray-800">{eq.equipo_nombre}</p>
                    <p className="text-xs text-gray-500">{eq.disciplina_nombre}</p>
                  </div>
                  <ChevronRight size={14} className="text-gray-400" />
                </button>
              ))}
              {equiposConDisc.length === 0 && (
                <p className="text-xs text-gray-400 text-center py-4">Sin equipos disponibles</p>
              )}
            </div>
          </div>

          {/* Sesiones */}
          {equipoSeleccionado && (
            <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
              <div className="px-4 py-3 border-b flex items-center justify-between" style={{ backgroundColor: UCB_AZUL }}>
                <p className="text-white text-sm font-semibold">Sesiones</p>
                <button onClick={() => setMostrarNuevaSesion(v => !v)}
                  className="text-yellow-300 hover:text-yellow-100">
                  <Plus size={18} />
                </button>
              </div>

              {mostrarNuevaSesion && (
                <div className="p-3 border-b bg-yellow-50 space-y-2">
                  <p className="text-xs font-semibold text-gray-600">Nueva sesión</p>
                  <input type="date" className="w-full border rounded px-2 py-1 text-xs"
                    value={nuevaSesion.fecha}
                    onChange={e => setNuevaSesion(s => ({ ...s, fecha: e.target.value }))} />
                  <div className="grid grid-cols-2 gap-1">
                    <input type="time" className="border rounded px-2 py-1 text-xs"
                      value={nuevaSesion.hora_inicio}
                      onChange={e => setNuevaSesion(s => ({ ...s, hora_inicio: e.target.value }))} />
                    <input type="time" className="border rounded px-2 py-1 text-xs"
                      value={nuevaSesion.hora_fin}
                      onChange={e => setNuevaSesion(s => ({ ...s, hora_fin: e.target.value }))} />
                  </div>
                  <textarea rows={2} placeholder="Observaciones..." className="w-full border rounded px-2 py-1 text-xs resize-none"
                    value={nuevaSesion.observaciones}
                    onChange={e => setNuevaSesion(s => ({ ...s, observaciones: e.target.value }))} />
                  <button onClick={crearSesion}
                    className="w-full py-1 text-xs text-white rounded font-medium"
                    style={{ backgroundColor: UCB_AZUL }}>
                    Crear sesión
                  </button>
                </div>
              )}

              <div className="max-h-64 overflow-y-auto divide-y">
                {sesiones.map(s => (
                  <button key={s.id_sesion} onClick={() => seleccionarSesion(s)}
                    className={`w-full flex items-center justify-between px-4 py-3 hover:bg-blue-50 transition-colors text-left ${sesionActiva?.id_sesion === s.id_sesion ? 'bg-blue-50 border-l-4' : ''}`}
                    style={sesionActiva?.id_sesion === s.id_sesion ? { borderLeftColor: UCB_AMARILLO } : {}}>
                    <div>
                      <p className="text-xs font-semibold text-gray-800">{new Date(s.fecha + 'T00:00:00').toLocaleDateString('es-BO', { weekday: 'short', day: 'numeric', month: 'short' })}</p>
                      <p className="text-xs text-gray-500">{s.hora_inicio} – {s.hora_fin}</p>
                    </div>
                    <ChevronRight size={14} className="text-gray-400" />
                  </button>
                ))}
                {sesiones.length === 0 && (
                  <p className="text-xs text-gray-400 text-center py-4">Sin sesiones. Crea una arriba.</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* ── Área principal: lista de asistencia ───────────────────────────── */}
        <div className="flex-1 min-w-0">
          {!equipoSeleccionado ? (
            <div className="flex items-center justify-center h-full text-gray-400">
              <div className="text-center">
                <Users size={48} className="mx-auto mb-3 opacity-30" />
                <p className="text-lg font-medium">Selecciona un equipo</p>
                <p className="text-sm">para ver las sesiones y registrar asistencia</p>
              </div>
            </div>
          ) : !sesionActiva ? (
            <div className="flex items-center justify-center h-full text-gray-400">
              <div className="text-center">
                <CheckCircle size={48} className="mx-auto mb-3 opacity-30" />
                <p className="text-lg font-medium">Selecciona una sesión</p>
                <p className="text-sm">o crea una nueva para registrar asistencia</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Alertas */}
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 flex items-center gap-2 text-sm">
                  <AlertTriangle size={16} /> {error}
                </div>
              )}
              {exito && (
                <div className="bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-3 text-sm">{exito}</div>
              )}

              {/* Info sesión + stats + acciones masivas */}
              <div className="bg-white rounded-2xl shadow-sm border p-4">
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div>
                    <h2 className="font-bold text-gray-800 text-lg">{equipoSeleccionado.equipo_nombre}</h2>
                    <p className="text-sm text-gray-500">
                      {equipoSeleccionado.disciplina_nombre} ·{' '}
                      {new Date(sesionActiva.fecha + 'T00:00:00').toLocaleDateString('es-BO', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })} ·{' '}
                      {sesionActiva.hora_inicio} – {sesionActiva.hora_fin}
                    </p>
                  </div>

                  {/* Stats pill */}
                  <div className="flex gap-2 flex-wrap">
                    {ESTADOS.map(e => (
                      <div key={e.key} className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium"
                        style={{ backgroundColor: e.bg, color: e.color }}>
                        {e.icon} {stats[e.key] || 0}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Acciones masivas */}
                <div className="mt-3 flex gap-2 flex-wrap">
                  <span className="text-xs text-gray-500 self-center">Marcar todos:</span>
                  {ESTADOS.map(e => (
                    <button key={e.key} onClick={() => marcarTodos(e.key)}
                      className="text-xs px-3 py-1 rounded-full font-medium border"
                      style={{ borderColor: e.color, color: e.color }}>
                      {e.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Lista jugadores */}
              <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
                <div className="px-4 py-3 border-b flex items-center justify-between" style={{ backgroundColor: UCB_AZUL }}>
                  <p className="text-white font-semibold">
                    Jugadores — {jugadores.length} registros
                  </p>
                  <button onClick={guardarAsistencia} disabled={guardando}
                    className="flex items-center gap-2 px-4 py-1.5 text-sm font-bold rounded-lg"
                    style={{ backgroundColor: UCB_AMARILLO, color: UCB_AZUL }}>
                    {guardando
                      ? <span className="animate-spin h-4 w-4 border-2 rounded-full border-blue-900 border-t-transparent" />
                      : <Save size={15} />}
                    Guardar asistencia
                  </button>
                </div>

                {loading ? (
                  <div className="flex justify-center py-12">
                    <div className="animate-spin h-8 w-8 rounded-full border-4 border-blue-600 border-t-transparent" />
                  </div>
                ) : jugadores.length === 0 ? (
                  <div className="text-center py-12 text-gray-400">
                    <p>No hay jugadores habilitados en este equipo</p>
                  </div>
                ) : (
                  <div className="divide-y">
                    {jugadores.map((j, idx) => {
                      const reg = registros.get(j.deportista_id);
                      const estadoActual = reg?.estado || 'asistio';
                      const estadoInfo = ESTADOS.find(e => e.key === estadoActual)!;

                      return (
                        <div key={j.deportista_id}
                          className="flex items-start gap-4 px-4 py-4 hover:bg-gray-50 transition-colors"
                          style={estadoActual !== 'asistio' ? { borderLeftWidth: 3, borderLeftColor: estadoInfo.color } : {}}>

                          {/* Número */}
                          <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0 mt-0.5"
                            style={{ backgroundColor: UCB_AZUL }}>
                            {j.numero_camiseta || idx + 1}
                          </div>

                          {/* Info jugador */}
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-gray-800 text-sm">{j.deportista_nombre}</p>
                            <p className="text-xs text-gray-500">{j.deportista_ci}{j.posicion ? ` · ${j.posicion}` : ''}</p>

                            {/* Observación */}
                            <input
                              className="mt-2 w-full border-b border-gray-200 text-xs text-gray-600 py-0.5 bg-transparent outline-none placeholder-gray-300 focus:border-blue-400"
                              placeholder="Observación (opcional)..."
                              value={reg?.observacion || ''}
                              onChange={e => setObservacion(j.deportista_id, e.target.value)}
                            />
                          </div>

                          {/* Botones de estado */}
                          <div className="flex gap-1.5 shrink-0 flex-wrap justify-end">
                            {ESTADOS.map(e => (
                              <button key={e.key}
                                onClick={() => setEstado(j.deportista_id, e.key)}
                                title={e.label}
                                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-all"
                                style={estadoActual === e.key
                                  ? { backgroundColor: e.bg, color: e.color, borderColor: e.color, fontWeight: 700 }
                                  : { backgroundColor: 'white', color: '#9ca3af', borderColor: '#e5e7eb' }}>
                                {e.icon}
                                <span className="hidden sm:inline">{e.label}</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Botón guardar flotante */}
              <div className="flex justify-end pb-6">
                <button onClick={guardarAsistencia} disabled={guardando}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm shadow-lg"
                  style={{ backgroundColor: UCB_AZUL, color: 'white' }}>
                  {guardando
                    ? <span className="animate-spin h-4 w-4 border-2 rounded-full border-white border-t-transparent" />
                    : <Save size={18} />}
                  Guardar asistencia ({registros.size} jugadores)
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}