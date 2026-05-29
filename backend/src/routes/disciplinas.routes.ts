import { Router } from 'express';
import { disciplinasController } from '../controllers/disciplinas.controller';


const discRouter = Router();
discRouter.get('/',            disciplinasController.getAll);
discRouter.post('/',           disciplinasController.create);
discRouter.get('/:id',         disciplinasController.getById);
discRouter.put('/:id',         disciplinasController.update);
discRouter.patch('/:id/toggle', disciplinasController.toggleActivo);

export const disciplinasRouter = discRouter;
