import { Request, Response } from 'express';
import { carrerasService } from '../services/carreras.service';

export class CarrerasController {
  async getCarreras(req: Request, res: Response) {
    try {
      const carreras = await carrerasService.getActiveCarreras();
      res.json(carreras);
    } catch (error) {
      res.status(500).json({ error: 'Error al obtener carreras' });
    }
  }
}

export const carrerasController = new CarrerasController();
