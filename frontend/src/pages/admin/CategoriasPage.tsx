import { useState, useEffect } from 'react';
import { api } from '@/services/api';
import { Plus, Pencil, X, CheckCircle, Tag } from 'lucide-react';
import type { Categoria } from '@/types';

// ─── Campo auxiliar (fuera del modal para evitar pérdida de foco) ─────────────
function Campo({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
      {children}
      {error && <p className="text-xs text-red-500 mt-0.5">{error}</p>}
    </div>
  );
}
interface FormCategoria {
  nombre: string;
  edad_min: string;
  edad_max: string;
  descripcion: string;
  activo: boolean;
}

function ModalCategoria({
  categoria,
  onClose,
  onGuardar,
}: {
  categoria?: Categoria;
  onClose: () => void;
  onGuardar: (data: FormCategoria) => void;
}) {
    const [form, setForm] = useState<FormCategoria>({
    nombre:      categoria?.nombre      ?? '',
    edad_min:    String(categoria?.edad_min ?? 10),
    edad_max:    String(categoria?.edad_max ?? 18),
    descripcion: categoria?.descripcion ?? '',
    activo:      categoria?.activo      ?? true,
  });
  const [errors, setErrors] = useState<Partial<Record<keyof FormCategoria, string>>>({});

  const set = (k: keyof FormCategoria, v: string | boolean) => {
    setForm(f => ({ ...f, [k]: v }));
    setErrors(e => ({ ...e, [k]: '' }));
  };

  const validar = () => {
    const e: typeof errors = {};
    if (!form.nombre.trim()) e.nombre = 'Requerido';
    if (!form.edad_min || isNaN(Number(form.edad_min))) e.edad_min = 'Número válido';
    if (!form.edad_max || isNaN(Number(form.edad_max))) e.edad_max = 'Número válido';
    if (Number(form.edad_min) >= Number(form.edad_max)) e.edad_max = 'Debe ser mayor que edad mínima';
    return e;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validar();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    onGuardar(form);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="font-bold text-gray-800">{categoria ? 'Editar Categoría' : 'Nueva Categoría'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          <Campo label="Nombre *" error={errors.nombre}>
            <input
              value={form.nombre}
              onChange={e => set('nombre', e.target.value)}
              placeholder="Ej: Sub-17, Mayor, Veterano..."
              className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a6b] ${errors.nombre ? 'border-red-400' : 'border-gray-200'}`}
            />
          </Campo>

          <div className="grid grid-cols-2 gap-3">
            <Campo label="Edad mínima *" error={errors.edad_min}>
              <input
                type="number" min={5} max={99}
                value={form.edad_min}
                onChange={e => set('edad_min', e.target.value)}
                className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a6b] ${errors.edad_min ? 'border-red-400' : 'border-gray-200'}`}
              />
            </Campo>
            <Campo label="Edad máxima *" error={errors.edad_max}>
              <input
                type="number" min={5} max={99}
                value={form.edad_max}
                onChange={e => set('edad_max', e.target.value)}
                className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a6b] ${errors.edad_max ? 'border-red-400' : 'border-gray-200'}`}
              />
            </Campo>
          </div>

          <Campo label="Descripción (opcional)">
            <textarea
              value={form.descripcion}
              onChange={e => set('descripcion', e.target.value)}
              rows={2}
              placeholder="Descripción breve de la categoría..."
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a6b] resize-none"
            />
          </Campo>

          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.activo}
              onChange={e => set('activo', e.target.checked)}
              className="w-4 h-4 accent-[#1a3a6b]" />
            <span className="text-sm text-gray-700">Categoría activa</span>
          </label>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50">
              Cancelar
            </button>
            <button type="submit"
              className="flex-1 py-2.5 bg-[#1a3a6b] text-white rounded-xl text-sm font-medium hover:bg-blue-800 transition-colors">
              {categoria ? 'Guardar' : 'Crear'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Fila de categoría ────────────────────────────────────────────────────────
function FilaCategoria({
  cat,
  onEditar,
  onToggle,
}: {
  cat: Categoria;
  onEditar: (c: Categoria) => void;
  onToggle: (id: number) => void;
}) {
  return (
    <div className={`flex items-center justify-between px-5 py-3.5 rounded-xl border transition-all ${
      cat.activo ? 'bg-white border-gray-100 shadow-sm' : 'bg-gray-50 border-gray-100 opacity-60'
    }`}>
      <div className="flex items-center gap-4">
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${cat.activo ? 'bg-[#1a3a6b]/10' : 'bg-gray-200'}`}>
          <Tag size={15} className={cat.activo ? 'text-[#1a3a6b]' : 'text-gray-400'} />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <p className="font-semibold text-gray-800 text-sm">{cat.nombre}</p>
            {cat.activo
              ? <span className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded-full font-medium">Activa</span>
              : <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full font-medium">Inactiva</span>
            }
          </div>
          <p className="text-xs text-gray-400 mt-0.5">
            {cat.edad_min}–{cat.edad_max === 99 ? '99+' : cat.edad_max} años
            {cat.descripcion ? ` · ${cat.descripcion}` : ''}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button onClick={() => onEditar(cat)}
          className="p-1.5 text-gray-400 hover:text-[#1a3a6b] transition-colors rounded-lg hover:bg-blue-50">
          <Pencil size={14} />
        </button>
        <button onClick={() => onToggle(cat.id)}
          className={`px-3 py-1 text-xs rounded-lg font-medium transition-colors ${
            cat.activo
              ? 'text-red-500 hover:bg-red-50'
              : 'text-green-600 hover:bg-green-50'
          }`}>
          {cat.activo ? 'Desactivar' : 'Activar'}
        </button>
      </div>
    </div>
  );
}

// ─── Página principal ──────────────────────────────────────────────────────────
export default function CategoriasPage() {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [modal, setModal] = useState(false);
  const [editando, setEditando] = useState<Categoria | undefined>();

  const activas = categorias.filter(c => c.activo).length;

  useEffect(() => {
    api.get('/categorias')
      .then(data => setCategorias(data.map((c: any) => ({
        ...c,
        edad_min: c.edadMin,
        edad_max: c.edadMax,
      }))))
      .catch(console.error);
  }, []);

  const guardar = async (form: FormCategoria) => {
    const body = {
      nombre:      form.nombre,
      edadMin:     Number(form.edad_min),
      edadMax:     Number(form.edad_max),
      descripcion: form.descripcion,
      activo:      form.activo,
    };

    if (editando) {
      const actualizada = await api.put(`/categorias/${editando.id}`, body);
      const mapeada = { ...actualizada, edad_min: actualizada.edadMin, edad_max: actualizada.edadMax };
      setCategorias(categorias.map(c => c.id === editando.id ? mapeada : c));
    } else {
      const nueva = await api.post('/categorias', body);
      const mapeada = { ...nueva, edad_min: nueva.edadMin, edad_max: nueva.edadMax };
      setCategorias([...categorias, mapeada]);
    }
  };

  const toggleActivo = async (id: number) => {
    const actualizada = await api.patch(`/categorias/${id}/toggle`);
    const mapeada = { ...actualizada, edad_min: actualizada.edadMin, edad_max: actualizada.edadMax };
    setCategorias(categorias.map(c => c.id === id ? mapeada : c));
  };

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Categorías Deportivas</h1>
          <p className="text-sm text-gray-500 mt-0.5">{activas} activas · {categorias.length} en total</p>
        </div>
        <button
          onClick={() => { setEditando(undefined); setModal(true); }}
          className="flex items-center gap-2 bg-[#1a3a6b] text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-blue-800 transition-colors shadow-sm"
        >
          <Plus size={16} /> Nueva Categoría
        </button>
      </div>

      {/* Info */}
      <div className="flex items-start gap-2 bg-blue-50 border border-blue-100 rounded-xl px-4 py-3">
        <CheckCircle size={14} className="text-blue-500 mt-0.5 shrink-0" />
        <p className="text-xs text-blue-700">
          Las categorías activas están disponibles al crear torneos e inscribir jugadores.
          Desactivar una categoría no elimina los datos históricos.
        </p>
      </div>

      {/* Lista */}
      <div className="space-y-2">
        {categorias.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <Tag size={32} className="mx-auto mb-2 opacity-20" />
            <p className="text-sm">No hay categorías registradas.</p>
          </div>
        ) : (
          categorias.map(cat => (
            <FilaCategoria
              key={cat.id}
              cat={cat}
              onEditar={c => { setEditando(c); setModal(true); }}
              onToggle={toggleActivo}
            />
          ))
        )}
      </div>

      {modal && (
        <ModalCategoria
          categoria={editando}
          onClose={() => { setModal(false); setEditando(undefined); }}
          onGuardar={guardar}
        />
      )}
    </div>
  );
}