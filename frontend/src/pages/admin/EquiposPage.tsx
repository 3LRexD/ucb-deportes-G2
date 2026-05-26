import { useState, useEffect } from 'react';
import { Plus, Search, Users } from 'lucide-react';
import { equiposService } from '@/services/equipos.service';
import type { Equipo } from '@/types';
import { EquipoCard } from '@/components/admin/Equipos/EquipoCard';
import { ModalCrearEquipo } from '@/components/admin/Equipos/ModalCrearEquipo';
import { ModalAgregarJugador } from '@/components/admin/Equipos/ModalAgregarJugador';

export default function EquiposPage() {
  const [equipos, setEquipos] = useState<Equipo[]>([]);
  const [busqueda, setBusqueda] = useState('');
  const [modalCrear, setModalCrear] = useState(false);
  const [equipoParaAgregar, setEquipoParaAgregar] = useState<Equipo | null>(null);

  useEffect(() => {
    cargarEquipos();
  }, []);

  const cargarEquipos = () => {
    equiposService.getAll()
      .then(setEquipos)
      .catch(console.error);
  };

  const equiposFiltrados = equipos.filter(e =>
    e.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    e.carrera.toLowerCase().includes(busqueda.toLowerCase())
  );

  const crearEquipo = async (datos: Partial<Equipo>) => {
    await equiposService.create(datos);
    cargarEquipos();
  };

  const agregarJugador = async (equipoId: number, ci: string) => {
    // Importamos dinámicamente para simular la búsqueda
    const mockModule = await import('@/data/mockData');
    const jugadorEncontrado = mockModule.mockJugadores.find(j => j.ci === ci);
    
    if (!jugadorEncontrado) return;

    await equiposService.agregarJugador(equipoId, jugadorEncontrado);
    cargarEquipos();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Equipos — Intercarreras 2026</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {equipos.length} equipos registrados · {equipos.reduce((acc, e) => acc + e.jugadores.length, 0)} jugadores inscritos
          </p>
        </div>
        <button
          onClick={() => setModalCrear(true)}
          className="flex items-center gap-2 bg-[#1a3a6b] text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-blue-800 transition-colors shadow-sm"
        >
          <Plus size={16} /> Registrar Equipo
        </button>
      </div>

      {/* Buscador */}
      <div className="relative max-w-sm">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Buscar por equipo o carrera..."
          value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
          className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
        />
      </div>

      {/* Lista de equipos */}
      <div className="space-y-3">
        {equiposFiltrados.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <Users size={32} className="mx-auto mb-2 opacity-30" />
            <p className="text-sm">No hay equipos registrados aún.</p>
          </div>
        ) : (
          equiposFiltrados.map(equipo => (
            <EquipoCard
              key={equipo.id}
              equipo={equipo}
              onAgregarJugador={e => setEquipoParaAgregar(e)}
            />
          ))
        )}
      </div>

      {/* Modales */}
      {modalCrear && (
        <ModalCrearEquipo onClose={() => setModalCrear(false)} onCrear={crearEquipo} />
      )}
      {equipoParaAgregar && (
        <ModalAgregarJugador
          equipo={equipoParaAgregar}
          onClose={() => setEquipoParaAgregar(null)}
          onAgregar={(ci) => { agregarJugador(equipoParaAgregar.id, ci); setEquipoParaAgregar(null); }}
        />
      )}
    </div>
  );
}