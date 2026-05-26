import { Router } from 'express';
import prisma from '../prisma';

const router = Router();

// GET /api/categorias
router.get('/', async (_req, res) => {
  try {
    const categorias = await prisma.categoria.findMany({
      orderBy: { edadMin: 'asc' },
    });
    res.json(categorias);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener categorías' });
  }
});

// POST /api/categorias
router.post('/', async (req, res) => {
  try {
    const { nombre, edadMin, edadMax, descripcion, activo } = req.body;
    const categoria = await prisma.categoria.create({
      data: { nombre, edadMin: Number(edadMin), edadMax: Number(edadMax), descripcion, activo },
    });
    res.status(201).json(categoria);
  } catch (error) {
    res.status(500).json({ error: 'Error al crear categoría' });
  }
});

// PUT /api/categorias/:id
router.put('/:id', async (req, res) => {
  try {
    const { nombre, edadMin, edadMax, descripcion, activo } = req.body;
    const categoria = await prisma.categoria.update({
      where: { id: Number(req.params.id) },
      data:  { nombre, edadMin: Number(edadMin), edadMax: Number(edadMax), descripcion, activo },
    });
    res.json(categoria);
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar categoría' });
  }
});

// PATCH /api/categorias/:id/toggle
router.patch('/:id/toggle', async (req, res) => {
  try {
    const actual = await prisma.categoria.findUnique({ where: { id: Number(req.params.id) } });
    if (!actual) return res.status(404).json({ error: 'Categoría no encontrada' });
    const categoria = await prisma.categoria.update({
      where: { id: Number(req.params.id) },
      data:  { activo: !actual.activo },
    });
    res.json(categoria);
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar categoría' });
  }
});

export default router;