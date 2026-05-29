import { useState, useCallback } from "react";
import type { JugadorEquipo, Equipo } from "../types/equipos.types";
import * as service from "../services/equiposService";

interface UseJugadoresReturn {
  agregando: boolean;
  errorJugador: string | null;
  busquedaResult: { ci: string; nombre: string; carrera: string; matricula_activa: boolean } | null;
  buscando: boolean;
  buscarPorCI: (ci: string) => Promise<void>;
  limpiarBusqueda: () => void;
  agregarJugador: (equipoId: number, ci: string) => Promise<JugadorEquipo>;
  quitarJugador: (equipoId: number, jugadorId: number) => Promise<void>;
}

/**
 * Hook para manejar la gestión de jugadores en un equipo.
 * Recibe un callback para notificar al padre que debe refrescar el equipo.
 */
export function useJugadores(onCambio: () => Promise<void>): UseJugadoresReturn {
  const [agregando, setAgregando] = useState(false);
  const [buscando, setBuscando] = useState(false);
  const [errorJugador, setErrorJugador] = useState<string | null>(null);
  const [busquedaResult, setBusquedaResult] = useState<{
    ci: string;
    nombre: string;
    carrera: string;
    matricula_activa: boolean;
  } | null>(null);

  const buscarPorCI = useCallback(async (ci: string) => {
    if (!ci.trim()) return;
    setBuscando(true);
    setErrorJugador(null);
    setBusquedaResult(null);
    try {
      const resultado = await service.buscarDeportistaPorCI(ci.trim());
      if (!resultado) {
        setErrorJugador("No se encontró ningún deportista con ese CI");
      } else {
        setBusquedaResult(resultado);
      }
    } catch {
      setErrorJugador("Error al buscar el deportista");
    } finally {
      setBuscando(false);
    }
  }, []);

  const limpiarBusqueda = useCallback(() => {
    setBusquedaResult(null);
    setErrorJugador(null);
  }, []);

  const agregarJugador = useCallback(
    async (equipoId: number, ci: string): Promise<JugadorEquipo> => {
      setAgregando(true);
      setErrorJugador(null);
      try {
        const jugador = await service.agregarJugador(equipoId, { ci });
        await onCambio();
        setBusquedaResult(null);
        return jugador;
      } catch (e: any) {
        const msg = e?.message ?? "No se pudo agregar el jugador";
        setErrorJugador(msg);
        throw new Error(msg);
      } finally {
        setAgregando(false);
      }
    },
    [onCambio]
  );

  const quitarJugador = useCallback(
    async (equipoId: number, jugadorId: number) => {
      try {
        await service.quitarJugador(equipoId, jugadorId);
        await onCambio();
      } catch {
        setErrorJugador("No se pudo quitar el jugador");
      }
    },
    [onCambio]
  );

  return {
    agregando,
    errorJugador,
    busquedaResult,
    buscando,
    buscarPorCI,
    limpiarBusqueda,
    agregarJugador,
    quitarJugador,
  };
}
