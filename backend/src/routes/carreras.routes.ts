import { Router } from 'express';
import prisma from '../prisma';

const router = Router();

router.get('/', async (_req, res) => {
  try {
    const carreras = await prisma.carrera.findMany({
      where:   { activo: true },
      orderBy: { nombre: 'asc' },
    });
    res.json(carreras);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener carreras' });
  }
});

export default router;