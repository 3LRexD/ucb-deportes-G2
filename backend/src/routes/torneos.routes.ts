import { Router } from 'express';
import { torneosController } from '../controllers/torneos.controller';

const router = Router();

router.get('/', torneosController.getTorneos);
router.get('/:id', torneosController.getTorneoById);
router.post('/', torneosController.createTorneo);
router.put('/:id', torneosController.updateTorneo);
router.patch('/:id/estado', torneosController.updateEstado);

export default router;