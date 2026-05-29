import { useState, useEffect, useCallback } from 'react';
import { torneosService, disciplinasService, categoriasService } from '../services/torneosService';
import type { Torneo, CreateTorneoDto, TorneoEstado, Disciplina, Categoria, TablaPosicion } from '../types/torneos.types';

// ─── useTorneos ───────────────────────────────────────────────────────────────
export function useTorneos(filtros?: { estado?: string; disciplina_id?: number; tipo?: string }) {
  const [torneos, setTorneos]   = useState<Torneo[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState<string | null>(null);

  const fetchTorneos = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await torneosService.getAll(filtros);
      setTorneos(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(filtros)]);

  useEffect(() => { fetchTorneos(); }, [fetchTorneos]);

  const crearTorneo = async (dto: CreateTorneoDto) => {
    const nuevo = await torneosService.create(dto);
    setTorneos(prev => [nuevo, ...prev]);
    return nuevo;
  };

  const actualizarTorneo = async (id: number, dto: Partial<CreateTorneoDto>) => {
    const updated = await torneosService.update(id, dto);
    setTorneos(prev => prev.map(t => t.id_torneo === id ? updated : t));
    return updated;
  };

  const eliminarTorneo = async (id: number) => {
    await torneosService.delete(id);
    setTorneos(prev => prev.filter(t => t.id_torneo !== id));
  };

  const cambiarEstado = async (id: number, estado: TorneoEstado) => {
    const updated = await torneosService.cambiarEstado(id, estado);
    setTorneos(prev => prev.map(t => t.id_torneo === id ? updated : t));
    return updated;
  };

  return { torneos, loading, error, refetch: fetchTorneos, crearTorneo, actualizarTorneo, eliminarTorneo, cambiarEstado };
}

// ─── useTorneoDetalle ────────────────────────────────────────────────────────
export function useTorneoDetalle(id: number | null) {
  const [torneo, setTorneo]   = useState<Torneo | null>(null);
  const [loading, setLoading] = useState(false);
  const [tabla, setTabla]     = useState<TablaPosicion[]>([]);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    Promise.all([
      torneosService.getById(id),
      torneosService.getTablaPosiciones(id),
    ]).then(([t, tab]) => {
      setTorneo(t);
      setTabla(tab);
    }).catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  return { torneo, loading, tabla };
}

// ─── useDisciplinas / useCategorias ──────────────────────────────────────────
export function useDisciplinas() {
  const [disciplinas, setDisciplinas] = useState<Disciplina[]>([]);
  useEffect(() => { disciplinasService.getAll().then(setDisciplinas).catch(console.error); }, []);
  return disciplinas;
}

export function useCategorias() {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  useEffect(() => { categoriasService.getAll().then(setCategorias).catch(console.error); }, []);
  return categorias;
}