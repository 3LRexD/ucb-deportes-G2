import { useState } from 'react';
import {
  CheckCircle, XCircle, ChevronDown, ChevronUp,
  Calendar, Clock, MapPin, Save, Users, ClipboardList,
} from 'lucide-react';
import { mockEquipos } from '@/data/mockData';
import { mockSesiones, mockAsistencias } from '@/data/mockDataSprint3';
import type { Sesion, RegistroAsistencia } from '@/types';

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatFecha(f: string) {
  return new Date(f + 'T12:00:00').toLocaleDateString('es-BO', {
    weekday: 'long', day: '2-digit', month: 'long',
  });
}

// ─── Fila de asistencia de un jugador ─────────────────────────────────────────
function FilaJugador({
  registro,
  onChange,
}: {
  registro: RegistroAsistencia;
  onChange: (ci: string, presente: boolean, obs: string) => void;
}) {
  const [obsAbierta, setObsAbierta] = useState(!!registro.observacion);

  return (
    <div className={`rounded-xl border px-4 py-3 transition-all ${
      registro.presente ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
    }`}>
      <div className="flex items-center justify-between gap-3">
        {/* Avatar + nombre */}
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
            registro.presente ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'
          }`}>
            {registro.deportista_nombre.split(' ').map(n => n[0]).join('').slice(0, 2)}
          </div>
          <div>
            <p className="text-sm font-medium text-gray-800">{registro.deportista_nombre}</p>
            <p className="text-xs text-gray-400 font-mono">CI: {registro.deportista_ci}</p>
          </div>
        </div>

        {/* Toggle presente/ausente */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => onChange(registro.deportista_ci, true, registro.observacion ?? '')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              registro.presente
                ? 'bg-green-500 text-white shadow-sm'
                : 'bg-white border border-gray-200 text-gray-500 hover:border-green-300'
            }`}
          >
            <CheckCircle size={12} /> Presente
          </button>
          <button
            onClick={() => onChange(registro.deportista_ci, false, registro.observacion ?? '')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              !registro.presente
                ? 'bg-red-500 text-white shadow-sm'
                : 'bg-white border border-gray-200 text-gray-500 hover:border-red-300'
            }`}
          >
            <XCircle size={12} /> Ausente
          </button>
        </div>
      </div>

      {/* Observación */}
      {!registro.presente && (
        <div className="mt-2">
          <input
            type="text"
            value={registro.observacion ?? ''}
            onChange={e => onChange(registro.deportista_ci, registro.presente, e.target.value)}
            placeholder="Motivo de ausencia (opcional)"
            className="w-full text-xs border border-red-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-red-400 bg-white"
          />
        </div>
      )}
    </div>
  );
}

// ─── Card de sesión ───────────────────────────────────────────────────────────
function SesionCard({ sesion }: { sesion: Sesion }) {
  const [expandida, setExpandida] = useState(false);
  const [guardado, setGuardado] = useState(false);

  const equipo = mockEquipos.find(e => e.id === sesion.equipo_id);
  const jugadores = equipo?.jugadores ?? [];

  // Inicializar asistencias: primero checar mock, resto como presentes
  const asistenciasIniciales: RegistroAsistencia[] = jugadores.map(j => {
    const existente = mockAsistencias.find(
      a => a.sesion_id === sesion.id && a.deportista_ci === j.ci
    );
    return existente ?? {
      sesion_id: sesion.id,
      deportista_ci: j.ci,
      deportista_nombre: j.nombre_completo,
      presente: true,
    };
  });

  const [asistencias, setAsistencias] = useState<RegistroAsistencia[]>(asistenciasIniciales);

  const actualizarAsistencia = (ci: string, presente: boolean, observacion: string) => {
    setGuardado(false);
    setAsistencias(prev => prev.map(a =>
      a.deportista_ci === ci ? { ...a, presente, observacion } : a
    ));
  };

  const guardar = () => {
    // TODO: POST /api/asistencias con { sesion_id, registros: asistencias }
    setGuardado(true);
  };

  const presentes = asistencias.filter(a => a.presente).length;
  const ausentes = asistencias.filter(a => !a.presente).length;

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Header clickeable */}
      <button
        onClick={() => setExpandida(!expandida)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors text-left"
      >
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-[#1a3a6b]/10 rounded-xl flex items-center justify-center shrink-0">
            <ClipboardList size={18} className="text-[#1a3a6b]" />
          </div>
          <div>
            <p className="font-semibold text-gray-800">{sesion.equipo_nombre}</p>
            <p className="text-xs text-gray-400 mt-0.5">
              {sesion.disciplina_nombre} · {sesion.entrenador_nombre}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex flex-col items-end gap-1 text-xs text-gray-500">
            <span className="flex items-center gap-1"><Calendar size={11} />{formatFecha(sesion.fecha)}</span>
            <span className="flex items-center gap-1"><Clock size={11} />{sesion.hora_inicio} – {sesion.hora_fin}</span>
            <span className="flex items-center gap-1"><MapPin size={11} />{sesion.espacio_nombre}</span>
          </div>
          {expandida
            ? <ChevronUp size={16} className="text-gray-400" />
            : <ChevronDown size={16} className="text-gray-400" />
          }
        </div>
      </button>

      {/* Cuerpo expandido */}
      {expandida && (
        <div className="border-t border-gray-100 px-5 py-4 space-y-4">
          {/* Stats rápidas */}
          <div className="flex gap-3">
            <div className="flex items-center gap-1.5 text-xs font-medium text-green-700 bg-green-50 px-3 py-1.5 rounded-lg">
              <CheckCircle size={12} /> {presentes} presentes
            </div>
            <div className="flex items-center gap-1.5 text-xs font-medium text-red-600 bg-red-50 px-3 py-1.5 rounded-lg">
              <XCircle size={12} /> {ausentes} ausentes
            </div>
            <div className="flex items-center gap-1.5 text-xs font-medium text-gray-500 bg-gray-100 px-3 py-1.5 rounded-lg">
              <Users size={12} /> {jugadores.length} total
            </div>
          </div>

          {/* Observaciones de la sesión */}
          {sesion.observaciones && (
            <div className="bg-amber-50 border border-amber-100 rounded-lg px-3 py-2 text-xs text-amber-800">
              📋 {sesion.observaciones}
            </div>
          )}

          {/* Lista de jugadores */}
          {jugadores.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">Sin jugadores inscritos en este equipo.</p>
          ) : (
            <div className="space-y-2">
              {asistencias.map(reg => (
                <FilaJugador
                  key={reg.deportista_ci}
                  registro={reg}
                  onChange={actualizarAsistencia}
                />
              ))}
            </div>
          )}

          {/* Guardar */}
          <div className="flex items-center justify-between pt-2">
            {guardado && (
              <span className="flex items-center gap-1.5 text-xs text-green-600 font-medium">
                <CheckCircle size={13} /> Asistencia guardada
              </span>
            )}
            <button
              onClick={guardar}
              disabled={jugadores.length === 0}
              className="ml-auto flex items-center gap-2 bg-[#1a3a6b] text-white px-5 py-2 rounded-xl text-sm font-medium hover:bg-blue-800 transition-colors disabled:opacity-40"
            >
              <Save size={14} /> Guardar asistencia
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Página principal ──────────────────────────────────────────────────────────
export default function AsistenciaPage() {
  const [filtroEquipo, setFiltroEquipo] = useState<number | 'todos'>('todos');

  const sesionesFiltradas = filtroEquipo === 'todos'
    ? mockSesiones
    : mockSesiones.filter(s => s.equipo_id === filtroEquipo);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Asistencia a Entrenamientos</h1>
        <p className="text-sm text-gray-500 mt-0.5">{mockSesiones.length} sesiones registradas</p>
      </div>

      {/* Filtro por equipo */}
      <div className="flex items-center gap-3 flex-wrap">
        <span className="text-xs font-medium text-gray-500">Filtrar:</span>
        <button
          onClick={() => setFiltroEquipo('todos')}
          className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
            filtroEquipo === 'todos'
              ? 'bg-[#1a3a6b] text-white'
              : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-300'
          }`}
        >
          Todos
        </button>
        {mockEquipos.map(eq => (
          <button
            key={eq.id}
            onClick={() => setFiltroEquipo(eq.id)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              filtroEquipo === eq.id
                ? 'bg-[#1a3a6b] text-white'
                : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-300'
            }`}
          >
            {eq.nombre}
          </button>
        ))}
      </div>

      {/* Lista de sesiones */}
      <div className="space-y-3">
        {sesionesFiltradas.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <ClipboardList size={32} className="mx-auto mb-2 opacity-20" />
            <p className="text-sm">No hay sesiones de entrenamiento registradas.</p>
          </div>
        ) : (
          sesionesFiltradas.map(sesion => (
            <SesionCard key={sesion.id} sesion={sesion} />
          ))
        )}
      </div>
    </div>
  );
}