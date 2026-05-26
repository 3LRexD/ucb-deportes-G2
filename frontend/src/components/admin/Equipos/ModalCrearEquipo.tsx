import { useState, useEffect } from 'react';
import { api } from '@/services/api';
import { X } from 'lucide-react';
import type { Equipo } from '@/types';

export function ModalCrearEquipo({ onClose, onCrear }: {
  onClose: () => void;
  onCrear: (equipo: Partial<Equipo>) => void;
}) {
  const [form, setForm] = useState({ nombre: '', carreraId: 0, delegado_nombre: '' });
  const [torneosDB, setTorneosDB] = useState<{id: number, nombre: string}[]>([]);
  const [torneoId, setTorneoId] = useState<number | ''>('');
  const [carrerasDB, setCarrerasDB] = useState<{id: number, nombre: string, facultad: string}[]>([]);

  useEffect(() => {
    api.get('/torneos').then(setTorneosDB).catch(console.error);
    api.get('/carreras').then(setCarrerasDB).catch(console.error);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.carreraId || !torneoId) return;
    onCrear({
      nombre:          form.nombre || `Equipo ${carrerasDB.find(c => c.id === form.carreraId)?.nombre}`,
      carrera_id:      form.carreraId, // Map to frontend type
      carrera:         carrerasDB.find(c => c.id === form.carreraId)?.nombre ?? '',
      delegado_nombre: form.delegado_nombre,
      jugadores:       [],
      torneo_id:       Number(torneoId),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="font-bold text-gray-800 text-lg">Registrar Equipo — Intercarreras 2026</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Carrera *</label>
            <select
              required
              value={form.carreraId}
              onChange={e => setForm({ ...form, carreraId: Number(e.target.value) })}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Seleccionar carrera...</option>
              {carrerasDB.map(c => (
                <option key={c.id} value={c.id}>{c.nombre}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Torneo *</label>
            <select
              required
              value={torneoId}
              onChange={e => setTorneoId(Number(e.target.value))}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Seleccionar torneo...</option>
              {torneosDB.map(t => <option key={t.id} value={t.id}>{t.nombre}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del equipo</label>
            <input
              type="text"
              value={form.nombre}
              onChange={e => setForm({ ...form, nombre: e.target.value })}
              placeholder="Se auto-completa con la carrera"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Delegado responsable</label>
            <input
              type="text"
              value={form.delegado_nombre}
              onChange={e => setForm({ ...form, delegado_nombre: e.target.value })}
              placeholder="Nombre del delegado"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50">
              Cancelar
            </button>
            <button type="submit" className="flex-1 py-2 bg-[#1a3a6b] text-white rounded-lg text-sm font-medium hover:bg-blue-800 transition-colors">
              Crear Equipo
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
