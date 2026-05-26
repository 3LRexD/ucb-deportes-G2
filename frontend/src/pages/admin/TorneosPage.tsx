import { useEffect, useState } from 'react';
import { Plus, Trophy } from 'lucide-react';
import { torneosService } from '@/services/torneos.service';
import type { Torneo } from '@/types';
import { ModalTorneo, type FormTorneo } from '@/components/admin/Torneos/ModalTorneo';
import { TorneoCard } from '@/components/admin/Torneos/TorneoCard';

export default function TorneosPage() {
  const [torneos, setTorneos] = useState<Torneo[]>([]);
  const [cargando, setCargando] = useState(true);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [torneoEditando, setTorneoEditando] = useState<Torneo | undefined>();
  const [filtroEstado, setFiltroEstado] = useState<string>('todos');

  useEffect(() => {
    cargarTorneos();
  }, []);

  const cargarTorneos = () => {
    torneosService.getAll()
      .then(setTorneos)
      .catch(console.error)
      .finally(() => setCargando(false));
  };

  const torneosFiltrados = filtroEstado === 'todos'
    ? torneos
    : torneos.filter(t => t.estado === filtroEstado);

  const guardarTorneo = async (form: FormTorneo) => {
    const body = {
      nombre:       form.nombre,
      disciplinaId: Number(form.disciplina_id),
      categoriaId:  Number(form.categoria_id),
      tipo:         form.tipo,
      formato:      form.formato,
      temporada:    form.temporada,
      fechaInicio:  form.fecha_inicio,
      fechaFin:     form.fecha_fin,
      estado:       form.estado,
      reglas:       form.reglas,
    };

    if (torneoEditando) {
      await torneosService.update(torneoEditando.id, body);
    } else {
      await torneosService.create(body);
    }
    cargarTorneos();
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
        {cargando ? (
           <div className="text-center py-16 text-gray-400">
             <p className="text-sm">Cargando...</p>
           </div>
        ) : torneosFiltrados.length === 0 ? (
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