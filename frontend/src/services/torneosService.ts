import type {
  Torneo, CreateTorneoDto, TorneoEstado,
  TablaPosicion, Disciplina, Categoria
} from '../types/torneos.types';

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

// ─── TORNEOS ──────────────────────────────────────────────────────────────────
export const torneosService = {
  getAll: (params?: { estado?: string; disciplina_id?: number; tipo?: string }) => {
    const qs = new URLSearchParams();
    if (params?.estado)        qs.set('estado', params.estado);
    if (params?.disciplina_id) qs.set('disciplina_id', String(params.disciplina_id));
    if (params?.tipo)          qs.set('tipo', params.tipo);
    return http<Torneo[]>(`/torneos?${qs}`);
  },

  getById:   (id: number)   => http<Torneo>(`/torneos/${id}`),
  create:    (dto: CreateTorneoDto) => http<Torneo>('/torneos', { method: 'POST', body: JSON.stringify(dto) }),
  update:    (id: number, dto: Partial<CreateTorneoDto>) =>
    http<Torneo>(`/torneos/${id}`, { method: 'PUT', body: JSON.stringify(dto) }),
  delete:    (id: number)   => http<void>(`/torneos/${id}`, { method: 'DELETE' }),
  cambiarEstado: (id: number, estado: TorneoEstado) =>
    http<Torneo>(`/torneos/${id}/estado`, { method: 'PATCH', body: JSON.stringify({ estado }) }),
  getTablaPosiciones: (id: number) => http<TablaPosicion[]>(`/torneos/${id}/tabla-posiciones`),
};

// ─── DISCIPLINAS y CATEGORÍAS ─────────────────────────────────────────────────
export const disciplinasService = {
  getAll: (soloActivas = true) =>
    http<Disciplina[]>(`/disciplinas${soloActivas ? '?activas=true' : ''}`),
};

export const categoriasService = {
  getAll: (soloActivas = true) =>
    http<Categoria[]>(`/categorias${soloActivas ? '?activas=true' : ''}`),
};