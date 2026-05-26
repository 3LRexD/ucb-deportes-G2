import { Router } from 'express';
import { categoriasController } from '../controllers/categorias.controller';

const router = Router();

router.get('/', categoriasController.getCategorias);
router.post('/', categoriasController.createCategoria);
router.put('/:id', categoriasController.updateCategoria);
router.patch('/:id/toggle', categoriasController.toggleCategoria);

export default router;