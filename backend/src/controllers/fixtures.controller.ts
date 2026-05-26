import { Request, Response } from 'express';
import { fixturesService } from '../services/fixtures.service';

export class FixturesController {
  async getFixtures(req: Request, res: Response) {
    try {
      const torneoId = req.query.torneoId ? Number(req.query.torneoId) : undefined;
      const fixtures = await fixturesService.getFixtures(torneoId);
      res.json(fixtures);
    } catch (error) {
      res.status(500).json({ error: 'Error al obtener fixtures' });
    }
  }

  async generarFixture(req: Request, res: Response) {
    try {
      const { torneoId, partidos, formato } = req.body;
      console.log('Partidos recibidos:', JSON.stringify(partidos[0], null, 2));
      
      const result = await fixturesService.generarFixture(Number(torneoId), partidos, formato);
      
      res.status(201).json(result);
    } catch (error) {
      console.error('ERROR generar fixture:', error);
      res.status(500).json({ error: 'Error al generar fixture' });
    }
  }
}

export const fixturesController = new FixturesController();
