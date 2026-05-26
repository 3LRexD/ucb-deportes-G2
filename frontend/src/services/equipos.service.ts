import { api } from './api';
import type { Equipo } from '../types';

export const equiposService = {
  getAll: async (): Promise<Equipo[]> => {
    const data = await api.get('/equipos');
    return data.map(mapearEquipo);
  },

  create: async (datos: Partial<Equipo>): Promise<Equipo> => {
    const nuevo = await api.post('/equipos', {
      nombre: datos.nombre,
      carreraId: datos.carrera_id, // Maps to backend carreraId
      torneoId: datos.torneo_id,
      delegadoId: datos.delegado_id,
    });
    return mapearEquipo(nuevo);
  },

  agregarJugador: async (equipoId: number, jugador: any) => {
    return await api.post(`/equipos/${equipoId}/jugadores`, {
      deportistaId: 0,
      deportistaCi: jugador.ci,
      deportistaNombre: jugador.nombre_completo,
    });
  }
};

const mapearEquipo = (e: any): Equipo => ({
  id: e.id,
  nombre: e.nombre,
  carrera: e.carrera?.nombre ?? '',
  carrera_id: e.carreraId, // Map from backend carreraId
  delegado_id: e.delegadoId ?? 0,
  delegado_nombre: e.delegadoNombre ?? '',
  torneo_id: e.torneoId,
  jugadores: e.jugadores?.map((j: any) => ({
    ci: j.deportistaCi,
    nombre_completo: j.deportistaNombre,
    tipo: 'UCB' as const,
    matricula_activa: j.matriculaValidada,
  })) ?? [],
});
