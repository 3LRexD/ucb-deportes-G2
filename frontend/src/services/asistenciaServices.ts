import type { EquipoConDisciplina, JugadorEquipo, RegistroAsistencia, Sesion } from "@/types/asistencia.types";


const BASE = 'http://localhost:3002/api';

async function req<T>(url: string, opts?: RequestInit): Promise<T> {
  const res = await fetch(url, { headers: { 'Content-Type': 'application/json' }, ...opts });
  const json = await res.json();
  if (!json.ok) throw new Error(json.error || 'Error desconocido');
  return json.data as T;
}

export const asistenciaService = {
  getEquiposConDisciplinas: () =>
    req<EquipoConDisciplina[]>(`${BASE}/sesiones/equipos-disciplinas`),

  getSesiones: (filtros: { equipo_id?: number; disciplina_id?: number }) => {
    const params = new URLSearchParams();
    if (filtros.equipo_id) params.set('equipo_id', String(filtros.equipo_id));
    if (filtros.disciplina_id) params.set('disciplina_id', String(filtros.disciplina_id));
    return req<Sesion[]>(`${BASE}/sesiones?${params}`);
  },

  crearSesion: (datos: Omit<Sesion, 'id_sesion' | 'equipo_nombre' | 'disciplina_nombre'>) =>
    req<Sesion>(`${BASE}/sesiones`, { method: 'POST', body: JSON.stringify(datos) }),

  eliminarSesion: (id: number) =>
    req<Sesion>(`${BASE}/sesiones/${id}`, { method: 'DELETE' }),

  getJugadoresByEquipo: (equipoId: number) =>
    req<JugadorEquipo[]>(`${BASE}/asistencia/equipo/${equipoId}/jugadores`),

  getAsistenciaBySesion: (sesionId: number) =>
    req<any[]>(`${BASE}/asistencia/sesion/${sesionId}`),

  guardarAsistencia: (sesion_id: number, registros: RegistroAsistencia[]) =>
    req<any[]>(`${BASE}/asistencia/guardar`, {
      method: 'POST',
      body: JSON.stringify({ sesion_id, registros }),
    }),

  getResumenAsistencia: (equipoId: number) =>
    req<any[]>(`${BASE}/asistencia/equipo/${equipoId}/resumen`),
};