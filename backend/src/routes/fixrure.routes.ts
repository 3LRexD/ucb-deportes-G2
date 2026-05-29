import { Router } from 'express';
import { fixturesController } from '../controllers/fixture.controller';


const router = Router();

router.get('/torneos/:torneoId/equipos', fixturesController.getEquiposByTorneo);

router.get('/torneos/:torneoId/fixtures', fixturesController.getFixturesByTorneo);

router.get('/torneos/:torneoId/fases-bloqueadas', fixturesController.getFasesBloqueadas);

router.get('/partidos-fixture', fixturesController.getPartidosByTorneo);

router.post('/generar', fixturesController.generarFixture);

router.post('/partido-manual', fixturesController.crearPartidoManual);

router.put('/partidos/:id', fixturesController.actualizarPartido);

router.delete('/:id', fixturesController.eliminarFixture);

export default router;