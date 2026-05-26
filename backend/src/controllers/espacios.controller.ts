import { Request, Response } from 'express';
import { espaciosService } from '../services/espacios.service';

export class EspaciosController {
  async getEspacios(_req: Request, res: Response) {
    try {
      const espacios = await espaciosService.getActiveEspacios();
      res.json(espacios);
    } catch (error) {
      res.status(500).json({ error: 'Error al obtener espacios' });
    }
  }
}

export const espaciosController = new EspaciosController();
