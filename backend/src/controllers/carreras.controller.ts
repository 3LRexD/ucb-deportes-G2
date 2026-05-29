import { Request, Response } from 'express';
import * as carrerasService from '../services/carreras.service';

export async function getCarreras(req: Request, res: Response): Promise<void> {
  try {
    const carreras = await carrerasService.getAllCarreras();
    res.json(carreras);
  } catch (error) {
    console.error('[carreras] Error al obtener carreras:', error);
    res.status(500).json({ error: 'Error interno al obtener carreras' });
  }
}
