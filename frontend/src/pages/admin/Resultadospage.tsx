import { useState, useEffect } from 'react';
import { api } from '@/services/api';
import {CheckCircle, Clock, X, Plus, Minus, ShieldAlert, Circle, AlertTriangle,} from 'lucide-react';
import {mockEquipos, mockJugadores } from '@/data/mockData';
import type { Partido, EventoPartido } from '@/types';

// ─── Helpers ──────────────────────────────────────────────────────────────────
const ESTADO_PARTIDO = {
  programado: { label: 'Programado', color: 'bg-blue-50 text-blue-700' },
  en_curso:   { label: 'En curso',   color: 'bg-amber-50 text-amber-700' },
  finalizado: { label: 'Finalizado', color: 'bg-green-50 text-green-700' },
  suspendido: { label: 'Suspendido', color: 'bg-red-50 text-red-600' },
};

function formatFecha(f: string) {
  return new Date(f + 'T12:00:00').toLocaleDateString('es-BO', {
    weekday: 'short', day: '2-digit', month: 'short',
  });
}

// ─── Icono de evento ──────────────────────────────────────────────────────────
function IconoEvento({ tipo }: { tipo: EventoPartido['tipo'] }) {
  if (tipo === 'gol') return <Circle size={12} className="text-green-600 fill-green-600" />;
  if (tipo === 'tarjeta_amarilla') return <ShieldAlert size={12} className="text-yellow-500" />;
  return <ShieldAlert size={12} className="text-red-600" />;
}

// ─── Panel de registro de resultado ──────────────────────────────────────────
function PanelRegistro({
  partido,
  onGuardar,
  onCerrar,
}: {
  partido: Partido;
  onGuardar: (p: Partido) => void;
  onCerrar: () => void;
}) {
  const [golesLocal, setGolesLocal] = useState(partido.goles_local);
  const [golesVisitante, setGolesVisitante] = useState(partido.goles_visitante);
  const [eventos, setEventos] = useState<EventoPartido[]>([...partido.eventos]);
  const [estado, setEstado] = useState<Partido['estado']>(partido.estado === 'programado' ? 'finalizado' : partido.estado);

  // Formulario para agregar evento
  const [nuevoEvento, setNuevoEvento] = useState<{
    tipo: EventoPartido['tipo'];
    equipo_id: number;
    deportista_ci: string;
    minuto: string;
  }>({
    tipo: 'gol',
    equipo_id: partido.equipo_local_id,
    deportista_ci: '',
    minuto: '',
  });
  const [errorEvento, setErrorEvento] = useState('');

  // Jugadores del equipo seleccionado en el form
  const equipoSeleccionado = mockEquipos.find(e => e.id === nuevoEvento.equipo_id);
  const jugadoresDisponibles = equipoSeleccionado?.jugadores ?? [];

  const agregarEvento = () => {
    if (!nuevoEvento.deportista_ci) { setErrorEvento('Seleccioná un jugador'); return; }
    setErrorEvento('');
    const jugador = jugadoresDisponibles.find(j => j.ci === nuevoEvento.deportista_ci)
      || mockJugadores.find(j => j.ci === nuevoEvento.deportista_ci);
    const nuevo: EventoPartido = {
      id: Date.now(),
      tipo: nuevoEvento.tipo,
      deportista_ci: nuevoEvento.deportista_ci,
      deportista_nombre: jugador?.nombre_completo || nuevoEvento.deportista_ci,
      equipo_id: nuevoEvento.equipo_id,
      minuto: nuevoEvento.minuto ? Number(nuevoEvento.minuto) : undefined,
    };
    setEventos([...eventos, nuevo]);
    // Si es gol, incrementar marcador automáticamente
    if (nuevoEvento.tipo === 'gol') {
      if (nuevoEvento.equipo_id === partido.equipo_local_id) setGolesLocal(g => g + 1);
      else setGolesVisitante(g => g + 1);
    }
    setNuevoEvento(ne => ({ ...ne, deportista_ci: '', minuto: '' }));
  };

  const quitarEvento = (id: number) => {
    const ev = eventos.find(e => e.id === id);
    if (ev?.tipo === 'gol') {
      if (ev.equipo_id === partido.equipo_local_id) setGolesLocal(g => Math.max(0, g - 1));
      else setGolesVisitante(g => Math.max(0, g - 1));
    }
    setEventos(eventos.filter(e => e.id !== id));
  };

  const confirmar = () => {
    // TODO: PUT /api/partidos/{partido.id}  body: { goles_local, goles_visitante, eventos, estado }
    onGuardar({
      ...partido,
      goles_local: golesLocal,
      goles_visitante: golesVisitante,
      eventos,
      estado,
    });
    onCerrar();
  };

  const eventosLocal = eventos.filter(e => e.equipo_id === partido.equipo_local_id);
  const eventosVisitante = eventos.filter(e => e.equipo_id === partido.equipo_visitante_id);

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-start justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl my-8">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <div>
            <h2 className="font-bold text-gray-800 text-lg">Registrar Resultado</h2>
            <p className="text-xs text-gray-400">{partido.torneo_nombre} · Jornada {partido.jornada}</p>
          </div>
          <button onClick={onCerrar} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
        </div>

        <div className="px-6 py-5 space-y-6">
          {/* Marcador */}
          <div className="bg-[#1a3a6b] rounded-2xl p-6">
            <div className="flex items-center justify-between gap-4">
              {/* Local */}
              <div className="flex-1 text-center">
                <p className="text-white font-bold text-sm truncate">{partido.equipo_local_nombre}</p>
                <p className="text-blue-200 text-xs mb-3">Local</p>
                <div className="flex items-center justify-center gap-3">
                  <button onClick={() => setGolesLocal(g => Math.max(0, g - 1))}
                    className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors">
                    <Minus size={14} />
                  </button>
                  <span className="text-5xl font-black text-white w-12 text-center">{golesLocal}</span>
                  <button onClick={() => setGolesLocal(g => g + 1)}
                    className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors">
                    <Plus size={14} />
                  </button>
                </div>
              </div>

              <span className="text-white/40 text-2xl font-black shrink-0">VS</span>

              {/* Visitante */}
              <div className="flex-1 text-center">
                <p className="text-white font-bold text-sm truncate">{partido.equipo_visitante_nombre}</p>
                <p className="text-blue-200 text-xs mb-3">Visitante</p>
                <div className="flex items-center justify-center gap-3">
                  <button onClick={() => setGolesVisitante(g => Math.max(0, g - 1))}
                    className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors">
                    <Minus size={14} />
                  </button>
                  <span className="text-5xl font-black text-white w-12 text-center">{golesVisitante}</span>
                  <button onClick={() => setGolesVisitante(g => g + 1)}
                    className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors">
                    <Plus size={14} />
                  </button>
                </div>
              </div>
            </div>

            {/* Estado del partido */}
            <div className="mt-4 flex justify-center">
              <select value={estado} onChange={e => setEstado(e.target.value as Partido['estado'])}
                className="bg-white/10 text-white text-sm rounded-lg px-3 py-1.5 border border-white/20 focus:outline-none">
                <option value="programado" className="text-gray-800">Programado</option>
                <option value="en_curso" className="text-gray-800">En curso</option>
                <option value="finalizado" className="text-gray-800">Finalizado</option>
                <option value="suspendido" className="text-gray-800">Suspendido</option>
              </select>
            </div>
          </div>

          {/* Eventos del partido */}
          <div>
            <p className="text-sm font-semibold text-gray-700 mb-3">Eventos del partido</p>

            {/* Dos columnas: local | visitante */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              {[
                { equipo_id: partido.equipo_local_id, nombre: partido.equipo_local_nombre, eventos: eventosLocal },
                { equipo_id: partido.equipo_visitante_id, nombre: partido.equipo_visitante_nombre, eventos: eventosVisitante },
              ].map(col => (
                <div key={col.equipo_id}>
                  <p className="text-xs font-medium text-gray-500 mb-2 truncate">{col.nombre}</p>
                  {col.eventos.length === 0 ? (
                    <p className="text-xs text-gray-300 italic">Sin eventos</p>
                  ) : (
                    <div className="space-y-1">
                      {col.eventos.map(ev => (
                        <div key={ev.id} className="flex items-center gap-1.5 text-xs bg-gray-50 rounded-lg px-2 py-1.5">
                          <IconoEvento tipo={ev.tipo} />
                          <span className="flex-1 truncate text-gray-700">{ev.deportista_nombre}</span>
                          {ev.minuto && <span className="text-gray-400 shrink-0">{ev.minuto}'</span>}
                          <button onClick={() => quitarEvento(ev.id)}
                            className="text-gray-300 hover:text-red-400 transition-colors shrink-0">
                            <X size={11} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Formulario agregar evento */}
            <div className="bg-gray-50 rounded-xl p-4 space-y-3">
              <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Agregar evento</p>

              <div className="grid grid-cols-2 gap-2">
                {/* Tipo */}
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Tipo</label>
                  <select value={nuevoEvento.tipo}
                    onChange={e => setNuevoEvento(ne => ({ ...ne, tipo: e.target.value as EventoPartido['tipo'] }))}
                    className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-[#1a3a6b] bg-white">
                    <option value="gol">Gol</option>
                    <option value="tarjeta_amarilla">Tarjeta Amarilla</option>
                    <option value="tarjeta_roja">Tarjeta Roja</option>
                  </select>
                </div>
                {/* Equipo */}
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Equipo</label>
                  <select value={nuevoEvento.equipo_id}
                    onChange={e => setNuevoEvento(ne => ({ ...ne, equipo_id: Number(e.target.value), deportista_ci: '' }))}
                    className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-[#1a3a6b] bg-white">
                    <option value={partido.equipo_local_id}>{partido.equipo_local_nombre}</option>
                    <option value={partido.equipo_visitante_id}>{partido.equipo_visitante_nombre}</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {/* Jugador */}
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Jugador</label>
                  <select value={nuevoEvento.deportista_ci}
                    onChange={e => setNuevoEvento(ne => ({ ...ne, deportista_ci: e.target.value }))}
                    className={`w-full border rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-[#1a3a6b] bg-white ${errorEvento ? 'border-red-400' : 'border-gray-200'}`}>
                    <option value="">Seleccionar...</option>
                    {jugadoresDisponibles.map(j => (
                      <option key={j.ci} value={j.ci}>{j.nombre_completo}</option>
                    ))}
                  </select>
                  {errorEvento && <p className="text-xs text-red-500 mt-0.5">{errorEvento}</p>}
                </div>
                {/* Minuto */}
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Minuto (opcional)</label>
                  <input type="number" min="1" max="120" value={nuevoEvento.minuto}
                    onChange={e => setNuevoEvento(ne => ({ ...ne, minuto: e.target.value }))}
                    placeholder="Ej: 35"
                    className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-[#1a3a6b]" />
                </div>
              </div>

              <button onClick={agregarEvento}
                className="flex items-center gap-1.5 text-xs text-[#1a3a6b] font-medium hover:underline">
                <Plus size={13} /> Agregar evento
              </button>
            </div>
          </div>

          {/* Advertencia si los goles no coinciden con goles en eventos */}
          {(() => {
            const golesLocEvento = eventos.filter(e => e.tipo === 'gol' && e.equipo_id === partido.equipo_local_id).length;
            const golesVisEvento = eventos.filter(e => e.tipo === 'gol' && e.equipo_id === partido.equipo_visitante_id).length;
            if (golesLocEvento !== golesLocal || golesVisEvento !== golesVisitante) {
              return (
                <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
                  <AlertTriangle size={15} className="text-amber-500 mt-0.5 shrink-0" />
                  <p className="text-xs text-amber-800">
                    El marcador ({golesLocal}-{golesVisitante}) no coincide exactamente con los goles registrados como eventos ({golesLocEvento}-{golesVisEvento}). Podés dejarlo así si es intencional.
                  </p>
                </div>
              );
            }
            return null;
          })()}

          {/* Botones */}
          <div className="flex gap-3 pt-1">
            <button onClick={onCerrar}
              className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50">
              Cancelar
            </button>
            <button onClick={confirmar}
              className="flex-1 py-2.5 bg-[#1a3a6b] text-white rounded-xl text-sm font-medium hover:bg-blue-800 transition-colors flex items-center justify-center gap-2">
              <CheckCircle size={14} /> Confirmar resultado
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Card de partido ───────────────────────────────────────────────────────────
function PartidoCard({ partido, onRegistrar }: { partido: Partido; onRegistrar: (p: Partido) => void }) {
  const cfg = ESTADO_PARTIDO[partido.estado];
  const golesLocal = partido.eventos.filter(e => e.tipo === 'gol' && e.equipo_id === partido.equipo_local_id).length;
  const golesVisitante = partido.eventos.filter(e => e.tipo === 'gol' && e.equipo_id === partido.equipo_visitante_id).length;
  const yaFinalizado = partido.estado === 'finalizado';

  return (
    <div className={`bg-white rounded-xl border shadow-sm overflow-hidden transition-all ${
      yaFinalizado ? 'border-gray-100' : 'border-[#1a3a6b]/20 hover:border-[#1a3a6b]/40'
    }`}>
      <div className="px-5 py-4">
        {/* Meta info */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <Clock size={11} />
            {formatFecha(partido.fecha)} · {partido.hora} · Jornada {partido.jornada}
          </div>
          <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${cfg.color}`}>{cfg.label}</span>
        </div>

        {/* Marcador */}
        <div className="flex items-center justify-between gap-3">
          <p className="flex-1 text-sm font-semibold text-gray-800 text-right">{partido.equipo_local_nombre}</p>
          <div className={`flex items-center gap-2 px-4 py-2 rounded-xl min-w-[90px] justify-center ${
            yaFinalizado ? 'bg-[#1a3a6b] text-white' : 'bg-gray-100 text-gray-500'
          }`}>
            <span className="text-xl font-black">{partido.goles_local}</span>
            <span className="text-sm opacity-60">–</span>
            <span className="text-xl font-black">{partido.goles_visitante}</span>
          </div>
          <p className="flex-1 text-sm font-semibold text-gray-800">{partido.equipo_visitante_nombre}</p>
        </div>

        {/* Eventos resumen (si tiene) */}
        {partido.eventos.length > 0 && (
          <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-gray-500">
            <div className="space-y-0.5">
              {partido.eventos.filter(e => e.equipo_id === partido.equipo_local_id).map(ev => (
                <div key={ev.id} className="flex items-center gap-1">
                  <IconoEvento tipo={ev.tipo} />
                  <span>{ev.deportista_nombre} {ev.minuto ? `${ev.minuto}'` : ''}</span>
                </div>
              ))}
            </div>
            <div className="space-y-0.5">
              {partido.eventos.filter(e => e.equipo_id === partido.equipo_visitante_id).map(ev => (
                <div key={ev.id} className="flex items-center gap-1">
                  <IconoEvento tipo={ev.tipo} />
                  <span>{ev.deportista_nombre} {ev.minuto ? `${ev.minuto}'` : ''}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Botón acción */}
        {partido.estado !== 'suspendido' && (
          <div className="mt-3 pt-3 border-t border-gray-50 flex justify-end">
            <button onClick={() => onRegistrar(partido)}
              className={`text-xs font-medium px-4 py-1.5 rounded-lg transition-colors ${
                yaFinalizado
                  ? 'text-gray-500 border border-gray-200 hover:bg-gray-50'
                  : 'bg-[#1a3a6b] text-white hover:bg-blue-800'
              }`}>
              {yaFinalizado ? 'Editar resultado' : 'Registrar resultado'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Página principal ──────────────────────────────────────────────────────────
export default function ResultadosPage() {
  const [partidos, setPartidos] = useState<Partido[]>([]);
  const [partidoActivo, setPartidoActivo] = useState<Partido | null>(null);
  const [filtro, setFiltro] = useState<string>('todos');

  const partidosFiltrados = filtro === 'todos'
    ? partidos
    : partidos.filter(p => p.estado === filtro);

  const pendientes = partidos.filter(p => p.estado === 'programado').length;
  const finalizados = partidos.filter(p => p.estado === 'finalizado').length;

  useEffect(() => {
    api.get('/partidos')
      .then(data => setPartidos(data.map(mapearPartido)))
      .catch(console.error);
  }, []);

  const mapearPartido = (p: any): Partido => ({
    id:                    p.id,
    torneo_id:             p.torneoId,
    torneo_nombre:         p.torneo?.nombre ?? '',
    equipo_local_id:       p.equipoLocalId,
    equipo_local_nombre:   p.equipoLocal?.nombre ?? '',
    equipo_visitante_id:   p.equipoVisitanteId,
    equipo_visitante_nombre: p.equipoVisitante?.nombre ?? '',
    fecha:                 p.fecha?.split('T')[0],
    hora:                  p.hora,
    jornada:               p.jornada,
    fase:                  p.fase,
    estado:                p.estado,
    goles_local:           p.golesLocal,
    goles_visitante:       p.golesVisitante,
    eventos:               p.estadisticas?.map((e: any) => ({
      id:               e.id,
      tipo:             e.tipo,
      deportista_ci:    e.deportistaCi,
      deportista_nombre: e.deportistaNombre,
      equipo_id:        e.equipoId,
      minuto:           e.minuto,
    })) ?? [],
  });

  const actualizarPartido = async (actualizado: Partido) => {
    await api.put(`/partidos/${actualizado.id}`, {
      golesLocal:     actualizado.goles_local,
      golesVisitante: actualizado.goles_visitante,
      estado:         actualizado.estado,
      estadisticas:   actualizado.eventos.map(e => ({
        equipoId:        e.equipo_id,
        deportistaId:    0,
        deportistaCi:    e.deportista_ci,
        deportistaNombre: e.deportista_nombre,
        tipo:            e.tipo,
        minuto:          e.minuto,
      })),
    });
    const data = await api.get('/partidos');
    setPartidos(data.map(mapearPartido));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Resultados de Partidos</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          {pendientes} pendientes · {finalizados} finalizados
        </p>
      </div>

      {/* Filtros */}
      <div className="flex gap-2 flex-wrap">
        {[
          { key: 'todos', label: 'Todos' },
          { key: 'programado', label: 'Pendientes' },
          { key: 'finalizado', label: 'Finalizados' },
        ].map(({ key, label }) => (
          <button key={key} onClick={() => setFiltro(key)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              filtro === key
                ? 'bg-[#1a3a6b] text-white'
                : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-300'
            }`}>
            {label}
          </button>
        ))}
      </div>

      {/* Lista de partidos */}
      <div className="space-y-3">
        {partidosFiltrados.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <CheckCircle size={32} className="mx-auto mb-2 opacity-20" />
            <p className="text-sm">No hay partidos con ese filtro.</p>
          </div>
        ) : (
          partidosFiltrados.map(p => (
            <PartidoCard key={p.id} partido={p} onRegistrar={setPartidoActivo} />
          ))
        )}
      </div>

      {/* Panel registro */}
      {partidoActivo && (
        <PanelRegistro
          partido={partidoActivo}
          onGuardar={actualizarPartido}
          onCerrar={() => setPartidoActivo(null)}
        />
      )}
    </div>
  );
}