import { Router } from 'express';
import { fixturesController } from '../controllers/fixtures.controller';

const router = Router();

router.get('/', fixturesController.getFixtures);
router.post('/generar', fixturesController.generarFixture);

export default router;