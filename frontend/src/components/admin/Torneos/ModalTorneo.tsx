import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { api } from '@/services/api';
import { mockDisciplinas } from '@/data/mockData';
import type { Torneo } from '@/types';
import { TIPO_LABELS, FORMATO_LABELS, ESTADO_CONFIG } from './constants';

export interface FormTorneo {
  nombre: string;
  disciplina_id: string;
  categoria_id: string;
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
  nombre: '', disciplina_id: '', categoria_id: '',
  tipo: 'intercarreras', formato: '', categoria: '', temporada: '',
  fecha_inicio: '', fecha_fin: '', estado: '', reglas: ''
};

function Campo({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
      {children}
      {error && <p className="text-xs text-red-500 mt-0.5">{error}</p>}
    </div>
  );
}

export function ModalTorneo({
  torneo, onClose, onGuardar,
}: {
  torneo?: Torneo;
  onClose: () => void;
  onGuardar: (data: FormTorneo) => void;
}) {
  const [form, setForm] = useState<FormTorneo>(
    torneo
      ? {
          nombre:        torneo.nombre,
          disciplina_id: String(torneo.disciplina_id),
          categoria_id:  String(torneo.categoria_id ?? ''),
          tipo:          torneo.tipo,
          formato:       torneo.formato,
          categoria:     torneo.categoria,
          temporada:     torneo.temporada,
          fecha_inicio:  torneo.fecha_inicio,
          fecha_fin:     torneo.fecha_fin,
          estado:        torneo.estado,
          reglas:        torneo.reglas || '',
        }
      : FORM_INICIAL
  );

  const [categoriasDB, setCategoriasDB] = useState<{id: number, nombre: string, activo: boolean}[]>([]);
  useEffect(() => {
    api.get('/categorias').then(setCategoriasDB).catch(console.error);
  }, []);
  
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
          <Campo label="Nombre del torneo *" error={errors.nombre}>
            <input
              value={form.nombre}
              onChange={e => set('nombre', e.target.value)}
              placeholder="Ej: Intercarreras Fútsal 2026"
              className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a6b] ${errors.nombre ? 'border-red-400' : 'border-gray-200'}`}
            />
          </Campo>

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

          <div className="grid grid-cols-2 gap-3">
            <Campo label="Categoría">
              <select value={form.categoria_id} onChange={e => set('categoria_id', e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a6b]">
                {categoriasDB.filter(c => c.activo !== false).map(c => (
                  <option key={c.id} value={c.id}>{c.nombre}</option>
                ))}
              </select>
            </Campo>
            <Campo label="Temporada">
              <input value={form.temporada} onChange={e => set('temporada', e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a6b]" />
            </Campo>
          </div>

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

          <Campo label="Estado">
            <select value={form.estado} onChange={e => set('estado', e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a6b]">
              {Object.entries(ESTADO_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
            </select>
          </Campo>

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
