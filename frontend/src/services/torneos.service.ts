import { api } from './api';
import type { Torneo } from '../types';

export const torneosService = {
  getAll: async (): Promise<Torneo[]> => {
    const data = await api.get('/torneos');
    return data.map(mapearTorneo);
  },

  create: async (body: any): Promise<Torneo> => {
    const nuevo = await api.post('/torneos', body);
    return mapearTorneo(nuevo);
  },

  update: async (id: number, body: any): Promise<Torneo> => {
    const actualizado = await api.put(`/torneos/${id}`, body);
    return mapearTorneo(actualizado);
  }
};

const mapearTorneo = (t: any): Torneo => ({
  id: t.id,
  nombre: t.nombre,
  disciplina_id: t.disciplinaId,
  disciplina_nombre: t.disciplina?.nombre ?? '',
  categoria_id: t.categoriaId,
  tipo: t.tipo,
  formato: t.formato,
  categoria: t.categoria?.nombre ?? '',
  temporada: t.temporada,
  fecha_inicio: t.fechaInicio?.split('T')[0],
  fecha_fin: t.fechaFin?.split('T')[0],
  estado: t.estado,
  reglas: t.reglas,
});
