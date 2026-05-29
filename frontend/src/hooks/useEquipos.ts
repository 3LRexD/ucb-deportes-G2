import { useState, useEffect, useCallback } from "react";
import type { Equipo, Torneo, CrearEquipoPayload } from "../types/equipos.types";
import * as service from "../services/equiposService";

interface UseEquiposReturn {
  equipos: Equipo[];
  torneos: Torneo[];
  torneoSeleccionado: Torneo | null;
  equipoActivo: Equipo | null;
  loading: boolean;
  error: string | null;
  setTorneoSeleccionado: (torneo: Torneo) => void;
  setEquipoActivo: (equipo: Equipo | null) => void;
  crearEquipo: (payload: CrearEquipoPayload) => Promise<void>;
  eliminarEquipo: (equipoId: number) => Promise<void>;
  refrescarEquipos: () => Promise<void>;
}

export function useEquipos(): UseEquiposReturn {
  const [torneos, setTorneos] = useState<Torneo[]>([]);
  const [torneoSeleccionado, setTorneoSeleccionado] = useState<Torneo | null>(null);
  const [equipos, setEquipos] = useState<Equipo[]>([]);
  const [equipoActivo, setEquipoActivo] = useState<Equipo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Carga torneos al montar
  useEffect(() => {
    service.getTorneos().then((data) => {
      setTorneos(data);
      if (data.length > 0) setTorneoSeleccionado(data[0]);
    });
  }, []);

  // Carga equipos cuando cambia el torneo
  const refrescarEquipos = useCallback(async () => {
    if (!torneoSeleccionado) return;
    setLoading(true);
    setError(null);
    try {
      const data = await service.getEquiposByTorneo(torneoSeleccionado.id_torneo);
      setEquipos(data);
      // Mantener equipo activo sincronizado
      if (equipoActivo) {
        const actualizado = data.find((e) => e.id_equipo === equipoActivo.id_equipo);
        setEquipoActivo(actualizado ?? null);
      }
    } catch {
      setError("No se pudieron cargar los equipos");
    } finally {
      setLoading(false);
    }
  }, [torneoSeleccionado, equipoActivo]);

  useEffect(() => {
    refrescarEquipos();
    setEquipoActivo(null);
  }, [torneoSeleccionado]);

  const crearEquipo = useCallback(
    async (payload: CrearEquipoPayload) => {
      setLoading(true);
      setError(null);
      try {
        const nuevo = await service.crearEquipo(payload);
        setEquipos((prev) => [...prev, nuevo]);
      } catch {
        setError("No se pudo crear el equipo");
        throw new Error("No se pudo crear el equipo");
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const eliminarEquipo = useCallback(async (equipoId: number) => {
    try {
      await service.eliminarEquipo(equipoId);
      setEquipos((prev) => prev.filter((e) => e.id_equipo !== equipoId));
      setEquipoActivo((prev) => (prev?.id_equipo === equipoId ? null : prev));
    } catch {
      setError("No se pudo eliminar el equipo");
    }
  }, []);

  return {
    equipos,
    torneos,
    torneoSeleccionado,
    equipoActivo,
    loading,
    error,
    setTorneoSeleccionado,
    setEquipoActivo,
    crearEquipo,
    eliminarEquipo,
    refrescarEquipos,
  };
}
