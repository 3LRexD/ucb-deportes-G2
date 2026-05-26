import { Request, Response } from 'express';
import { categoriasService } from '../services/categorias.service';

export class CategoriasController {
  async getCategorias(_req: Request, res: Response) {
    try {
      const categorias = await categoriasService.getCategorias();
      res.json(categorias);
    } catch (error) {
      res.status(500).json({ error: 'Error al obtener categorías' });
    }
  }

  async createCategoria(req: Request, res: Response) {
    try {
      const { nombre, edadMin, edadMax, descripcion, activo } = req.body;
      const categoria = await categoriasService.createCategoria({
        nombre,
        edadMin: Number(edadMin),
        edadMax: Number(edadMax),
        descripcion,
        activo
      });
      res.status(201).json(categoria);
    } catch (error) {
      res.status(500).json({ error: 'Error al crear categoría' });
    }
  }

  async updateCategoria(req: Request, res: Response) {
    try {
      const { nombre, edadMin, edadMax, descripcion, activo } = req.body;
      const categoria = await categoriasService.updateCategoria(Number(req.params.id), {
        nombre,
        edadMin: Number(edadMin),
        edadMax: Number(edadMax),
        descripcion,
        activo
      });
      res.json(categoria);
    } catch (error) {
      res.status(500).json({ error: 'Error al actualizar categoría' });
    }
  }

  async toggleCategoria(req: Request, res: Response) {
    try {
      const categoria = await categoriasService.toggleCategoria(Number(req.params.id));
      if (!categoria) {
        res.status(404).json({ error: 'Categoría no encontrada' });
        return;
      }
      res.json(categoria);
    } catch (error) {
      res.status(500).json({ error: 'Error al actualizar categoría' });
    }
  }
}

export const categoriasController = new CategoriasController();
