import prisma from '../prisma';

export class EspaciosService {
  async getActiveEspacios() {
    return await prisma.espacio.findMany({
      where: { activo: true },
      orderBy: { nombre: 'asc' },
    });
  }
}

export const espaciosService = new EspaciosService();
