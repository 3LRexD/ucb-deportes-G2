import { Request, Response } from 'express';
import { equiposService } from '../services/equipos.service';

export class EquiposController {
  async getEquipos(req: Request, res: Response) {
    try {
      const torneoId = req.query.torneoId ? Number(req.query.torneoId) : undefined;
      const equipos = await equiposService.getEquipos(torneoId);
      res.json(equipos);
    } catch (error) {
      res.status(500).json({ error: 'Error al obtener equipos' });
    }
  }

  async createEquipo(req: Request, res: Response) {
    try {
      const { nombre, carrera, torneoId, delegadoId, entrenadorId } = req.body;
      const equipo = await equiposService.createEquipo({
        nombre,
        carrera,
        torneoId: Number(torneoId),
        delegadoId,
        entrenadorId
      });
      res.status(201).json(equipo);
    } catch (error) {
      console.error('ERROR crear equipo:', error);
      res.status(500).json({ error: 'Error al crear equipo' });
    }
  }

  async addJugador(req: Request, res: Response) {
    try {
      const { deportistaId, deportistaCi, deportistaNombre, numeroCamiseta, posicion } = req.body;
      const jugador = await equiposService.addJugador({
        equipoId: Number(req.params.id),
        deportistaId: Number(deportistaId),
        deportistaCi,
        deportistaNombre,
        numeroCamiseta,
        posicion
      });
      res.status(201).json(jugador);
    } catch (error) {
      res.status(500).json({ error: 'Error al agregar jugador' });
    }
  }

  async removeJugador(req: Request, res: Response) {
    try {
      await equiposService.removeJugador(Number(req.params.id), req.params.ci);
      res.json({ message: 'Jugador removido del equipo' });
    } catch (error) {
      res.status(500).json({ error: 'Error al remover jugador' });
    }
  }
}

export const equiposController = new EquiposController();
