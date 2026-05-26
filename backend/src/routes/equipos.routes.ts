import { Router } from 'express';
import prisma from '../prisma';

const router = Router();

// GET /api/equipos
router.get('/', async (req, res) => {
  try {
    const { torneoId } = req.query;
    const equipos = await prisma.equipo.findMany({
      where: torneoId ? { torneoId: Number(torneoId) } : undefined,
      include: { jugadores: true, torneo: true },
      orderBy: { createdAt: 'desc' },
    });
    res.json(equipos);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener equipos' });
  }
});

// POST /api/equipos
router.post('/', async (req, res) => {
  try {
    const { nombre, carrera, torneoId, delegadoId, entrenadorId } = req.body;
    const equipo = await prisma.equipo.create({
      data: { nombre, carrera, torneoId: Number(torneoId), delegadoId, entrenadorId },
      include: { jugadores: true },
    });
    res.status(201).json(equipo);
  } catch (error) {
    console.error('ERROR crear equipo:', error); // ← agregar esto
    res.status(500).json({ error: 'Error al crear equipo' });
  }
});

// POST /api/equipos/:id/jugadores
router.post('/:id/jugadores', async (req, res) => {
  try {
    const { deportistaId, deportistaCi, deportistaNombre, numeroCamiseta, posicion } = req.body;
    const jugador = await prisma.equipoJugador.create({
      data: {
        equipoId:        Number(req.params.id),
        deportistaId:    Number(deportistaId),
        deportistaCi,
        deportistaNombre,
        numeroCamiseta,
        posicion,
        matriculaValidada: false,
      },
    });
    res.status(201).json(jugador);
  } catch (error) {
    res.status(500).json({ error: 'Error al agregar jugador' });
  }
});

// DELETE /api/equipos/:id/jugadores/:ci
router.delete('/:id/jugadores/:ci', async (req, res) => {
  try {
    await prisma.equipoJugador.deleteMany({
      where: {
        equipoId:     Number(req.params.id),
        deportistaCi: req.params.ci,
      },
    });
    res.json({ message: 'Jugador removido del equipo' });
  } catch (error) {
    res.status(500).json({ error: 'Error al remover jugador' });
  }
});

export default router;