import { Request, Response } from 'express';
import { partidosService } from '../services/partidos.service';

export class PartidosController {
  async getPartidos(req: Request, res: Response) {
    try {
      const torneoId = req.query.torneoId ? Number(req.query.torneoId) : undefined;
      const partidos = await partidosService.getPartidos(torneoId);
      res.json(partidos);
    } catch (error) {
      res.status(500).json({ error: 'Error al obtener partidos' });
    }
  }

  async registrarResultado(req: Request, res: Response) {
    try {
      const { golesLocal, golesVisitante, estado, estadisticas } = req.body;
      const partido = await partidosService.registrarResultado(Number(req.params.id), {
        golesLocal,
        golesVisitante,
        estado,
        estadisticas
      });
      res.json(partido);
    } catch (error) {
      res.status(500).json({ error: 'Error al registrar resultado' });
    }
  }
}

export const partidosController = new PartidosController();
