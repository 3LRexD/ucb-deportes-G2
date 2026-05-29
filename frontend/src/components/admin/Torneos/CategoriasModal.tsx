import { useState, useEffect } from 'react';
import { X, Plus, Pencil, Trash2, Tag } from 'lucide-react';
import type { Categoria } from '@/types/torneos.types';
import { categoriasService } from '@/services/categoriasServices';


interface Props { onClose: () => void }

const EMPTY: Omit<Categoria, 'id_categoria' | 'created_at' | 'updated_at'> = {
  nombre: '', edad_min: 0, edad_max: 0, descripcion: '', activo: true,
};

export function CategoriasModal({ onClose }: Props) {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [editando, setEditando] = useState<Categoria | null>(null);
  const [form, setForm] = useState(EMPTY);
  const [modoCrear, setModoCrear] = useState(false);
  const [error, setError] = useState('');

  const cargar = async () => {
    setLoading(true);
    try { setCategorias(await categoriasService.getAll()); }
    catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  };

  useEffect(() => { cargar(); }, []);

  const guardar = async () => {
    setError('');
    try {
      if (editando) {
        await categoriasService.update(editando.id_categoria, form);
      } else {
        await categoriasService.create(form);
      }
      setEditando(null);
      setModoCrear(false);
      setForm(EMPTY);
      cargar();
    } catch (e: any) { setError(e.message); }
  };

  const eliminar = async (id: number) => {
    if (!confirm('¿Eliminar esta categoría?')) return;
    try { await categoriasService.delete(id); cargar(); }
    catch (e: any) { setError(e.message); }
  };

  const iniciarEdicion = (c: Categoria) => {
    setEditando(c);
    setForm({ nombre: c.nombre, edad_min: c.edad_min, edad_max: c.edad_max, descripcion: c.descripcion || '', activo: c.activo });
    setModoCrear(false);
  };

  const cancelar = () => { setEditando(null); setModoCrear(false); setForm(EMPTY); setError(''); };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b" style={{ backgroundColor: '#003DA5' }}>
          <div className="flex items-center gap-2 text-white">
            <Tag size={20} />
            <h2 className="text-lg font-bold">Categorías Deportivas</h2>
          </div>
          <button onClick={onClose} className="text-white hover:text-yellow-300 transition-colors">
            <X size={22} />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-2 text-sm">{error}</div>
          )}

          {/* Formulario */}
          {(modoCrear || editando) && (
            <div className="border-2 rounded-xl p-4 space-y-3" style={{ borderColor: '#FFD100' }}>
              <h3 className="font-semibold text-blue-900">{editando ? 'Editar categoría' : 'Nueva categoría'}</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="text-xs font-medium text-gray-600 block mb-1">Nombre</label>
                  <input
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2"
                    style={{ '--tw-ring-color': '#003DA5' } as any}
                    value={form.nombre}
                    onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))}
                    placeholder="Ej: Sub-15, Juvenil, Mayores..."
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 block mb-1">Edad mínima</label>
                  <input type="number" min={0} max={99}
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none"
                    value={form.edad_min}
                    onChange={e => setForm(f => ({ ...f, edad_min: Number(e.target.value) }))}
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 block mb-1">Edad máxima</label>
                  <input type="number" min={0} max={99}
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none"
                    value={form.edad_max}
                    onChange={e => setForm(f => ({ ...f, edad_max: Number(e.target.value) }))}
                  />
                </div>
                <div className="col-span-2">
                  <label className="text-xs font-medium text-gray-600 block mb-1">Descripción</label>
                  <textarea rows={2}
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none resize-none"
                    value={form.descripcion}
                    onChange={e => setForm(f => ({ ...f, descripcion: e.target.value }))}
                    placeholder="Descripción opcional..."
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="activo"
                    checked={form.activo}
                    onChange={e => setForm(f => ({ ...f, activo: e.target.checked }))}
                  />
                  <label htmlFor="activo" className="text-sm text-gray-700">Activa</label>
                </div>
              </div>
              <div className="flex gap-2 justify-end pt-1">
                <button onClick={cancelar} className="px-4 py-2 text-sm border rounded-lg hover:bg-gray-50">Cancelar</button>
                <button onClick={guardar}
                  className="px-4 py-2 text-sm text-white rounded-lg font-medium"
                  style={{ backgroundColor: '#003DA5' }}>
                  {editando ? 'Guardar cambios' : 'Crear categoría'}
                </button>
              </div>
            </div>
          )}

          {/* Lista */}
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin h-8 w-8 rounded-full border-4 border-blue-600 border-t-transparent" />
            </div>
          ) : (
            <div className="space-y-2">
              {categorias.length === 0 && !modoCrear && (
                <p className="text-center text-gray-400 py-8">No hay categorías. Crea la primera.</p>
              )}
              {categorias.map(cat => (
                <div key={cat.id_categoria}
                  className="flex items-center justify-between p-3 border rounded-xl hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.activo ? '#22c55e' : '#d1d5db' }} />
                    <div>
                      <p className="font-semibold text-gray-800 text-sm">{cat.nombre}</p>
                      <p className="text-xs text-gray-500">{cat.edad_min}–{cat.edad_max} años{cat.descripcion ? ` · ${cat.descripcion}` : ''}</p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => iniciarEdicion(cat)}
                      className="p-2 rounded-lg hover:bg-blue-50 text-blue-600 transition-colors">
                      <Pencil size={15} />
                    </button>
                    <button onClick={() => eliminar(cat.id_categoria)}
                      className="p-2 rounded-lg hover:bg-red-50 text-red-500 transition-colors">
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t flex justify-between items-center">
          <span className="text-xs text-gray-400">{categorias.length} categoría{categorias.length !== 1 ? 's' : ''}</span>
          <button
            onClick={() => { setModoCrear(true); setEditando(null); setForm(EMPTY); }}
            className="flex items-center gap-2 px-4 py-2 text-sm text-white rounded-lg font-medium"
            style={{ backgroundColor: '#FFD100', color: '#003DA5' }}>
            <Plus size={16} />
            Nueva categoría
          </button>
        </div>
      </div>
    </div>
  );
}
