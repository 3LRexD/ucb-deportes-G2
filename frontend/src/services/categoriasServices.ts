import type { Categoria } from "@/types/torneos.types";

const BASE = 'http://localhost:3002/api/categorias';

async function req<T>(url: string, opts?: RequestInit): Promise<T> {
  const res = await fetch(url, { headers: { 'Content-Type': 'application/json' }, ...opts });
  const json = await res.json();
  if (!json.ok) throw new Error(json.error || 'Error desconocido');
  return json.data as T;
}

export const categoriasService = {
  getAll: () => req<Categoria[]>(BASE),
  create: (datos: Omit<Categoria, 'id_categoria' | 'created_at' | 'updated_at'>) =>
    req<Categoria>(BASE, { method: 'POST', body: JSON.stringify(datos) }),
  update: (id: number, datos: Partial<Omit<Categoria, 'id_categoria' | 'created_at' | 'updated_at'>>) =>
    req<Categoria>(`${BASE}/${id}`, { method: 'PUT', body: JSON.stringify(datos) }),
  delete: (id: number) =>
    req<Categoria>(`${BASE}/${id}`, { method: 'DELETE' }),
};