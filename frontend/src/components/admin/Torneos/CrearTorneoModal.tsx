import React, { useState, useEffect } from 'react';
import { CalendarioSelector } from './CalendarioSelector';
import type { CreateTorneoDto, Disciplina, Categoria } from '../../../types/torneos.types';

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (dto: CreateTorneoDto) => Promise<void>;
  disciplinas: Disciplina[];
  categorias: Categoria[];
  torneoInicial?: Partial<CreateTorneoDto> & { id_torneo?: number };
}

const TIPOS = [
  { value: 'intercarreras', label: 'Intercarreras' },
  { value: 'externo',       label: 'Torneo externo' },
  { value: 'amistoso',      label: 'Amistoso' },
  { value: 'copa',          label: 'Copa' },
];

const FORMATOS = [
  { value: 'liga',                label: 'Liga (todos contra todos)' },
  { value: 'eliminacion_directa', label: 'Eliminación directa' },
  { value: 'grupos_eliminacion',  label: 'Grupos + Eliminación' },
];

const EMPTY: CreateTorneoDto = {
  nombre: '', disciplina_id: 0, categoria_id: 0,
  tipo: 'intercarreras', formato: 'liga',
  temporada: String(new Date().getFullYear()),
  fecha_inicio: '', fecha_fin: '', reglas: '',
};

export const CrearTorneoModal: React.FC<Props> = ({
  open, onClose, onSubmit, disciplinas, categorias, torneoInicial
}) => {
  const [form, setForm]       = useState<CreateTorneoDto>(EMPTY);
  const [errors, setErrors]   = useState<Partial<Record<keyof CreateTorneoDto, string>>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) setForm(torneoInicial ? { ...EMPTY, ...torneoInicial } : EMPTY);
    setErrors({});
  }, [open, torneoInicial]);

  const set = <K extends keyof CreateTorneoDto>(k: K, v: CreateTorneoDto[K]) =>
    setForm(f => ({ ...f, [k]: v }));

  const validate = () => {
    const e: typeof errors = {};
    if (!form.nombre.trim())   e.nombre       = 'El nombre es requerido';
    if (!form.disciplina_id)   e.disciplina_id = 'Selecciona una disciplina' as any;
    if (!form.categoria_id)    e.categoria_id  = 'Selecciona una categoría' as any;
    if (!form.fecha_inicio)    e.fecha_inicio  = 'Selecciona las fechas';
    if (!form.fecha_fin)       e.fecha_fin     = 'Selecciona la fecha de fin';
    if (form.fecha_inicio && form.fecha_fin && form.fecha_inicio >= form.fecha_fin)
      e.fecha_fin = 'La fecha fin debe ser posterior al inicio';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    try {
      setLoading(true);
      await onSubmit(form);
      onClose();
    } catch (e: any) {
      setErrors({ nombre: e.message });
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
         onClick={e => e.target === e.currentTarget && onClose()}>
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200" />

      {/* Panel */}
      <div className="relative z-10 w-full sm:max-w-lg bg-white sm:rounded-2xl shadow-2xl
                      animate-in slide-in-from-bottom duration-300 max-h-[95vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between z-10">
          <div>
            <h2 className="font-bold text-gray-900 text-lg">
              {torneoInicial?.id_torneo ? 'Editar torneo' : 'Nuevo torneo'}
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">Completa los datos del torneo</p>
          </div>
          <button onClick={onClose}
            className="p-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="px-6 py-5 space-y-5">
          {/* Nombre */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Nombre del torneo <span className="text-[#E31837]">*</span>
            </label>
            <input
              type="text"
              value={form.nombre}
              onChange={e => set('nombre', e.target.value)}
              placeholder="Ej: Intercarreras Fútsal 2026"
              className={`w-full px-4 py-2.5 rounded-xl border-2 text-sm outline-none transition-colors
                ${errors.nombre ? 'border-[#E31837]' : 'border-gray-200 focus:border-[#003DA5]'}`}
            />
            {errors.nombre && <p className="text-xs text-[#E31837] mt-1">{errors.nombre}</p>}
          </div>

          {/* Tipo + Formato */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Tipo</label>
              <select
                value={form.tipo}
                onChange={e => set('tipo', e.target.value as any)}
                className="w-full px-3 py-2.5 rounded-xl border-2 border-gray-200 focus:border-[#003DA5] text-sm outline-none bg-white"
              >
                {TIPOS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Formato</label>
              <select
                value={form.formato}
                onChange={e => set('formato', e.target.value as any)}
                className="w-full px-3 py-2.5 rounded-xl border-2 border-gray-200 focus:border-[#003DA5] text-sm outline-none bg-white"
              >
                {FORMATOS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
              </select>
            </div>
          </div>

          {/* Disciplina + Categoría */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Disciplina <span className="text-[#E31837]">*</span>
              </label>
              <select
                value={form.disciplina_id || ''}
                onChange={e => set('disciplina_id', Number(e.target.value))}
                className={`w-full px-3 py-2.5 rounded-xl border-2 text-sm outline-none bg-white
                  ${errors.disciplina_id ? 'border-[#E31837]' : 'border-gray-200 focus:border-[#003DA5]'}`}
              >
                <option value="">Seleccionar…</option>
                {disciplinas.map(d => (
                  <option key={d.id_disciplina} value={d.id_disciplina}>{d.nombre}</option>
                ))}
              </select>
              {errors.disciplina_id && <p className="text-xs text-[#E31837] mt-1">{errors.disciplina_id as string}</p>}
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Categoría <span className="text-[#E31837]">*</span>
              </label>
              <select
                value={form.categoria_id || ''}
                onChange={e => set('categoria_id', Number(e.target.value))}
                className={`w-full px-3 py-2.5 rounded-xl border-2 text-sm outline-none bg-white
                  ${errors.categoria_id ? 'border-[#E31837]' : 'border-gray-200 focus:border-[#003DA5]'}`}
              >
                <option value="">Seleccionar…</option>
                {categorias.map(c => (
                  <option key={c.id_categoria} value={c.id_categoria}>{c.nombre}</option>
                ))}
              </select>
              {errors.categoria_id && <p className="text-xs text-[#E31837] mt-1">{errors.categoria_id as string}</p>}
            </div>
          </div>

          {/* Temporada */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Temporada</label>
            <input
              type="text"
              value={form.temporada}
              onChange={e => set('temporada', e.target.value)}
              placeholder="2026"
              className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-200 focus:border-[#003DA5] text-sm outline-none"
            />
          </div>

          {/* Calendario animado */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Período del torneo <span className="text-[#E31837]">*</span>
            </label>
            <CalendarioSelector
              fechaInicio={form.fecha_inicio}
              fechaFin={form.fecha_fin}
              onChangeFechaInicio={v => set('fecha_inicio', v)}
              onChangeFechaFin={v => set('fecha_fin', v)}
              error={errors.fecha_inicio || errors.fecha_fin}
            />
          </div>

          {/* Reglas */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Reglas / Observaciones</label>
            <textarea
              value={form.reglas}
              onChange={e => set('reglas', e.target.value)}
              rows={3}
              placeholder="Reglas especiales, observaciones del torneo…"
              className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-200 focus:border-[#003DA5] text-sm outline-none resize-none"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-gray-100 px-6 py-4 flex gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 py-2.5 rounded-xl border-2 border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 py-2.5 rounded-xl bg-[#003DA5] text-white text-sm font-semibold
                       hover:bg-[#002d7a] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading && (
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3V4a10 10 0 100 20v-4l-3 3 3 3v-4a8 8 0 01-8-8z"/>
              </svg>
            )}
            {torneoInicial?.id_torneo ? 'Guardar cambios' : 'Crear torneo'}
          </button>
        </div>
      </div>
    </div>
  );
};