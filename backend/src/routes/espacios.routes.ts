import { Router } from 'express';
import prisma from '../prisma';

const router = Router();

router.get('/', async (_req, res) => {
  try {
    const espacios = await prisma.espacio.findMany({
      where: { activo: true },
      orderBy: { nombre: 'asc' },
    });
    res.json(espacios);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener espacios' });
  }
});

export default router;