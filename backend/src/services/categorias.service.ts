import prisma from '../prisma';

export class CategoriasService {
  async getCategorias() {
    return await prisma.categoria.findMany({
      orderBy: { edadMin: 'asc' },
    });
  }

  async createCategoria(data: { nombre: string; edadMin: number; edadMax: number; descripcion?: string; activo?: boolean }) {
    return await prisma.categoria.create({
      data,
    });
  }

  async updateCategoria(id: number, data: { nombre: string; edadMin: number; edadMax: number; descripcion?: string; activo?: boolean }) {
    return await prisma.categoria.update({
      where: { id },
      data,
    });
  }

  async toggleCategoria(id: number) {
    const actual = await prisma.categoria.findUnique({ where: { id } });
    if (!actual) return null;
    return await prisma.categoria.update({
      where: { id },
      data:  { activo: !actual.activo },
    });
  }
}

export const categoriasService = new CategoriasService();
