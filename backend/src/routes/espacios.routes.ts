import { Router } from 'express';
import { espaciosController } from '../controllers/espacios.controller';

const router = Router();

router.get('/', espaciosController.getEspacios);

export default router;