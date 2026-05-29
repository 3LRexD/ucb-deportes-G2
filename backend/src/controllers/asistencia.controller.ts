import { Request, Response } from 'express';
import { asistenciaService } from '../services/asistencia.service';

export const asistenciaController = {

  async getAsistenciaBySesion(req: Request, res: Response) {
    try {
      const data = await asistenciaService.getAsistenciaBySesion(Number(req.params.sesionId));
      res.json({ ok: true, data });
    } catch (e: any) {
      res.status(500).json({ ok: false, error: e.message });
    }
  },

  async getJugadoresByEquipo(req: Request, res: Response) {
    try {
      const data = await asistenciaService.getJugadoresByEquipo(Number(req.params.equipoId));
      res.json({ ok: true, data });
    } catch (e: any) {
      res.status(500).json({ ok: false, error: e.message });
    }
  },

  async guardarAsistencia(req: Request, res: Response) {
    try {
      const { sesion_id, registros } = req.body;
      if (!sesion_id || !Array.isArray(registros)) {
        return res.status(400).json({ ok: false, error: 'sesion_id y registros son requeridos' });
      }
      const data = await asistenciaService.guardarAsistenciaBulk(Number(sesion_id), registros);
      res.status(201).json({ ok: true, data });
    } catch (e: any) {
      res.status(400).json({ ok: false, error: e.message });
    }
  },

  async getResumenAsistencia(req: Request, res: Response) {
    try {
      const data = await asistenciaService.getResumenAsistencia(Number(req.params.equipoId));
      res.json({ ok: true, data });
    } catch (e: any) {
      res.status(500).json({ ok: false, error: e.message });
    }
  },
};