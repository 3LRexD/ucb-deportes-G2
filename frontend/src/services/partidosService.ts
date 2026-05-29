import type { Partido, JugadorPartido, RegistrarResultadoDto } from '../types/torneos.types';

const BASE = 'http://localhost:3002/api';

async function http<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${url}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  const json = await res.json();
  if (!json.ok) throw new Error(json.error ?? 'Error en la solicitud');
  return json.data as T;
}

export const partidosService = {
  getByTorneo: (torneoId: number) =>
    http<Partido[]>(`/partidos/torneo/${torneoId}`),

  getById: (id: number) =>
    http<Partido>(`/partidos/${id}`),

  getPendientes: (anotadorId?: number) => {
    const qs = anotadorId ? `?anotador_id=${anotadorId}` : '';
    return http<Partido[]>(`/partidos/pendientes${qs}`);
  },

  getJugadores: (partidoId: number) =>
    http<JugadorPartido[]>(`/partidos/${partidoId}/jugadores`),

  registrarResultado: (id: number, dto: RegistrarResultadoDto) =>
    http<Partido>(`/partidos/${id}/resultado`, {
      method: 'POST',
      body: JSON.stringify(dto),
    }),
};