import { Router } from 'express';
import { partidosController } from '../controllers/partidos.controller';

const router = Router();

router.get('/', partidosController.getPartidos);
router.put('/:id', partidosController.registrarResultado);

export default router;