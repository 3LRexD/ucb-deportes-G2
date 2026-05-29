import { Request, Response } from 'express';
import { disciplinasService } from '../services/disciplinas.service';


export const disciplinasController = {
  async getAll(req: Request, res: Response) {
    try {
      const soloActivas = req.query.activas === 'true';
      const data = await disciplinasService.getAll(soloActivas);
      res.json({ ok: true, data });
    } catch (err: any) { res.status(500).json({ ok: false, error: err.message }); }
  },

  async getById(req: Request, res: Response) {
    try {
      const data = await disciplinasService.getById(Number(req.params.id));
      if (!data) return res.status(404).json({ ok: false, error: 'No encontrado' });
      res.json({ ok: true, data });
    } catch (err: any) { res.status(500).json({ ok: false, error: err.message }); }
  },

  async create(req: Request, res: Response) {
    try {
      const data = await disciplinasService.create(req.body);
      res.status(201).json({ ok: true, data });
    } catch (err: any) { res.status(400).json({ ok: false, error: err.message }); }
  },

  async update(req: Request, res: Response) {
    try {
      const data = await disciplinasService.update(Number(req.params.id), req.body);
      if (!data) return res.status(404).json({ ok: false, error: 'No encontrado' });
      res.json({ ok: true, data });
    } catch (err: any) { res.status(400).json({ ok: false, error: err.message }); }
  },

  async toggleActivo(req: Request, res: Response) {
    try {
      const data = await disciplinasService.toggleActivo(Number(req.params.id));
      if (!data) return res.status(404).json({ ok: false, error: 'No encontrado' });
      res.json({ ok: true, data });
    } catch (err: any) { res.status(400).json({ ok: false, error: err.message }); }
  },
};
