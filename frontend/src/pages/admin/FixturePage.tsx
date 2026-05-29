import { useState, useEffect, useRef } from 'react';
import { Shuffle, Hand, Download, ImageIcon, FileText, ChevronDown, Trash2, Plus, AlertTriangle, Lock } from 'lucide-react';
import type { EquipoSimple, Fixture, GenerarFixturePayload, Partido } from '@/types/fixture.typeps';
import { fixtureService } from '@/services/fixtureServices';
import { FixtureCanvas, type FixtureCanvasHandle } from '@/components/admin/fixture/FixtureCanvas';

const UCB_AZUL = '#003DA5';
const UCB_AMARILLO = '#FFD100';

// ─── Tipos locales ─────────────────────────────────────────────────────────────
interface Torneo { id_torneo: number; nombre: string; formato: string; disciplina_nombre?: string }

export default function FixturePage() {
  // ── Estado ──────────────────────────────────────────────────────────────────
  const [torneos, setTorneos] = useState<Torneo[]>([]);
  const [torneoId, setTorneoId] = useState<number | null>(null);
  const [equipos, setEquipos] = useState<EquipoSimple[]>([]);
  const [partidos, setPartidos] = useState<Partido[]>([]);
  const [historial, setHistorial] = useState<Fixture[]>([]);
  const [fasesBloqueadas, setFasesBloqueadas] = useState({ semifinal: true, final: true });

  const [modo, setModo] = useState<'aleatorio' | 'manual'>('aleatorio');
  const [ratio, setRatio] = useState<'9:16' | '4:3'>('9:16');
  const [vistaGrupo, setVistaGrupo] = useState<string>('A');
  const [vistaFase, setVistaFase] = useState<string>('grupos');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [exito, setExito] = useState('');

  // Formulario generación
  const [form, setForm] = useState<Partial<GenerarFixturePayload>>({
    formato: 'grupos_eliminacion',
    fecha_inicio: new Date().toISOString().split('T')[0],
    hora_inicio: '07:00',
    intervalo_minutos: 60,
    num_grupos: 2,
  });

  // Partido manual
  const [partidoManual, setPartidoManual] = useState({
    equipo_local_id: 0, equipo_visitante_id: 0,
    fecha: '', hora: '07:00', jornada: 1, fase: 'grupos', grupo: 'A',
  });

  const canvasRef = useRef<FixtureCanvasHandle>(null);

  // ── Carga inicial ────────────────────────────────────────────────────────────
  useEffect(() => {
    fetch('http://localhost:3002/api/torneos')
      .then(r => r.json())
      .then(j => setTorneos(j.data || []))
      .catch(() => setError('No se pudieron cargar los torneos'));
  }, []);

  useEffect(() => {
    if (!torneoId) return;
    Promise.all([
      fixtureService.getEquiposByTorneo(torneoId).then(setEquipos).catch(() => setEquipos([])),
      cargarPartidos(),
      fixtureService.getFixturesByTorneo(torneoId).then(setHistorial).catch(() => setHistorial([])),
      fixtureService.getFasesBloqueadas(torneoId).then(setFasesBloqueadas).catch(() => {}),
    ]);
  }, [torneoId]);

  const cargarPartidos = async () => {
    if (!torneoId) return;
    try {
      const data = await fixtureService.getPartidos(torneoId);
      setPartidos(data);
    } catch { setPartidos([]); }
  };

  // ── Grupos disponibles ───────────────────────────────────────────────────────
  const gruposDisponibles = [...new Set(
    partidos.filter(p => p.grupo).map(p => p.grupo!)
  )].sort();
  const fasesDisponibles = [...new Set(partidos.map(p => p.fase))];

  const partidosFiltrados = partidos.filter(p => {
    if (vistaFase === 'grupos') return p.grupo === vistaGrupo && p.fase === 'grupos';
    return p.fase === vistaFase;
  });

  const torneoSeleccionado = torneos.find(t => t.id_torneo === torneoId);

  // ── Generar fixture ──────────────────────────────────────────────────────────
  const generarFixture = async () => {
    if (!torneoId) return;
    setError(''); setExito(''); setLoading(true);
    try {
      const payload: GenerarFixturePayload = {
        torneo_id: torneoId,
        formato: form.formato as any || 'grupos_eliminacion',
        fecha_inicio: form.fecha_inicio!,
        hora_inicio: form.hora_inicio!,
        intervalo_minutos: form.intervalo_minutos || 60,
        num_grupos: form.num_grupos || 2,
        observaciones: form.observaciones,
      };
      const res = await fixtureService.generarFixture(payload);
      setExito(`Fixture generado: ${res.total_partidos} partidos`);
      await cargarPartidos();
      await fixtureService.getFixturesByTorneo(torneoId).then(setHistorial).catch(() => {});
      await fixtureService.getFasesBloqueadas(torneoId).then(setFasesBloqueadas).catch(() => {});
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const crearManual = async () => {
    if (!torneoId || !partidoManual.equipo_local_id || !partidoManual.equipo_visitante_id) {
      setError('Completa todos los campos del partido'); return;
    }
    setError(''); setLoading(true);
    try {
      await fixtureService.crearPartidoManual({ torneo_id: torneoId, ...partidoManual } as any);
      setExito('Partido creado manualmente');
      await cargarPartidos();
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  };

  const eliminarHistorial = async (id: number) => {
    if (!confirm('¿Eliminar este fixture del historial?')) return;
    try { await fixtureService.eliminarFixture(id); setHistorial(h => h.filter(f => f.id_fixture !== id)); }
    catch (e: any) { setError(e.message); }
  };

  // ─── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top bar */}
      <div className="text-white px-6 py-4 shadow-md" style={{ backgroundColor: UCB_AZUL }}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Generador de Fixtures</h1>
            <p className="text-blue-200 text-sm">Sprint 3 · UCB Deportes</p>
          </div>
          {/* Selector de torneo */}
          <select
            className="bg-white text-blue-900 px-4 py-2 rounded-xl font-medium min-w-[220px] text-sm"
            value={torneoId || ''}
            onChange={e => { setTorneoId(e.target.value ? Number(e.target.value) : null); setPartidos([]); }}
          >
            <option value="">— Seleccionar torneo —</option>
            {torneos.map(t => <option key={t.id_torneo} value={t.id_torneo}>{t.nombre}</option>)}
          </select>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">

        {/* Alertas */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 flex items-center gap-2">
            <AlertTriangle size={18} /> {error}
          </div>
        )}
        {exito && (
          <div className="bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-3">{exito}</div>
        )}

        {!torneoId ? (
          <div className="text-center py-24 text-gray-400">
            <p className="text-xl font-medium">Selecciona un torneo para comenzar</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

            {/* ── Panel izquierdo: controles ─────────────────────────────────── */}
            <div className="space-y-4">

              {/* Modo */}
              <div className="bg-white rounded-2xl shadow-sm border p-4">
                <p className="text-xs font-semibold text-gray-500 uppercase mb-3">Modo de generación</p>
                <div className="grid grid-cols-2 gap-2">
                  {(['aleatorio', 'manual'] as const).map(m => (
                    <button key={m} onClick={() => setModo(m)}
                      className="py-2 rounded-xl text-sm font-medium border transition-all"
                      style={modo === m
                        ? { backgroundColor: UCB_AZUL, color: 'white', borderColor: UCB_AZUL }
                        : { backgroundColor: 'white', color: UCB_AZUL, borderColor: '#e5e7eb' }}>
                      {m === 'aleatorio' ? <><Shuffle size={14} className="inline mr-1" />Aleatorio</> : <><Hand size={14} className="inline mr-1" />Manual</>}
                    </button>
                  ))}
                </div>
              </div>

              {/* Formulario aleatorio */}
              {modo === 'aleatorio' && (
                <div className="bg-white rounded-2xl shadow-sm border p-4 space-y-3">
                  <p className="text-xs font-semibold text-gray-500 uppercase">Configuración</p>

                  <div>
                    <label className="text-xs text-gray-600 block mb-1">Formato</label>
                    <select className="w-full border rounded-lg px-3 py-2 text-sm"
                      value={form.formato}
                      onChange={e => setForm(f => ({ ...f, formato: e.target.value as any }))}>
                      <option value="liga">Liga (todos vs todos)</option>
                      <option value="grupos_eliminacion">Grupos + Eliminación</option>
                      <option value="eliminacion_directa">Eliminación directa</option>
                    </select>
                  </div>

                  {form.formato === 'grupos_eliminacion' && (
                    <div>
                      <label className="text-xs text-gray-600 block mb-1">Número de grupos</label>
                      <input type="number" min={2} max={8}
                        className="w-full border rounded-lg px-3 py-2 text-sm"
                        value={form.num_grupos}
                        onChange={e => setForm(f => ({ ...f, num_grupos: Number(e.target.value) }))} />
                    </div>
                  )}

                  <div>
                    <label className="text-xs text-gray-600 block mb-1">Fecha de inicio</label>
                    <input type="date" className="w-full border rounded-lg px-3 py-2 text-sm"
                      value={form.fecha_inicio}
                      onChange={e => setForm(f => ({ ...f, fecha_inicio: e.target.value }))} />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-xs text-gray-600 block mb-1">Hora inicio</label>
                      <input type="time" className="w-full border rounded-lg px-3 py-2 text-sm"
                        value={form.hora_inicio}
                        onChange={e => setForm(f => ({ ...f, hora_inicio: e.target.value }))} />
                    </div>
                    <div>
                      <label className="text-xs text-gray-600 block mb-1">Intervalo (min)</label>
                      <input type="number" min={30} max={240} step={15}
                        className="w-full border rounded-lg px-3 py-2 text-sm"
                        value={form.intervalo_minutos}
                        onChange={e => setForm(f => ({ ...f, intervalo_minutos: Number(e.target.value) }))} />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs text-gray-600 block mb-1">Observaciones</label>
                    <textarea rows={2} className="w-full border rounded-lg px-3 py-2 text-sm resize-none"
                      value={form.observaciones || ''}
                      onChange={e => setForm(f => ({ ...f, observaciones: e.target.value }))} />
                  </div>

                  <button onClick={generarFixture} disabled={loading}
                    className="w-full py-2.5 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2 disabled:opacity-60"
                    style={{ backgroundColor: UCB_AZUL }}>
                    {loading ? <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" /> : <Shuffle size={16} />}
                    Generar fixture
                  </button>

                  <p className="text-xs text-gray-400 text-center">
                    {equipos.length} equipo{equipos.length !== 1 ? 's' : ''} en este torneo · sorteo aleatorio
                  </p>
                </div>
              )}

              {/* Formulario manual */}
              {modo === 'manual' && (
                <div className="bg-white rounded-2xl shadow-sm border p-4 space-y-3">
                  <p className="text-xs font-semibold text-gray-500 uppercase">Nuevo partido manual</p>

                  <div>
                    <label className="text-xs text-gray-600 block mb-1">Equipo local</label>
                    <select className="w-full border rounded-lg px-3 py-2 text-sm"
                      value={partidoManual.equipo_local_id}
                      onChange={e => setPartidoManual(p => ({ ...p, equipo_local_id: Number(e.target.value) }))}>
                      <option value={0}>— Seleccionar —</option>
                      {equipos.map(eq => <option key={eq.id_equipo} value={eq.id_equipo}>{eq.nombre}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-gray-600 block mb-1">Equipo visitante</label>
                    <select className="w-full border rounded-lg px-3 py-2 text-sm"
                      value={partidoManual.equipo_visitante_id}
                      onChange={e => setPartidoManual(p => ({ ...p, equipo_visitante_id: Number(e.target.value) }))}>
                      <option value={0}>— Seleccionar —</option>
                      {equipos.filter(eq => eq.id_equipo !== partidoManual.equipo_local_id)
                        .map(eq => <option key={eq.id_equipo} value={eq.id_equipo}>{eq.nombre}</option>)}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-xs text-gray-600 block mb-1">Fecha</label>
                      <input type="date" className="w-full border rounded-lg px-3 py-2 text-sm"
                        value={partidoManual.fecha}
                        onChange={e => setPartidoManual(p => ({ ...p, fecha: e.target.value }))} />
                    </div>
                    <div>
                      <label className="text-xs text-gray-600 block mb-1">Hora</label>
                      <input type="time" className="w-full border rounded-lg px-3 py-2 text-sm"
                        value={partidoManual.hora}
                        onChange={e => setPartidoManual(p => ({ ...p, hora: e.target.value }))} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-xs text-gray-600 block mb-1">Fase</label>
                      <select className="w-full border rounded-lg px-3 py-2 text-sm"
                        value={partidoManual.fase}
                        onChange={e => setPartidoManual(p => ({ ...p, fase: e.target.value }))}>
                        <option value="grupos">Grupos</option>
                        <option value="cuartos" disabled={fasesBloqueadas.semifinal}>
                          {fasesBloqueadas.semifinal ? ' ' : ''}Cuartos
                        </option>
                        <option value="semifinal" disabled={fasesBloqueadas.semifinal}>
                          {fasesBloqueadas.semifinal ? ' ' : ''}Semifinal
                        </option>
                        <option value="final" disabled={fasesBloqueadas.final}>
                          {fasesBloqueadas.final ? ' ' : ''}Final
                        </option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-gray-600 block mb-1">Grupo</label>
                      <input className="w-full border rounded-lg px-3 py-2 text-sm"
                        placeholder="A, B..."
                        value={partidoManual.grupo}
                        onChange={e => setPartidoManual(p => ({ ...p, grupo: e.target.value.toUpperCase() }))} />
                    </div>
                  </div>

                  <button onClick={crearManual} disabled={loading}
                    className="w-full py-2.5 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2"
                    style={{ backgroundColor: UCB_AZUL }}>
                    <Plus size={16} /> Agregar partido
                  </button>
                </div>
              )}

              {/* Historial */}
              <div className="bg-white rounded-2xl shadow-sm border p-4">
                <p className="text-xs font-semibold text-gray-500 uppercase mb-3">Historial de fixtures</p>
                {historial.length === 0
                  ? <p className="text-xs text-gray-400 text-center py-2">Sin fixtures generados</p>
                  : historial.map(f => (
                    <div key={f.id_fixture} className="flex items-center justify-between py-2 border-b last:border-0">
                      <div>
                        <p className="text-xs font-medium text-gray-700">{f.formato}</p>
                        <p className="text-xs text-gray-400">{new Date(f.generado_en).toLocaleString()}</p>
                      </div>
                      <button onClick={() => eliminarHistorial(f.id_fixture)}
                        className="text-red-400 hover:text-red-600 p-1">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))
                }
              </div>
            </div>

            {/* ── Panel central: vista fixture ───────────────────────────────── */}
            <div className="xl:col-span-2 space-y-4">

              {/* Barra de navegación grupos/fases */}
              <div className="bg-white rounded-2xl shadow-sm border p-3 flex items-center gap-2 flex-wrap">
                {/* Selector de fase */}
                <div className="relative">
                  <select className="appearance-none bg-gray-100 rounded-lg px-3 py-1.5 text-sm font-medium pr-8"
                    value={vistaFase}
                    onChange={e => setVistaFase(e.target.value)}>
                    {fasesDisponibles.map(f => (
                      <option key={f} value={f}
                        disabled={(f === 'semifinal' && fasesBloqueadas.semifinal) || (f === 'final' && fasesBloqueadas.final)}>
                        {f === 'grupos' ? 'Grupos' : f.charAt(0).toUpperCase() + f.slice(1)}
                        {((f === 'semifinal' && fasesBloqueadas.semifinal) || (f === 'final' && fasesBloqueadas.final)) ? ' ' : ''}
                      </option>
                    ))}
                  </select>
                  <ChevronDown size={14} className="absolute right-2 top-2 text-gray-500 pointer-events-none" />
                </div>

                {/* Selector de grupo (solo en fase grupos) */}
                {vistaFase === 'grupos' && gruposDisponibles.length > 0 && (
                  <div className="flex gap-1">
                    {gruposDisponibles.map(g => (
                      <button key={g} onClick={() => setVistaGrupo(g)}
                        className="px-3 py-1.5 rounded-lg text-sm font-bold border transition-all"
                        style={vistaGrupo === g
                          ? { backgroundColor: UCB_AZUL, color: 'white', borderColor: UCB_AZUL }
                          : { backgroundColor: 'white', color: UCB_AZUL, borderColor: '#e5e7eb' }}>
                        Grupo {g}
                      </button>
                    ))}
                  </div>
                )}

                {/* Fases bloqueadas indicator */}
                {fasesBloqueadas.semifinal && (
                  <div className="ml-auto flex items-center gap-1 text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-2 py-1">
                    <Lock size={12} /> Semifinal/Final se desbloquean al completar grupos
                  </div>
                )}
              </div>

              {/* Canvas + controles de exportación */}
              {partidosFiltrados.length > 0 ? (
                <div className="bg-white rounded-2xl shadow-sm border p-4 space-y-4">
                  {/* Tamaño y exportar */}
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex gap-2">
                      {(['9:16', '4:3'] as const).map(r => (
                        <button key={r} onClick={() => setRatio(r)}
                          className="px-3 py-1 rounded-lg text-xs font-medium border"
                          style={ratio === r ? { backgroundColor: UCB_AMARILLO, color: UCB_AZUL, borderColor: UCB_AMARILLO } : {}}>
                          {r}
                        </button>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => canvasRef.current?.exportarImagen('png')}
                        className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg border hover:bg-gray-50">
                        <ImageIcon size={13} /> PNG
                      </button>
                      <button onClick={() => canvasRef.current?.exportarImagen('jpg')}
                        className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg border hover:bg-gray-50">
                        <Download size={13} /> JPG
                      </button>
                      <button onClick={() => canvasRef.current?.exportarPDF()}
                        className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-white rounded-lg"
                        style={{ backgroundColor: UCB_AZUL }}>
                        <FileText size={13} /> PDF
                      </button>
                    </div>
                  </div>

                  {/* Canvas */}
                  <FixtureCanvas
                    ref={canvasRef}
                    partidos={partidosFiltrados}
                    grupo={vistaFase === 'grupos' ? vistaGrupo : vistaFase}
                    torneo_nombre={torneoSeleccionado?.nombre || ''}
                    disciplina_nombre={torneoSeleccionado?.disciplina_nombre}
                    fecha_label={form.fecha_inicio}
                    ratio={ratio}
                  />
                </div>
              ) : (
                <div className="bg-white rounded-2xl shadow-sm border p-12 text-center text-gray-400">
                  {partidos.length === 0
                    ? <>
                        <p className="text-lg font-medium mb-1">Sin partidos generados</p>
                        <p className="text-sm">Configura y genera el fixture desde el panel izquierdo</p>
                      </>
                    : <>
                        <Lock size={32} className="mx-auto mb-2 text-amber-400" />
                        <p className="text-lg font-medium mb-1">Fase bloqueada</p>
                        <p className="text-sm">Esta fase se desbloqueará cuando se completen los partidos anteriores</p>
                      </>
                  }
                </div>
              )}

              {/* Lista de partidos de la vista actual */}
              {partidos.length > 0 && (
                <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
                  <div className="px-4 py-3 border-b" style={{ backgroundColor: UCB_AZUL }}>
                    <p className="text-white text-sm font-semibold">
                      Partidos — {vistaFase === 'grupos' ? `Grupo ${vistaGrupo}` : vistaFase.charAt(0).toUpperCase() + vistaFase.slice(1)}
                    </p>
                  </div>
                  <div className="divide-y text-sm">
                    {partidosFiltrados.map(p => (
                      <div key={p.id_partido} className="flex items-center justify-between px-4 py-3 hover:bg-gray-50">
                        <span className="text-gray-500 w-16 shrink-0">{p.hora}</span>
                        <span className="font-semibold text-right flex-1">{p.equipo_local_nombre}</span>
                        <div className="mx-3 flex gap-1">
                          <span className="w-7 h-7 rounded flex items-center justify-center text-xs font-bold text-white"
                            style={{ backgroundColor: UCB_AZUL }}>
                            {p.estado === 'finalizado' ? p.goles_local : '-'}
                          </span>
                          <span className="w-7 h-7 rounded flex items-center justify-center text-xs font-bold"
                            style={{ backgroundColor: UCB_AMARILLO, color: UCB_AZUL }}>
                            {p.estado === 'finalizado' ? p.goles_visitante : '-'}
                          </span>
                        </div>
                        <span className="font-semibold flex-1">{p.equipo_visitante_nombre}</span>
                        <span className={`ml-3 text-xs px-2 py-0.5 rounded-full ${
                          p.estado === 'finalizado' ? 'bg-green-100 text-green-700' :
                          p.estado === 'en_curso' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-gray-100 text-gray-600'}`}>
                          {p.estado}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}