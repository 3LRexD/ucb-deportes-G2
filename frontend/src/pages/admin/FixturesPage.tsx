import { useState, useMemo, useEffect } from 'react';
import {Wand2, AlertTriangle, CheckCircle, Calendar, Clock, ChevronDown, ChevronUp, X, RefreshCw, Download, MapPin, Shield, Users,} from 'lucide-react';
import { mockEspacios } from '@/data/mockDataSprint3';
import { generarFixture } from '@/utils/fixtureGenerator';
import type {Espacio, PartidoFixture, Torneo } from '@/types';
import { api } from '@/services/api';

// ─── Helpers ──────────────────────────────────────────────────────────────────
const FASE_LABELS: Record<string, string> = {
  grupos:       'Fase de Grupos',
  cuartos:      'Cuartos de Final',
  semis:        'Semifinal',
  final:        'Final',
  eliminacion:  'Eliminación',
};

const FASE_COLORS: Record<string, string> = {
  grupos:      'bg-blue-50 text-blue-700',
  semis:       'bg-purple-50 text-purple-700',
  final:       'bg-amber-50 text-amber-700',
  eliminacion: 'bg-orange-50 text-orange-700',
};

function formatFecha(f: string) {
  return new Date(f + 'T12:00:00').toLocaleDateString('es-BO', {
    weekday: 'short', day: '2-digit', month: 'short', year: 'numeric',
  });
}

// ─── Badge colisión ───────────────────────────────────────────────────────────
function BadgeColision({ colisiones }: { colisiones: PartidoFixture['colisiones'] }) {
  if (colisiones.length === 0) return null;
  return (
    <div className="flex items-start gap-1.5 bg-red-50 border border-red-200 rounded-lg px-3 py-2 mt-2">
      <AlertTriangle size={13} className="text-red-500 mt-0.5 shrink-0" />
      <div>
        <p className="text-xs font-semibold text-red-700">
          {colisiones.length} colisión{colisiones.length > 1 ? 'es' : ''} detectada{colisiones.length > 1 ? 's' : ''}
        </p>
        {colisiones.map((c, i) => (
          <p key={i} className="text-xs text-red-600">{c.descripcion}</p>
        ))}
      </div>
    </div>
  );
}

// ─── Card de partido generado ─────────────────────────────────────────────────
function PartidoCard({
  partido,
  onCambiarHora,
}: {
  partido: PartidoFixture;
  onCambiarHora: (id: string, hora: string) => void;
}) {
  const tieneColision = partido.colisiones.length > 0;
  const faseCfg = partido.fase ? FASE_COLORS[partido.fase] : 'bg-gray-50 text-gray-500';

  return (
    <div className={`bg-white rounded-xl border shadow-sm p-4 ${tieneColision ? 'border-red-200' : 'border-gray-100'}`}>
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-2 flex-wrap">
          {partido.fase && (
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${faseCfg}`}>
              {FASE_LABELS[partido.fase] ?? partido.fase}
              {partido.grupo ? ` — Grupo ${partido.grupo}` : ''}
            </span>
          )}
          <span className="text-xs text-gray-400">
            {partido.jornada ? `Jornada ${partido.jornada}` : ''}
          </span>
        </div>
        {tieneColision
          ? <AlertTriangle size={15} className="text-red-500 shrink-0" />
          : <CheckCircle size={15} className="text-green-500 shrink-0" />
        }
      </div>

      {/* Equipos */}
      <div className="flex items-center gap-3 mb-3">
        <p className="flex-1 text-sm font-semibold text-gray-800 text-right">{partido.equipo_local_nombre}</p>
        <span className="text-xs font-bold text-gray-400 bg-gray-100 px-2 py-1 rounded-lg">VS</span>
        <p className="flex-1 text-sm font-semibold text-gray-800">{partido.equipo_visitante_nombre}</p>
      </div>

      {/* Fecha, hora, espacio */}
      <div className="flex flex-wrap gap-3 text-xs text-gray-500">
        <span className="flex items-center gap-1">
          <Calendar size={11} />{formatFecha(partido.fecha)}
        </span>
        <span className="flex items-center gap-1">
          <Clock size={11} />
          <input
            type="time"
            value={partido.hora}
            onChange={e => onCambiarHora(partido.id, e.target.value)}
            className="border-none outline-none bg-transparent text-xs text-gray-500 cursor-pointer hover:text-[#1a3a6b] w-[70px]"
          />
        </span>
        <span className="flex items-center gap-1">
          <MapPin size={11} />{partido.espacio_nombre}
        </span>
      </div>

      {/* Colisiones */}
      <BadgeColision colisiones={partido.colisiones} />
    </div>
  );
}

// ─── Panel de configuración del fixture ───────────────────────────────────────
function PanelConfiguracion({
  torneo,
  equiposDelTorneo, // ← agregamos la prop
  onGenerar,
}: {
  torneo: Torneo;
  equiposDelTorneo: { id: number; nombre: string }[]; // ← definimos el tipo
  onGenerar: (partidos: PartidoFixture[]) => void;
}) {
  const [fechaInicio, setFechaInicio] = useState(torneo.fecha_inicio);
  const [horaInicio, setHoraInicio] = useState('09:00');
  const [duracion, setDuracion] = useState(60);
  const [espacioIds, setEspacioIds] = useState<number[]>(mockEspacios.map(e => e.id));
  const [generando, setGenerando] = useState(false);

  const espaciosSeleccionados = mockEspacios.filter(e => espacioIds.includes(e.id));

  const toggleEspacio = (id: number) => {
    setEspacioIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleGenerar = async () => {
  if (equiposDelTorneo.length < 2 || espaciosSeleccionados.length === 0) return;
  setGenerando(true);

  // Generar fixture localmente con el algoritmo
  const resultado = generarFixture({
    torneoId:        torneo.id,
    torneoNombre:    torneo.nombre,
    equipos:         equiposDelTorneo.map(e => ({ id: e.id, nombre: e.nombre })),
    formato:         torneo.formato,
    fechaInicio,
    horaInicio,
    duracionMinutos: duracion,
    espacios:        espaciosSeleccionados,
  });

  // Guardar en la BD
  await api.post('/fixtures/generar', {
    torneoId: torneo.id,
    formato:  torneo.formato,
    partidos: resultado.todos,
  });

  setGenerando(false);
  onGenerar(resultado.todos);
};

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
      <div>
        <h3 className="font-semibold text-gray-800">Configuración del Fixture</h3>
        <p className="text-xs text-gray-400 mt-0.5">
          {torneo.nombre} · {torneo.formato === 'liga' ? 'Liga' : torneo.formato === 'eliminacion_directa' ? 'Eliminación' : 'Grupos + Eliminación'}
        </p>
      </div>

      {/* Equipos */}
      <div>
        <p className="text-xs font-medium text-gray-600 mb-2">Equipos inscritos</p>
        {equiposDelTorneo.length === 0 ? (
          <p className="text-xs text-red-500">⚠️ No hay equipos inscritos en este torneo.</p>
        ) : (
          <div className="flex flex-wrap gap-1.5">
            {equiposDelTorneo.map(e => (
              <span key={e.id} className="flex items-center gap-1 bg-blue-50 text-blue-700 text-xs px-2.5 py-1 rounded-full">
                <Users size={10} />{e.nombre}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Fecha y hora */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Fecha de inicio</label>
          <input type="date" value={fechaInicio} onChange={e => setFechaInicio(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a6b]" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Hora de inicio</label>
          <input type="time" value={horaInicio} onChange={e => setHoraInicio(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a6b]" />
        </div>
      </div>

      {/* Duración */}
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">
          Duración por partido: <span className="text-[#1a3a6b] font-bold">{duracion} min</span>
        </label>
        <input type="range" min={30} max={120} step={15} value={duracion}
          onChange={e => setDuracion(Number(e.target.value))}
          className="w-full accent-[#1a3a6b]" />
        <div className="flex justify-between text-xs text-gray-400 mt-0.5">
          <span>30 min</span><span>120 min</span>
        </div>
      </div>

      {/* Espacios */}
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-2">Espacios disponibles</label>
        <div className="space-y-2">
          {mockEspacios.map(esp => (
            <label key={esp.id}
              className={`flex items-center gap-3 border rounded-xl px-3 py-2.5 cursor-pointer transition-colors ${
                espacioIds.includes(esp.id) ? 'border-[#1a3a6b] bg-blue-50' : 'border-gray-200 hover:border-gray-300'
              }`}>
              <input type="checkbox" checked={espacioIds.includes(esp.id)}
                onChange={() => toggleEspacio(esp.id)} className="accent-[#1a3a6b]" />
              <div>
                <p className="text-sm font-medium text-gray-700">{esp.nombre}</p>
                <p className="text-xs text-gray-400">{esp.ubicacion} · {esp.horario_apertura}–{esp.horario_cierre}</p>
              </div>
            </label>
          ))}
        </div>
      </div>

      <button
        onClick={handleGenerar}
        disabled={equiposDelTorneo.length < 2 || espaciosSeleccionados.length === 0 || generando}
        className="w-full flex items-center justify-center gap-2 bg-[#1a3a6b] text-white py-3 rounded-xl text-sm font-semibold hover:bg-blue-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {generando
          ? <><RefreshCw size={15} className="animate-spin" /> Generando...</>
          : <><Wand2 size={15} /> Generar Fixture Automático</>
        }
      </button>
    </div>
  );
}

// ─── Página principal ──────────────────────────────────────────────────────────
export default function FixturesPage() {
  const [torneos, setTorneos] = useState<Torneo[]>([]);
  const [torneoId, setTorneoId] = useState<number>(0);
  const [equiposDelTorneo, setEquiposDelTorneo] = useState<{id: number, nombre: string}[]>([]);
  const [partidos, setPartidos] = useState<PartidoFixture[]>([]);
  const [generado, setGenerado] = useState(false);
  const [expandidos, setExpandidos] = useState<Record<string, boolean>>({});

  const torneo = torneos.find(t => t.id === torneoId);

  const [espaciosDB, setEspaciosDB] = useState<Espacio[]>([]);

  useEffect(() => {
    api.get('/espacios').then(setEspaciosDB).catch(console.error);
  }, []);

  // Cargar torneos
  useEffect(() => {
    api.get('/torneos')
      .then(data => {
        const mapeados = data.map((t: any) => ({
          id:                t.id,
          nombre:            t.nombre,
          disciplina_id:     t.disciplinaId,
          disciplina_nombre: t.disciplina?.nombre ?? '',
          tipo:              t.tipo,
          formato:           t.formato,
          categoria:         t.categoria?.nombre ?? '',
          temporada:         t.temporada,
          fecha_inicio:      t.fechaInicio?.split('T')[0],
          fecha_fin:         t.fechaFin?.split('T')[0],
          estado:            t.estado,
          reglas:            t.reglas,
        }));
        setTorneos(mapeados);
        if (mapeados.length > 0) setTorneoId(mapeados[0].id);
      })
      .catch(console.error);
  }, []);

  // Cargar equipos cuando cambia el torneo
  useEffect(() => {
    if (!torneoId) return;
    api.get(`/equipos?torneoId=${torneoId}`)
      .then(data => setEquiposDelTorneo(data.map((e: any) => ({
        id:     e.id,
        nombre: e.nombre,
      }))))
      .catch(console.error);
  }, [torneoId]);

  const handleGenerar = (resultado: PartidoFixture[]) => {
    setPartidos(resultado);
    setGenerado(true);
    // Expandir todas las fases por defecto
    const fases = [...new Set(resultado.map(p => p.fase ?? 'jornada'))];
    setExpandidos(Object.fromEntries(fases.map(f => [f, true])));
  };

  const actualizarHora = (id: string, hora: string) => {
    setPartidos(prev => prev.map(p => p.id === id ? { ...p, hora } : p));
  };

  // Agrupar por fase/jornada
  const agrupados = useMemo(() => {
    const grupos: Record<string, PartidoFixture[]> = {};
    for (const p of partidos) {
      const key = p.fase ?? `jornada-${p.jornada}`;
      if (!grupos[key]) grupos[key] = [];
      grupos[key].push(p);
    }
    return grupos;
  }, [partidos]);

  const totalColisiones = partidos.reduce((acc, p) => acc + p.colisiones.length, 0);

  if (!torneo) return (
    <div className="text-center py-16 text-gray-400">
      <p className="text-sm">Cargando torneos...</p>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Generación de Fixtures</h1>
          <p className="text-sm text-gray-500 mt-0.5">HU-GES-08 + Prevención de colisiones HU-CORE-07</p>
        </div>
        {generado && partidos.length > 0 && (
          <button className="flex items-center gap-2 border border-gray-200 text-gray-600 px-4 py-2 rounded-xl text-sm hover:bg-gray-50">
            <Download size={14} /> Exportar fixture
            {/* TODO: conectar con exportación PDF/Excel (Sprint 4) */}
          </button>
        )}
      </div>

      {/* Selector de torneo */}
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1.5">Torneo</label>
        <select
          value={torneoId}
          onChange={e => {
              setTorneoId(Number(e.target.value));
              setGenerado(false);
              setPartidos([]);
            }}
          className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a6b] bg-white min-w-[280px]"
        >
          {torneos.map(t => (
            <option key={t.id} value={t.id}>{t.nombre}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Panel izquierdo: configuración */}
        <div className="lg:col-span-1">
          <PanelConfiguracion
            torneo={torneo}
            equiposDelTorneo={equiposDelTorneo}
            onGenerar={handleGenerar}
          />
        </div>

        {/* Panel derecho: resultado */}
        <div className="lg:col-span-2 space-y-4">
          {!generado ? (
            <div className="flex flex-col items-center justify-center h-64 bg-white rounded-2xl border border-dashed border-gray-200 text-gray-400">
              <Wand2 size={40} className="mb-3 opacity-20" />
              <p className="text-sm font-medium">Configurá y generá el fixture</p>
              <p className="text-xs mt-1">Los partidos aparecerán aquí</p>
            </div>
          ) : (
            <>
              {/* Resumen */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-white rounded-xl border border-gray-100 p-4 text-center">
                  <p className="text-2xl font-bold text-gray-900">{partidos.length}</p>
                  <p className="text-xs text-gray-400 mt-0.5">Partidos generados</p>
                </div>
                <div className={`rounded-xl border p-4 text-center ${totalColisiones > 0 ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}`}>
                  <p className={`text-2xl font-bold ${totalColisiones > 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {totalColisiones}
                  </p>
                  <p className={`text-xs mt-0.5 ${totalColisiones > 0 ? 'text-red-500' : 'text-green-600'}`}>
                    {totalColisiones > 0 ? 'Colisiones' : 'Sin colisiones ✓'}
                  </p>
                </div>
                <div className="bg-white rounded-xl border border-gray-100 p-4 text-center">
                  <p className="text-2xl font-bold text-gray-900">
                    {new Set(Object.keys(agrupados)).size}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">Fases / Jornadas</p>
                </div>
              </div>

              {/* Advertencia si hay colisiones */}
              {totalColisiones > 0 && (
                <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
                  <Shield size={16} className="text-amber-500 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-amber-800">
                      Se detectaron {totalColisiones} colisión{totalColisiones > 1 ? 'es' : ''} de horario
                    </p>
                    <p className="text-xs text-amber-700 mt-0.5">
                      Ajustá manualmente las horas haciendo clic en el reloj de cada partido, o regenerá el fixture.
                    </p>
                  </div>
                </div>
              )}

              {/* Partidos agrupados por fase */}
              {Object.entries(agrupados).map(([fase, ps]) => {
                const abierto = expandidos[fase] ?? true;
                const colisionesFase = ps.reduce((a, p) => a + p.colisiones.length, 0);
                return (
                  <div key={fase} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <button
                      onClick={() => setExpandidos(e => ({ ...e, [fase]: !abierto }))}
                      className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span className="font-semibold text-gray-800">
                          {FASE_LABELS[fase] ?? fase.replace('jornada-', 'Jornada ')}
                        </span>
                        <span className="text-xs text-gray-400">{ps.length} partido{ps.length !== 1 ? 's' : ''}</span>
                        {colisionesFase > 0 && (
                          <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-medium">
                            {colisionesFase} colisión{colisionesFase > 1 ? 'es' : ''}
                          </span>
                        )}
                      </div>
                      {abierto ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
                    </button>

                    {abierto && (
                      <div className="px-5 pb-5 space-y-3">
                        {ps.map(p => (
                          <PartidoCard key={p.id} partido={p} onCambiarHora={actualizarHora} />
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Botón regenerar */}
              <button
                onClick={() => { setGenerado(false); setPartidos([]); }}
                className="flex items-center gap-2 text-sm text-gray-500 hover:text-[#1a3a6b] transition-colors"
              >
                <X size={14} /> Limpiar y reconfigurar
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}