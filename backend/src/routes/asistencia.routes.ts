import { Router } from 'express';
import { asistenciaController } from '../controllers/asistencia.controller';

const router = Router();

router.get('/sesion/:sesionId', asistenciaController.getAsistenciaBySesion);
router.get('/equipo/:equipoId/jugadores', asistenciaController.getJugadoresByEquipo);
router.get('/equipo/:equipoId/resumen', asistenciaController.getResumenAsistencia);
router.post('/guardar', asistenciaController.guardarAsistencia);

export default router;