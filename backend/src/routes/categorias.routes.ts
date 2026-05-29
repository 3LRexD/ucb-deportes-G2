import { Router } from "express";
import { categoriasController } from "../controllers/categorias.controller";

const catRouter = Router();
catRouter.get('/',     categoriasController.getAll);
catRouter.post('/',    categoriasController.create);
catRouter.get('/:id',  categoriasController.getById);
catRouter.put('/:id',  categoriasController.update);

export const categoriasRouter = catRouter;