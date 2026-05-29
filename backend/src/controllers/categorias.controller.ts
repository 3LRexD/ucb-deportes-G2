import { Request, Response } from 'express';

import { categoriasService } from '../services/categorias.service';

export const categoriasController = {
  async getAll(req: Request, res: Response) {
    try {
      const soloActivas = req.query.activas === 'true';
      const data = await categoriasService.getAll(soloActivas);
      res.json({ ok: true, data });
    } catch (err: any) { res.status(500).json({ ok: false, error: err.message }); }
  },
 
  async getById(req: Request, res: Response) {
    try {
      const data = await categoriasService.getById(Number(req.params.id));
      if (!data) return res.status(404).json({ ok: false, error: 'No encontrado' });
      res.json({ ok: true, data });
    } catch (err: any) { res.status(500).json({ ok: false, error: err.message }); }
  },
 
  async create(req: Request, res: Response) {
    try {
      const data = await categoriasService.create(req.body);
      res.status(201).json({ ok: true, data });
    } catch (err: any) { res.status(400).json({ ok: false, error: err.message }); }
  },
 
  async update(req: Request, res: Response) {
    try {
      const data = await categoriasService.update(Number(req.params.id), req.body);
      if (!data) return res.status(404).json({ ok: false, error: 'No encontrado' });
      res.json({ ok: true, data });
    } catch (err: any) { res.status(400).json({ ok: false, error: err.message }); }
  },
};
 