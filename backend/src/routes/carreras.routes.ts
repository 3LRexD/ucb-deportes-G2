import { Router } from 'express';
import { carrerasController } from '../controllers/carreras.controller';

const router = Router();

router.get('/', carrerasController.getCarreras);

export default router;