import { Router } from 'express';
import { torneosController } from '../controllers/torneos.controller';

const router = Router();

router.get('/',          torneosController.getAll);
router.post('/',         torneosController.create);
router.get('/:id',       torneosController.getById);
router.put('/:id',       torneosController.update);
router.delete('/:id',    torneosController.delete);
router.patch('/:id/estado', torneosController.cambiarEstado);
router.get('/:id/tabla-posiciones', torneosController.getTablasPosiciones);

export default router;