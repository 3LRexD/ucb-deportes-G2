import { Router } from 'express';
import { sesionesController } from '../controllers/sesionies.controller';


const router = Router();

router.get('/', sesionesController.getSesiones);
router.get('/equipos-disciplinas', sesionesController.getEquiposConDisciplinas);
router.get('/:id', sesionesController.getSesionById);
router.post('/', sesionesController.crearSesion);
router.delete('/:id', sesionesController.eliminarSesion);

export default router;