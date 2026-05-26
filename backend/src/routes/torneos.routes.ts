import { Router } from 'express';
import prisma from '../prisma';

const router = Router();

// GET /api/torneos
router.get('/', async (_req, res) => {
  try {
    const torneos = await prisma.torneo.findMany({
      include: {
        disciplina: true,
        categoria: true,
        equipos: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(torneos);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener torneos' });
  }
});

// GET /api/torneos/:id
router.get('/:id', async (req, res) => {
  try {
    const torneo = await prisma.torneo.findUnique({
      where: { id: Number(req.params.id) },
      include: {
        disciplina: true,
        categoria: true,
        equipos: { include: { jugadores: true } },
        partidos: true,
      },
    });
    if (!torneo) return res.status(404).json({ error: 'Torneo no encontrado' });
    res.json(torneo);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener torneo' });
  }
});

// POST /api/torneos
router.post('/', async (req, res) => {
  try {
    const { nombre, disciplinaId, categoriaId, tipo, formato,
            temporada, fechaInicio, fechaFin, estado, reglas } = req.body;

    const torneo = await prisma.torneo.create({
      data: {
        nombre,
        disciplinaId: Number(disciplinaId),
        categoriaId:  Number(categoriaId),
        tipo,
        formato,
        temporada,
        fechaInicio:  new Date(fechaInicio),
        fechaFin:     new Date(fechaFin),
        estado:       estado ?? 'planificado',
        reglas,
      },
      include: { disciplina: true, categoria: true },
    });
    res.status(201).json(torneo);
  } catch (error) {
    res.status(500).json({ error: 'Error al crear torneo' });
  }
});

// PUT /api/torneos/:id
router.put('/:id', async (req, res) => {
  try {
    const { nombre, disciplinaId, categoriaId, tipo, formato,
            temporada, fechaInicio, fechaFin, estado, reglas } = req.body;

    const torneo = await prisma.torneo.update({
      where: { id: Number(req.params.id) },
      data: {
        nombre,
        disciplinaId: Number(disciplinaId),
        categoriaId:  Number(categoriaId),
        tipo,
        formato,
        temporada,
        fechaInicio:  new Date(fechaInicio),
        fechaFin:     new Date(fechaFin),
        estado,
        reglas,
      },
      include: { disciplina: true, categoria: true },
    });
    res.json(torneo);
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar torneo' });
  }
});

// PATCH /api/torneos/:id/estado
router.patch('/:id/estado', async (req, res) => {
  try {
    const torneo = await prisma.torneo.update({
      where: { id: Number(req.params.id) },
      data:  { estado: req.body.estado },
    });
    res.json(torneo);
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar estado' });
  }
});

export default router;