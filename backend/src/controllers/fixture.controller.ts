import { Request, Response } from 'express';
import { fixturesService } from '../services/fixtures.service';

export const fixturesController = {

  async getEquiposByTorneo(req: Request, res: Response) {
    try {
      const data = await fixturesService.getEquiposByTorneo(Number(req.params.torneoId));
      res.json({ ok: true, data });
    } catch (e: any) {
      res.status(500).json({ ok: false, error: e.message });
    }
  },

  async getFixturesByTorneo(req: Request, res: Response) {
    try {
      const data = await fixturesService.getFixturesByTorneo(Number(req.params.torneoId));
      res.json({ ok: true, data });
    } catch (e: any) {
      res.status(500).json({ ok: false, error: e.message });
    }
  },

  async getPartidosByTorneo(req: Request, res: Response) {
    try {
      const { torneo_id, grupo, jornada, fase } = req.query as any;
      const data = await fixturesService.getPartidosByTorneo(Number(torneo_id), {
        grupo, jornada: jornada ? Number(jornada) : undefined, fase
      });
      res.json({ ok: true, data });
    } catch (e: any) {
      res.status(500).json({ ok: false, error: e.message });
    }
  },

  async generarFixture(req: Request, res: Response) {
    try {
      const data = await fixturesService.generarFixture(req.body);
      res.status(201).json({ ok: true, data });
    } catch (e: any) {
      res.status(400).json({ ok: false, error: e.message });
    }
  },

  async crearPartidoManual(req: Request, res: Response) {
    try {
      const data = await fixturesService.crearPartidoManual(req.body);
      res.status(201).json({ ok: true, data });
    } catch (e: any) {
      res.status(400).json({ ok: false, error: e.message });
    }
  },

  async actualizarPartido(req: Request, res: Response) {
    try {
      const data = await fixturesService.actualizarPartido(Number(req.params.id), req.body);
      res.json({ ok: true, data });
    } catch (e: any) {
      res.status(400).json({ ok: false, error: e.message });
    }
  },

  async eliminarFixture(req: Request, res: Response) {
    try {
      const data = await fixturesService.eliminarFixture(Number(req.params.id));
      if (!data) return res.status(404).json({ ok: false, error: 'Fixture no encontrado' });
      res.json({ ok: true, data });
    } catch (e: any) {
      res.status(500).json({ ok: false, error: e.message });
    }
  },

  async getFasesBloqueadas(req: Request, res: Response) {
    try {
      const data = await fixturesService.getFasesBloqueadas(Number(req.params.torneoId));
      res.json({ ok: true, data });
    } catch (e: any) {
      res.status(500).json({ ok: false, error: e.message });
    }
  },
};