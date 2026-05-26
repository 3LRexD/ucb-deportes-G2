import { Router } from 'express';
import { equiposController } from '../controllers/equipos.controller';

const router = Router();

router.get('/', equiposController.getEquipos);
router.post('/', equiposController.createEquipo);
router.post('/:id/jugadores', equiposController.addJugador);
router.delete('/:id/jugadores/:ci', equiposController.removeJugador);

export default router;