import { Request, Response } from 'express';
import { torneosService } from '../services/torneos.service';

export class TorneosController {
  async getTorneos(_req: Request, res: Response) {
    try {
      const torneos = await torneosService.getTorneos();
      res.json(torneos);
    } catch (error) {
      res.status(500).json({ error: 'Error al obtener torneos' });
    }
  }

  async getTorneoById(req: Request, res: Response) {
    try {
      const torneo = await torneosService.getTorneoById(Number(req.params.id));
      if (!torneo) {
        res.status(404).json({ error: 'Torneo no encontrado' });
        return;
      }
      res.json(torneo);
    } catch (error) {
      res.status(500).json({ error: 'Error al obtener torneo' });
    }
  }

  async createTorneo(req: Request, res: Response) {
    try {
      const { nombre, disciplinaId, categoriaId, tipo, formato, temporada, fechaInicio, fechaFin, estado, reglas } = req.body;
      const torneo = await torneosService.createTorneo({
        nombre,
        disciplinaId: Number(disciplinaId),
        categoriaId: Number(categoriaId),
        tipo,
        formato,
        temporada,
        fechaInicio: new Date(fechaInicio),
        fechaFin: new Date(fechaFin),
        estado,
        reglas
      });
      res.status(201).json(torneo);
    } catch (error) {
      res.status(500).json({ error: 'Error al crear torneo' });
    }
  }

  async updateTorneo(req: Request, res: Response) {
    try {
      const { nombre, disciplinaId, categoriaId, tipo, formato, temporada, fechaInicio, fechaFin, estado, reglas } = req.body;
      const torneo = await torneosService.updateTorneo(Number(req.params.id), {
        nombre,
        disciplinaId: disciplinaId ? Number(disciplinaId) : undefined,
        categoriaId: categoriaId ? Number(categoriaId) : undefined,
        tipo,
        formato,
        temporada,
        fechaInicio: fechaInicio ? new Date(fechaInicio) : undefined,
        fechaFin: fechaFin ? new Date(fechaFin) : undefined,
        estado,
        reglas
      });
      res.json(torneo);
    } catch (error) {
      res.status(500).json({ error: 'Error al actualizar torneo' });
    }
  }

  async updateEstado(req: Request, res: Response) {
    try {
      const torneo = await torneosService.updateEstado(Number(req.params.id), req.body.estado);
      res.json(torneo);
    } catch (error) {
      res.status(500).json({ error: 'Error al actualizar estado' });
    }
  }
}

export const torneosController = new TorneosController();
