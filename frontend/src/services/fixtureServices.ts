import type { GenerarFixturePayload, Partido } from "@/types/fixture.typeps";


const BASE = 'http://localhost:3002/api/fixtures';
const TORNEOS_BASE = 'http://localhost:3002/api/fixtures/torneos';

async function req<T>(url: string, opts?: RequestInit): Promise<T> {
  const res = await fetch(url, { headers: { 'Content-Type': 'application/json' }, ...opts });
  const json = await res.json();
  if (!json.ok) throw new Error(json.error || 'Error desconocido');
  return json.data as T;
}

export const fixtureService = {
  getEquiposByTorneo: (torneoId: number) =>
    req<{ id_equipo: number; nombre: string }[]>(`${TORNEOS_BASE}/${torneoId}/equipos`),

  getFixturesByTorneo: (torneoId: number) =>
    req<any[]>(`${TORNEOS_BASE}/${torneoId}/fixtures`),

  getFasesBloqueadas: (torneoId: number) =>
    req<{ semifinal: boolean; final: boolean }>(`${TORNEOS_BASE}/${torneoId}/fases-bloqueadas`),

  getPartidos: (torneoId: number, filtros?: { grupo?: string; jornada?: number; fase?: string }) => {
    const params = new URLSearchParams({ torneo_id: String(torneoId) });
    if (filtros?.grupo) params.set('grupo', filtros.grupo);
    if (filtros?.jornada) params.set('jornada', String(filtros.jornada));
    if (filtros?.fase) params.set('fase', filtros.fase);
    return req<Partido[]>(`${BASE}/partidos-fixture?${params}`);
  },

  generarFixture: (payload: GenerarFixturePayload) =>
    req<any>(`${BASE}/generar`, { method: 'POST', body: JSON.stringify(payload) }),

  crearPartidoManual: (datos: Partial<Partido> & { torneo_id: number }) =>
    req<Partido>(`${BASE}/partido-manual`, { method: 'POST', body: JSON.stringify(datos) }),

  actualizarPartido: (id: number, datos: Partial<Partido>) =>
    req<Partido>(`${BASE}/partidos/${id}`, { method: 'PUT', body: JSON.stringify(datos) }),

  eliminarFixture: (id: number) =>
    req<any>(`${BASE}/${id}`, { method: 'DELETE' }),
};