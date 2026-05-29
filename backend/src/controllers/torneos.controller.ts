import { Request, Response } from 'express';
import { torneosService } from '../services/torneos.service';

export const torneosController = {

  async getAll(req: Request, res: Response) {
    try {
      const { estado, disciplina_id, tipo } = req.query;
      const torneos = await torneosService.getAll({
        estado: estado as string,
        disciplina_id: disciplina_id ? Number(disciplina_id) : undefined,
        tipo: tipo as string,
      });
      res.json({ ok: true, data: torneos });
    } catch (err: any) {
      res.status(500).json({ ok: false, error: err.message });
    }
  },

  async getById(req: Request, res: Response) {
    try {
      const torneo = await torneosService.getById(Number(req.params.id));
      if (!torneo) return res.status(404).json({ ok: false, error: 'Torneo no encontrado' });
      res.json({ ok: true, data: torneo });
    } catch (err: any) {
      res.status(500).json({ ok: false, error: err.message });
    }
  },

  async create(req: Request, res: Response) {
    try {
      const torneo = await torneosService.create(req.body);
      res.status(201).json({ ok: true, data: torneo });
    } catch (err: any) {
      res.status(400).json({ ok: false, error: err.message });
    }
  },

  async update(req: Request, res: Response) {
    try {
      const torneo = await torneosService.update(Number(req.params.id), req.body);
      if (!torneo) return res.status(404).json({ ok: false, error: 'Torneo no encontrado' });
      res.json({ ok: true, data: torneo });
    } catch (err: any) {
      res.status(400).json({ ok: false, error: err.message });
    }
  },

  async delete(req: Request, res: Response) {
    try {
      const result = await torneosService.delete(Number(req.params.id));
      if (!result) return res.status(400).json({ ok: false, error: 'Solo se pueden eliminar torneos en estado planificado' });
      res.json({ ok: true, message: 'Torneo eliminado' });
    } catch (err: any) {
      res.status(500).json({ ok: false, error: err.message });
    }
  },

  async cambiarEstado(req: Request, res: Response) {
    try {
      const { estado } = req.body;
      const torneo = await torneosService.cambiarEstado(Number(req.params.id), estado);
      if (!torneo) return res.status(404).json({ ok: false, error: 'Torneo no encontrado' });
      res.json({ ok: true, data: torneo });
    } catch (err: any) {
      res.status(400).json({ ok: false, error: err.message });
    }
  },

  async getTablasPosiciones(req: Request, res: Response) {
    try {
      const tabla = await torneosService.getTablasPosiciones(Number(req.params.id));
      res.json({ ok: true, data: tabla });
    } catch (err: any) {
      res.status(500).json({ ok: false, error: err.message });
    }
  },
};