import { useState, useEffect, useCallback } from 'react';
import { partidosService } from '../services/partidosService';
import type { JugadorPartido, Partido, RegistrarResultadoDto } from '@/types/partidos.types';

export function usePartidos(torneoId?: number) {
  const [partidos, setPartidos] = useState<Partido[]>([]);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState<string | null>(null);

  const fetch = useCallback(async () => {
    if (!torneoId) return;
    try {
      setLoading(true);
      setError(null);
      const data = await partidosService.getByTorneo(torneoId);
      setPartidos(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [torneoId]);

  useEffect(() => { fetch(); }, [fetch]);
  return { partidos, loading, error, refetch: fetch };
}

export function usePartidosPendientes(anotadorId?: number) {
  const [partidos, setPartidos] = useState<Partido[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState<string | null>(null);

  const fetch = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await partidosService.getPendientes(anotadorId);
      setPartidos(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [anotadorId]);

  useEffect(() => { fetch(); }, [fetch]);

  const registrarResultado = async (id: number, dto: RegistrarResultadoDto) => {
    const updated = await partidosService.registrarResultado(id, dto);
    setPartidos(prev => prev.filter(p => p.id_partido !== id)); // sale de pendientes
    return updated;
  };

  return { partidos, loading, error, refetch: fetch, registrarResultado };
}

export function useJugadoresPartido(partidoId: number | null) {
  const [jugadores, setJugadores] = useState<JugadorPartido[]>([]);
  const [loading, setLoading]     = useState(false);

  useEffect(() => {
    if (!partidoId) return;
    setLoading(true);
    partidosService.getJugadores(partidoId)
      .then(setJugadores)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [partidoId]);

  return { jugadores, loading };
}