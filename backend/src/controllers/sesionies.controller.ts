import { Request, Response } from 'express';
import { sesionesService } from '../services/sesiones.service';

export const sesionesController = {

  async getSesiones(req: Request, res: Response) {
    try {
      const { equipo_id, disciplina_id, fecha } = req.query as any;
      const data = await sesionesService.getSesiones({
        equipo_id: equipo_id ? Number(equipo_id) : undefined,
        disciplina_id: disciplina_id ? Number(disciplina_id) : undefined,
        fecha,
      });
      res.json({ ok: true, data });
    } catch (e: any) {
      res.status(500).json({ ok: false, error: e.message });
    }
  },

  async getSesionById(req: Request, res: Response) {
    try {
      const data = await sesionesService.getSesionById(Number(req.params.id));
      if (!data) return res.status(404).json({ ok: false, error: 'Sesión no encontrada' });
      res.json({ ok: true, data });
    } catch (e: any) {
      res.status(500).json({ ok: false, error: e.message });
    }
  },

  async crearSesion(req: Request, res: Response) {
    try {
      const data = await sesionesService.crearSesion(req.body);
      res.status(201).json({ ok: true, data });
    } catch (e: any) {
      res.status(400).json({ ok: false, error: e.message });
    }
  },

  async eliminarSesion(req: Request, res: Response) {
    try {
      const data = await sesionesService.eliminarSesion(Number(req.params.id));
      if (!data) return res.status(404).json({ ok: false, error: 'Sesión no encontrada' });
      res.json({ ok: true, data });
    } catch (e: any) {
      res.status(500).json({ ok: false, error: e.message });
    }
  },

  async getEquiposConDisciplinas(req: Request, res: Response) {
    try {
      const data = await sesionesService.getEquiposConDisciplinas();
      res.json({ ok: true, data });
    } catch (e: any) {
      res.status(500).json({ ok: false, error: e.message });
    }
  },
};