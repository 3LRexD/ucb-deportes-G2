import { Router } from 'express';
import { partidosController } from '../controllers/partidos.controller';

const router = Router();

router.get('/pendientes',          partidosController.getPendientes);
router.get('/torneo/:torneoId',    partidosController.getByTorneo);
router.get('/:id',                 partidosController.getById);
router.get('/:id/jugadores',       partidosController.getJugadoresDePartido);
router.post('/:id/resultado',      partidosController.registrarResultado);

export default router;