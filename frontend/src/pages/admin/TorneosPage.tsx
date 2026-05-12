// pages/admin/TorneosPage.tsx
// HU-GES-06: Gestionar torneos y competencias
// Crear torneo: nombre, disciplina, fechas, formato / Estado

import { useState } from 'react';
import {
  Plus, Trophy, Calendar, ChevronDown, ChevronUp,
  X, Users, Clock, CheckCircle, AlertCircle, Ban, PlayCircle,
} from 'lucide-react';
import { mockTorneos, mockDisciplinas, mockEquipos } from '@/data/mockData';
import type { Torneo } from '@/types';

// ─── Helpers ──────────────────────────────────────────────────────────────────
const ESTADO_CONFIG = {
  planificado: { label: 'Planificado', color: 'bg-blue-50 text-blue-700', icon: Clock },
  en_curso:    { label: 'En curso',    color: 'bg-green-50 text-green-700', icon: PlayCircle },
  finalizado:  { label: 'Finalizado',  color: 'bg-gray-100 text-gray-500', icon: CheckCircle },
  cancelado:   { label: 'Cancelado',   color: 'bg-red-50 text-red-600',    icon: Ban },
};

const FORMATO_LABELS: Record<string, string> = {
  liga: 'Liga (todos contra todos)',
  eliminacion_directa: 'Eliminación directa',
  grupos_eliminacion: 'Fase de grupos + Eliminación',
};

const TIPO_LABELS: Record<string, string> = {
  intercarreras: 'Intercarreras',
  externo: 'Externo',
  amistoso: 'Amistoso',
};

function BadgeEstado({ estado }: { estado: Torneo['estado'] }) {
  const cfg = ESTADO_CONFIG[estado];
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full ${cfg.color}`}>
      <Icon size={11} />
      {cfg.label}
    </span>
  );
}

// ─── Modal Crear/Editar Torneo ────────────────────────────────────────────────
interface FormTorneo {
  nombre: string;
  disciplina_id: string;
  tipo: string;
  formato: string;
  categoria: string;
  temporada: string;
  fecha_inicio: string;
  fecha_fin: string;
  estado: string;
  reglas: string;
}

const FORM_INICIAL: FormTorneo = {
  nombre: '', disciplina_id: '', tipo: 'intercarreras',
  formato: 'liga', categoria: 'Mayor', temporada: '2026',
  fecha_inicio: '', fecha_fin: '', estado: 'planificado', reglas: '',
};

// ⚠️ Definido FUERA del modal — si estuviera adentro React lo re-crea
// en cada render y el campo pierde el foco después de cada letra
function Campo({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
      {children}
      {error && <p className="text-xs text-red-500 mt-0.5">{error}</p>}
    </div>
  );
}

function ModalTorneo({
  torneo, onClose, onGuardar,
}: {
  torneo?: Torneo;
  onClose: () => void;
  onGuardar: (data: FormTorneo) => void;
}) {
  const [form, setForm] = useState<FormTorneo>(
    torneo
      ? {
          nombre: torneo.nombre,
          disciplina_id: String(torneo.disciplina_id),
          tipo: torneo.tipo,
          formato: torneo.formato,
          categoria: torneo.categoria,
          temporada: torneo.temporada,
          fecha_inicio: torneo.fecha_inicio,
          fecha_fin: torneo.fecha_fin,
          estado: torneo.estado,
          reglas: torneo.reglas || '',
        }
      : FORM_INICIAL
  );
  const [errors, setErrors] = useState<Partial<FormTorneo>>({});

  const set = (k: keyof FormTorneo, v: string) => {
    setForm(f => ({ ...f, [k]: v }));
    setErrors(e => ({ ...e, [k]: '' }));
  };

  const validar = () => {
    const e: Partial<FormTorneo> = {};
    if (!form.nombre.trim()) e.nombre = 'Requerido';
    if (!form.disciplina_id) e.disciplina_id = 'Requerido';
    if (!form.fecha_inicio) e.fecha_inicio = 'Requerido';
    if (!form.fecha_fin) e.fecha_fin = 'Requerido';
    if (form.fecha_inicio && form.fecha_fin && form.fecha_inicio > form.fecha_fin)
      e.fecha_fin = 'Debe ser posterior a la fecha de inicio';
    return e;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const e2 = validar();
    if (Object.keys(e2).length) { setErrors(e2); return; }
    onGuardar(form);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-start justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg my-8">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="font-bold text-gray-800 text-lg">
            {torneo ? 'Editar Torneo' : 'Crear Torneo'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {/* Nombre */}
          <Campo label="Nombre del torneo *" error={errors.nombre}>
            <input
              value={form.nombre}
              onChange={e => set('nombre', e.target.value)}
              placeholder="Ej: Intercarreras Fútsal 2026"
              className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a6b] ${errors.nombre ? 'border-red-400' : 'border-gray-200'}`}
            />
          </Campo>

          {/* Disciplina + Tipo */}
          <div className="grid grid-cols-2 gap-3">
            <Campo label="Disciplina *" error={errors.disciplina_id}>
              <select
                value={form.disciplina_id}
                onChange={e => set('disciplina_id', e.target.value)}
                className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a6b] ${errors.disciplina_id ? 'border-red-400' : 'border-gray-200'}`}
              >
                <option value="">Seleccionar...</option>
                {mockDisciplinas.filter(d => d.activo).map(d => (
                  <option key={d.id} value={d.id}>{d.nombre}</option>
                ))}
              </select>
            </Campo>
            <Campo label="Tipo">
              <select value={form.tipo} onChange={e => set('tipo', e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a6b]">
                {Object.entries(TIPO_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </Campo>
          </div>

          {/* Formato */}
          <Campo label="Formato de competencia">
            <div className="grid grid-cols-1 gap-2">
              {Object.entries(FORMATO_LABELS).map(([k, v]) => (
                <label key={k} className={`flex items-center gap-2 border rounded-lg px-3 py-2 cursor-pointer transition-colors ${
                  form.formato === k ? 'border-[#1a3a6b] bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                }`}>
                  <input type="radio" name="formato" value={k} checked={form.formato === k}
                    onChange={() => set('formato', k)} className="accent-[#1a3a6b]" />
                  <span className="text-sm text-gray-700">{v}</span>
                </label>
              ))}
            </div>
          </Campo>

          {/* Categoría + Temporada */}
          <div className="grid grid-cols-2 gap-3">
            <Campo label="Categoría">
              <select value={form.categoria} onChange={e => set('categoria', e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a6b]">
                {['Sub-13', 'Sub-15', 'Juvenil', 'Mayor'].map(c => <option key={c}>{c}</option>)}
              </select>
            </Campo>
            <Campo label="Temporada">
              <input value={form.temporada} onChange={e => set('temporada', e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a6b]" />
            </Campo>
          </div>

          {/* Fechas */}
          <div className="grid grid-cols-2 gap-3">
            <Campo label="Fecha de inicio *" error={errors.fecha_inicio}>
              <input type="date" value={form.fecha_inicio} onChange={e => set('fecha_inicio', e.target.value)}
                className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a6b] ${errors.fecha_inicio ? 'border-red-400' : 'border-gray-200'}`} />
            </Campo>
            <Campo label="Fecha de fin *" error={errors.fecha_fin}>
              <input type="date" value={form.fecha_fin} onChange={e => set('fecha_fin', e.target.value)}
                className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a6b] ${errors.fecha_fin ? 'border-red-400' : 'border-gray-200'}`} />
            </Campo>
          </div>

          {/* Estado */}
          <Campo label="Estado">
            <select value={form.estado} onChange={e => set('estado', e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a6b]">
              {Object.entries(ESTADO_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
            </select>
          </Campo>

          {/* Reglas opcionales */}
          <Campo label="Reglas / Observaciones (opcional)">
            <textarea value={form.reglas} onChange={e => set('reglas', e.target.value)}
              rows={2} placeholder="Ej: 5 jugadores en cancha, tiempo corrido..."
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a6b] resize-none" />
          </Campo>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50">
              Cancelar
            </button>
            <button type="submit"
              className="flex-1 py-2.5 bg-[#1a3a6b] text-white rounded-xl text-sm font-medium hover:bg-blue-800 transition-colors">
              {torneo ? 'Guardar cambios' : 'Crear Torneo'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Card de torneo ───────────────────────────────────────────────────────────
function TorneoCard({ torneo, onEditar }: { torneo: Torneo; onEditar: (t: Torneo) => void }) {
  const [expandido, setExpandido] = useState(false);
  const equiposDelTorneo = mockEquipos.filter(e => e.torneo_id === torneo.id);

  const formatFecha = (f: string) =>
    new Date(f + 'T12:00:00').toLocaleDateString('es-BO', { day: '2-digit', month: 'short', year: 'numeric' });

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
            <BadgeEstado estado={torneo.estado} />
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

// ─── Página principal ──────────────────────────────────────────────────────────
export default function TorneosPage() {
  const [torneos, setTorneos] = useState<Torneo[]>(mockTorneos);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [torneoEditando, setTorneoEditando] = useState<Torneo | undefined>();
  const [filtroEstado, setFiltroEstado] = useState<string>('todos');

  const torneosFiltrados = filtroEstado === 'todos'
    ? torneos
    : torneos.filter(t => t.estado === filtroEstado);

  const guardarTorneo = (form: FormTorneo) => {
    const disc = mockDisciplinas.find(d => d.id === Number(form.disciplina_id));
    if (torneoEditando) {
      // TODO: PUT /api/torneos/{id}
      setTorneos(torneos.map(t =>
        t.id === torneoEditando.id
          ? {
              ...t,
              ...form,
              disciplina_id: Number(form.disciplina_id),
              disciplina_nombre: disc?.nombre || '',
              tipo: form.tipo as Torneo['tipo'],
              formato: form.formato as Torneo['formato'],
              estado: form.estado as Torneo['estado'],
            }
          : t
      ));
    } else {
      // TODO: POST /api/torneos
      const nuevo: Torneo = {
        id: Math.max(...torneos.map(t => t.id)) + 1,
        ...form,
        disciplina_id: Number(form.disciplina_id),
        disciplina_nombre: disc?.nombre || '',
        tipo: form.tipo as Torneo['tipo'],
        formato: form.formato as Torneo['formato'],
        estado: form.estado as Torneo['estado'],
      };
      setTorneos([...torneos, nuevo]);
    }
  };

  const counts = {
    todos: torneos.length,
    planificado: torneos.filter(t => t.estado === 'planificado').length,
    en_curso: torneos.filter(t => t.estado === 'en_curso').length,
    finalizado: torneos.filter(t => t.estado === 'finalizado').length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Torneos y Competencias</h1>
          <p className="text-sm text-gray-500 mt-0.5">{torneos.length} torneos registrados</p>
        </div>
        <button onClick={() => { setTorneoEditando(undefined); setModalAbierto(true); }}
          className="flex items-center gap-2 bg-[#1a3a6b] text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-blue-800 transition-colors shadow-sm">
          <Plus size={16} /> Crear Torneo
        </button>
      </div>

      {/* Filtros rápidos */}
      <div className="flex gap-2 flex-wrap">
        {[
          { key: 'todos', label: `Todos (${counts.todos})` },
          { key: 'planificado', label: `Planificado (${counts.planificado})` },
          { key: 'en_curso', label: `En curso (${counts.en_curso})` },
          { key: 'finalizado', label: `Finalizado (${counts.finalizado})` },
        ].map(({ key, label }) => (
          <button key={key} onClick={() => setFiltroEstado(key)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              filtroEstado === key
                ? 'bg-[#1a3a6b] text-white'
                : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-300'
            }`}>
            {label}
          </button>
        ))}
      </div>

      {/* Lista */}
      <div className="space-y-3">
        {torneosFiltrados.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <Trophy size={32} className="mx-auto mb-2 opacity-20" />
            <p className="text-sm">No hay torneos con ese filtro.</p>
          </div>
        ) : (
          torneosFiltrados.map(t => (
            <TorneoCard key={t.id} torneo={t}
              onEditar={(t) => { setTorneoEditando(t); setModalAbierto(true); }} />
          ))
        )}
      </div>

      {/* Modal */}
      {modalAbierto && (
        <ModalTorneo
          torneo={torneoEditando}
          onClose={() => { setModalAbierto(false); setTorneoEditando(undefined); }}
          onGuardar={guardarTorneo}
        />
      )}
    </div>
  );
}