import { Request, Response } from 'express';
import { partidosService } from '../services/partidos.service';

export const partidosController = {

  async getByTorneo(req: Request, res: Response) {
    try {
      const partidos = await partidosService.getByTorneo(Number(req.params.torneoId));
      res.json({ ok: true, data: partidos });
    } catch (err: any) {
      res.status(500).json({ ok: false, error: err.message });
    }
  },

  async getById(req: Request, res: Response) {
    try {
      const partido = await partidosService.getById(Number(req.params.id));
      if (!partido) return res.status(404).json({ ok: false, error: 'Partido no encontrado' });
      res.json({ ok: true, data: partido });
    } catch (err: any) {
      res.status(500).json({ ok: false, error: err.message });
    }
  },

  async getPendientes(req: Request, res: Response) {
    try {
      const { anotador_id } = req.query;
      const partidos = await partidosService.getPendientesParaAnotador(
        anotador_id ? Number(anotador_id) : undefined
      );
      res.json({ ok: true, data: partidos });
    } catch (err: any) {
      res.status(500).json({ ok: false, error: err.message });
    }
  },

  async registrarResultado(req: Request, res: Response) {
    try {
      const { goles_local, goles_visitante, anotador_id, eventos = [] } = req.body;

      if (goles_local === undefined || goles_visitante === undefined) {
        return res.status(400).json({ ok: false, error: 'Se requieren goles_local y goles_visitante' });
      }

      const partido = await partidosService.registrarResultado(
        Number(req.params.id),
        { goles_local, goles_visitante, anotador_id },
        eventos
      );
      res.json({ ok: true, data: partido });
    } catch (err: any) {
      res.status(400).json({ ok: false, error: err.message });
    }
  },

  async getJugadoresDePartido(req: Request, res: Response) {
    try {
      const jugadores = await partidosService.getJugadoresDePartido(Number(req.params.id));
      if (!jugadores) return res.status(404).json({ ok: false, error: 'Partido no encontrado' });
      res.json({ ok: true, data: jugadores });
    } catch (err: any) {
      res.status(500).json({ ok: false, error: err.message });
    }
  },
};  